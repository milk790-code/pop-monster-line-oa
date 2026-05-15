// Cloudflare Worker — LINE OA webhook for Pop Monster (泡泡怪獸).
// Handles `follow` events (welcome) and `message`/`postback` events with
// 13 keyword groups + Claude Haiku AI fallback for anything unmatched.
//
// Required env vars (set in Cloudflare dashboard or via wrangler secret):
//   LINE_CHANNEL_ACCESS_TOKEN   — long-lived from LINE Developers Console
//   LINE_CHANNEL_SECRET         — Basic settings → Channel secret
//   ANTHROPIC_API_KEY           — for AI fallback (optional; missing → text fallback)
//   PNG_BASE_URL                — https://milk790-code.github.io/pop-monster-line-oa/assets/exports

const WELCOME_TEXT = [
  '歡迎來到 Pop Monster · 泡泡怪獸 🚗',
  '',
  '我們做的是「新手也能上手」的車美容 DIY。',
  '從鍍膜到內裝，每瓶都設計成 — 你不必會，也不會壞。',
  '',
  '👉 點下方圖文選單「看產品」',
  '或直接打字：鍍膜 / 蠟 / 鋁圈 / 玻璃 / 內裝 / 教學 / 價格',
  '我都讀得到。',
].join('\n');

const AI_FALLBACK_ERROR_TEXT = '訊息收到了，小怪稍後親自回覆你 🙏';

// 13 keyword groups. Order matters: more-specific groups first.
const AUTO_REPLIES = [
  { group: 'greet',
    keywords: ['你好', 'hi', 'Hi', 'HI', '哈囉', '嗨'],
    response: '哈囉！我是 Pop Monster 小怪 🐾\n\n要看產品？直接打：\n・鍍膜 / 蠟 / 鋁圈 / 玻璃 / 內裝\n\n或點下方圖文選單。',
    carousel: true },

  { group: 'catalog',
    keywords: ['產品', '商品', '賣什麼', '有什麼', 'catalog'],
    response: '目前主推 5 款，都是 DIY 友善配方：\n\n🅐 天使鍍膜 · 日常防護\n🅑 極速封體蠟 · 5 分鐘速保\n🅒 鋁圈一擦淨 · 安全酸鹼\n🅓 玻璃驅水油膜 · 雨天視野\n🅔 內裝清潔劑 · 一瓶到底\n\n回任一品名看詳細。',
    carousel: true },

  { group: 'coating',
    keywords: ['鍍膜', '天使', 'angel', 'Angel', 'coating'],
    response: '【天使鍍膜守護 · NT$890】\n\n・日常防護鍍膜，水痕／氧化／鳥屎酸\n・布擦上去就好，新手 5 分鐘搞定\n・一瓶約用 3 個月（一台中型車）\n・通過 pH 安全測試，不傷烤漆\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0' },

  { group: 'wax',
    keywords: ['蠟', '封體', '極速', 'wax'],
    response: '【極速封體蠟 · NT$590】\n\n・噴上去 → 擦掉 → 完成（真的 5 分鐘）\n・撥水效果立刻看得到\n・適合洗完車後加強亮度\n・一瓶可施作 8–10 次\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0' },

  { group: 'wheel',
    keywords: ['輪圈', '鋁圈', '輪胎', 'wheel'],
    response: '【鋁圈一擦淨 · NT$490】\n\n・遇鐵粉變紫色 — 你會看到髒在哪\n・pH 中性配方，不咬鋁圈\n・噴上等 1 分鐘 → 沖水即可\n・安全到深夜在自家車庫也敢用\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0' },

  { group: 'glass',
    keywords: ['玻璃', '驅水', '油膜', 'glass'],
    response: '【玻璃驅水油膜清潔劑 · NT$390】\n\n・先除油膜，再上驅水層 — 一瓶兩用\n・雨天視線立刻清楚\n・效果撐約 1–2 個月\n・前擋／後擋／後照鏡都能用\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0' },

  { group: 'interior',
    keywords: ['內裝', '真皮', '座椅', '方向盤'],
    response: '【內裝清潔劑 · NT$390】\n\n・真皮／塑膠／布料 一瓶到底\n・免水洗、噴上擦掉就乾淨\n・無香配方，怕香味的人也能用\n・含護劑成分，不會擦完發白\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0' },

  { group: 'howto',
    keywords: ['教學', '怎麼用', 'DIY', '步驟', '新手'],
    response: '新手三步驟：\n\n1. 先洗車（用清水或洗車精都行）\n2. 擦乾車身\n3. 噴／滴上產品 → 擦勻 → 收乾\n\n📺 詳細教學影片：https://popmonster.vip\n\n小提醒：第一次先做引擎蓋一小區，習慣手感再整車。' },

  { group: 'price',
    keywords: ['價格', '多少', '售價', '費用'],
    response: '價格一覽：\n\n・天使鍍膜 NT$890\n・極速封體蠟 NT$590\n・鋁圈一擦淨 NT$490\n・玻璃驅水 NT$390\n・內裝清潔 NT$390\n\n蝦皮經常有組合優惠：\nhttps://s.shopee.tw/3fzneUIhU0' },

  { group: 'shop',
    keywords: ['哪裡買', '蝦皮', '購買', '通路', '買得到'],
    response: 'Pop Monster 主要在蝦皮：\n👉 https://s.shopee.tw/3fzneUIhU0\n\n網站也能下單（同價格）：\n👉 https://popmonster.vip' },

  { group: 'shipping',
    keywords: ['出貨', '物流', '運費', '取貨'],
    response: '蝦皮下單後：\n\n・台灣本島 24–48 小時出貨\n・滿 NT$490 蝦皮全站免運\n・可選宅配 / 超商取貨\n\n出貨後蝦皮會自動推追蹤連結給你。' },

  { group: 'support',
    keywords: ['客服', '聯絡', '問題', '退換'],
    response: '客服請走這裡：\n\n・蝦皮聊聊（最快）：訂單頁右下\n・Email：service@popmonster.vip\n・LINE：直接打字給我，我會轉給真人' },

  { group: 'about',
    keywords: ['關於', '是誰', '品牌', '故事'],
    response: '我們是一群開了 10 年車的工程師。\n\n受夠了：\n・看不懂的成分表\n・洗車後手酸到隔天\n・洗車店收費沒個準\n\n所以做了 Pop Monster — 一個讓「自己保養車」變得跟「洗碗」一樣簡單的品牌。\n\n更多：https://popmonster.vip' },
];

// Rich menu postback → synthetic user-intent text routed back through AUTO_REPLIES.
const POSTBACK_MAP = {
  'menu:catalog': '產品',
  'menu:howto':   '教學',
  'menu:support': '客服',
};

const CAROUSEL_CARDS = [
  { id: 1, action: { type: 'message', text: '鍍膜' } },
  { id: 2, action: { type: 'message', text: '蠟' } },
  { id: 3, action: { type: 'message', text: '鋁圈' } },
  { id: 4, action: { type: 'message', text: '玻璃' } },
];

// Product knowledge base for AI fallback. ~3KB — passed as system prompt.
const PRODUCT_KB = `Pop Monster (泡泡怪獸) — 台灣車美容 DIY 品牌、主打「新手也能上手、零風險守護愛車」。

## 五款主力產品

### 1. 天使鍍膜守護 (Angel Coating Guard) — NT$890
- 日常防護用鍍膜噴霧
- 防水痕、氧化、鳥屎酸蝕、酸雨
- 施作：洗完車擦乾，噴上後用布抹勻即可 (5 分鐘)
- 一瓶約用 3 個月（中型車）
- pH 安全測試合格，不咬烤漆、不咬塑件

### 2. 極速封體蠟 (Speed Wax) — NT$590
- 噴蠟，5 分鐘完成的撥水亮度劑
- 步驟：噴 → 擦 → 完成
- 與鍍膜可疊加：先鍍膜後封蠟
- 一瓶可施作 8–10 次

### 3. 鋁圈一擦淨 (Wheel Cleaner) — NT$490
- 含鐵粉指示劑 — 遇剎車粉變紫色
- pH 中性，不咬鋁圈電鍍
- 噴上等 1 分鐘 → 高壓水沖
- 適用所有鋁圈與輪胎側壁

### 4. 玻璃驅水油膜清潔劑 (Glass Cleaner) — NT$390
- 一瓶兩用：先除油膜、再上驅水層
- 效果撐 1–2 個月
- 適用前擋、後擋、後照鏡
- 雨天視線顯著改善

### 5. 內裝清潔劑 (Interior Detailer) — NT$390
- 真皮、塑膠、布料皆可
- 免水洗，噴上擦掉即可
- 無香配方
- 含護劑，不會發白、不會油膩

## 通路 & 物流
- 主要通路：蝦皮 https://s.shopee.tw/3fzneUIhU0
- 官網：https://popmonster.vip
- 台灣本島 24–48 小時出貨
- 蝦皮滿 NT$490 全站免運

## 品牌語氣
- 親切、像鄰居車友
- 講「人話」，不講術語
- 強調「零風險、新手也能上手」
- 偶爾用 🚗 🐾 🅐 emoji，不過量
- 適時提供蝦皮連結 https://s.shopee.tw/3fzneUIhU0
- 不確定的事情，就誠實說「我幫你轉真人客服」

## 客服指引
- 退換貨：依蝦皮平台政策
- 客服 Email：service@popmonster.vip
- LINE 上直接打字會轉給真人`;

// =============================================================================
// Handler
// =============================================================================

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        service: 'Pop Monster LINE OA webhook',
        ok: true,
        configured: {
          token: Boolean(env.LINE_CHANNEL_ACCESS_TOKEN),
          secret: Boolean(env.LINE_CHANNEL_SECRET),
          anthropic: Boolean(env.ANTHROPIC_API_KEY),
          png_base: env.PNG_BASE_URL || null,
        },
      }, null, 2), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const body = await request.text();
    const signature = request.headers.get('x-line-signature');
    if (!signature) return new Response('Missing signature', { status: 401 });
    const valid = await verifySignature(body, signature, env.LINE_CHANNEL_SECRET);
    if (!valid) return new Response('Invalid signature', { status: 401 });

    let payload;
    try { payload = JSON.parse(body); } catch { return new Response('Bad JSON', { status: 400 }); }

    const events = payload.events || [];
    for (const ev of events) {
      ctx.waitUntil(handleEvent(ev, env).catch(e => console.error('event error', e)));
    }
    return new Response('OK', { status: 200 });
  },
};

// =============================================================================
// Event routing
// =============================================================================

async function handleEvent(ev, env) {
  if (ev.type === 'follow') return sendWelcome(ev.replyToken, env);

  if (ev.type === 'message' && ev.message?.type === 'text') {
    return handleIntent(ev.message.text || '', ev.replyToken, env);
  }

  if (ev.type === 'postback') {
    const synthetic = POSTBACK_MAP[ev.postback?.data];
    if (synthetic) return handleIntent(synthetic, ev.replyToken, env);
  }
  // Ignore unfollow, join, leave, sticker, image, etc.
}

async function sendWelcome(replyToken, env) {
  const messages = [];
  if (env.PNG_BASE_URL) {
    messages.push({
      type: 'image',
      originalContentUrl: `${env.PNG_BASE_URL}/pop-monster-welcome-card-1040.png`,
      previewImageUrl: `${env.PNG_BASE_URL}/pop-monster-welcome-card-1040.png`,
    });
  }
  messages.push({ type: 'text', text: WELCOME_TEXT });
  return reply(replyToken, messages, env);
}

function matchKeyword(userText) {
  return AUTO_REPLIES.find(r => r.keywords.some(kw => userText.includes(kw)));
}

async function handleIntent(userText, replyToken, env) {
  const match = matchKeyword(userText);

  if (match) {
    const messages = [{ type: 'text', text: match.response }];
    if (match.carousel && env.PNG_BASE_URL) {
      messages.push(buildCarouselMessage(env.PNG_BASE_URL));
    }
    return reply(replyToken, messages, env);
  }

  // No keyword match — AI fallback (or text fallback if no API key)
  return aiReplyFallback(userText, replyToken, env);
}

function buildCarouselMessage(pngBase) {
  return {
    type: 'template',
    altText: 'Pop Monster · 5 款主推',
    template: {
      type: 'image_carousel',
      columns: CAROUSEL_CARDS.map(c => ({
        imageUrl: `${pngBase}/pop-monster-carousel-${String(c.id).padStart(2, '0')}-1040.png`,
        action: c.action,
      })),
    },
  };
}

// =============================================================================
// AI fallback — Claude Haiku 4.5 via direct fetch
// =============================================================================

async function aiReplyFallback(userText, replyToken, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return reply(replyToken, [{ type: 'text', text: AI_FALLBACK_ERROR_TEXT }], env);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 350,
        system: `你是 Pop Monster (泡泡怪獸) 的 LINE 客服助理「小怪」。請用以下產品資料、品牌語氣回答用戶問題。

${PRODUCT_KB}

回答規則：
- 用繁體中文，口語、親切
- 控制在 200 字內
- 如果問題你不確定，誠實說「這部分我幫你轉真人客服」並給 service@popmonster.vip
- 主動但不強迫推薦最相關的產品 + 蝦皮連結
- 不要編造價格或規格 — 上面沒寫的就說「我幫你查」`,
        messages: [{ role: 'user', content: userText }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error('Anthropic API error', res.status, errText);
      return reply(replyToken, [{ type: 'text', text: AI_FALLBACK_ERROR_TEXT }], env);
    }

    const data = await res.json();
    const replyText = data.content?.[0]?.type === 'text' ? data.content[0].text : null;
    if (!replyText) {
      console.error('Anthropic API empty content', JSON.stringify(data));
      return reply(replyToken, [{ type: 'text', text: AI_FALLBACK_ERROR_TEXT }], env);
    }
    return reply(replyToken, [{ type: 'text', text: replyText.trim() }], env);
  } catch (err) {
    clearTimeout(timeout);
    console.error('AI fallback failed', err.name, err.message);
    return reply(replyToken, [{ type: 'text', text: AI_FALLBACK_ERROR_TEXT }], env);
  }
}

// =============================================================================
// LINE API
// =============================================================================

async function reply(replyToken, messages, env) {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('LINE reply failed', res.status, text);
  }
}

// =============================================================================
// Signature verification — HMAC-SHA256(body) with channel secret, base64
// =============================================================================

async function verifySignature(body, signature, secret) {
  if (!secret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const computed = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (computed.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
