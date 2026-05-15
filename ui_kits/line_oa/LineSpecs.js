// LineSpecs.jsx — single source of truth for the Pop Monster LINE OA.
// Pop Monster (泡泡怪獸) is a Taiwan car-care brand: easy-to-use, zero-risk,
// playful-pro DIY products sold via popmonster.vip + Shopee.
//
// Phase 1 ships with placeholder visual (3Q editorial style) and real Pop
// Monster copy. Phase 1.5 swaps colors + product photos when user delivers.

window.LINE_SPECS = {
  account: {
    displayName: 'Pop Monster · 泡泡怪獸',
    nameSub: 'CAR CARE · TAIWAN',
    lineId: '@popmonster', // placeholder — user replaces with real @ID after OA registration
    statusMessage: '輕鬆守護愛車的怪獸', // 10 chars (LINE limit 20)
    about: [
      '泡泡怪獸 · 台灣車美容 DIY 品牌。',
      '新手也能上手，零風險守護愛車。',
      '——',
      '・天使鍍膜 · 日常防護',
      '・極速封體蠟 · 5 分鐘速保',
      '・鋁圈一擦淨 · 安全配方',
      '・玻璃驅水油膜 · 雨天視野',
      '・內裝清潔劑 · 一瓶到底',
    ].join('\n'),
  },

  avatar: {
    spec: '640 × 640 px · JPG/PNG · ≤ 3 MB',
    filename: 'POP-MONSTER_avatar_640x640.png',
    note: '圓形裁切，安全區域留 10% 邊緣',
  },

  cover: {
    spec: '1080 × 878 px · JPG/PNG · ≤ 3 MB',
    filename: 'POP-MONSTER_cover_1080x878.jpg',
    note: '上方 150px 會被頭像 + 帳號名遮住，重要資訊放下半部 / 右側',
  },

  richMenu: {
    spec: '2500 × 1686 px · JPG/PNG · ≤ 1 MB',
    filename: 'POP-MONSTER_richmenu_2500x1686.jpg',
    template: '大型 6 格 (1 hero band + 4 cells)',
    layout: 'custom: 1×800 hero + 4×886 grid',
    tapZones: [
      {
        id: 'A',
        label: 'HERO BAND',
        zh: '官網',
        x: 0, y: 0, w: 2500, h: 800,
        action: { type: 'uri', uri: 'https://popmonster.vip' },
      },
      {
        id: 'B', label: 'CELL 1', zh: '看產品',
        x: 0, y: 800, w: 625, h: 886,
        action: { type: 'postback', data: 'menu:catalog' },
      },
      {
        id: 'C', label: 'CELL 2', zh: 'DIY 教學',
        x: 625, y: 800, w: 625, h: 886,
        action: { type: 'postback', data: 'menu:howto' },
      },
      {
        id: 'D', label: 'CELL 3', zh: '蝦皮選購',
        x: 1250, y: 800, w: 625, h: 886,
        action: { type: 'uri', uri: 'https://s.shopee.tw/3fzneUIhU0' },
      },
      {
        id: 'E', label: 'CELL 4', zh: '客服',
        x: 1875, y: 800, w: 625, h: 886,
        action: { type: 'postback', data: 'menu:support' },
      },
    ],
  },

  greeting: {
    spec: 'LINE Official Account → 開始訊息 (Greeting)',
    note: '加入官方帳號後第一則訊息。可包含文字 + 1 張圖片 + 1 個 LINE 卡片。',
    text: [
      '歡迎來到 Pop Monster · 泡泡怪獸 🚗',
      '',
      '我們做的是「新手也能上手」的車美容 DIY。',
      '從鍍膜到內裝，每瓶都設計成 — 你不必會，也不會壞。',
      '',
      '👉 點下方圖文選單「看產品」',
      '或直接打字：鍍膜 / 蠟 / 鋁圈 / 玻璃 / 內裝 / 教學 / 價格',
      '我都讀得到。',
    ].join('\n'),
  },

  awayMessage: {
    spec: '非營業時間自動回覆 — Phase 1 由 AI fallback 處理',
    text: '訊息收到了，小怪稍後親自回覆你 🙏',
  },

  // 13 keyword groups. Anything not matching → AI fallback (Claude Haiku 4.5)
  autoReplies: [
    {
      group: 'greet',
      keywords: ['你好', 'hi', 'Hi', 'HI', '哈囉', '嗨'],
      response: '哈囉！我是 Pop Monster 小怪 🐾\n\n要看產品？直接打：\n・鍍膜 / 蠟 / 鋁圈 / 玻璃 / 內裝\n\n或點下方圖文選單。',
      carousel: true,
    },
    {
      group: 'catalog',
      keywords: ['產品', '商品', '賣什麼', '有什麼', 'catalog'],
      response: '目前主推 5 款，都是 DIY 友善配方：\n\n🅐 天使鍍膜 · 日常防護\n🅑 極速封體蠟 · 5 分鐘速保\n🅒 鋁圈一擦淨 · 安全酸鹼\n🅓 玻璃驅水油膜 · 雨天視野\n🅔 內裝清潔劑 · 一瓶到底\n\n回任一品名看詳細。',
      carousel: true,
    },
    {
      group: 'coating',
      keywords: ['鍍膜', '天使', 'angel', 'Angel', 'coating'],
      response: '【天使鍍膜守護 · NT$890】\n\n・日常防護鍍膜，水痕／氧化／鳥屎酸\n・布擦上去就好，新手 5 分鐘搞定\n・一瓶約用 3 個月（一台中型車）\n・通過 pH 安全測試，不傷烤漆\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0',
    },
    {
      group: 'wax',
      keywords: ['蠟', '封體', 'wax', '極速'],
      response: '【極速封體蠟 · NT$590】\n\n・噴上去 → 擦掉 → 完成（真的 5 分鐘）\n・撥水效果立刻看得到\n・適合洗完車後加強亮度\n・一瓶可施作 8–10 次\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0',
    },
    {
      group: 'wheel',
      keywords: ['輪圈', '鋁圈', '輪胎', 'wheel'],
      response: '【鋁圈一擦淨 · NT$490】\n\n・遇鐵粉變紫色 — 你會看到髒在哪\n・pH 中性配方，不咬鋁圈\n・噴上等 1 分鐘 → 沖水即可\n・安全到深夜在自家車庫也敢用\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0',
    },
    {
      group: 'glass',
      keywords: ['玻璃', '驅水', '油膜', 'glass'],
      response: '【玻璃驅水油膜清潔劑 · NT$390】\n\n・先除油膜，再上驅水層 — 一瓶兩用\n・雨天視線立刻清楚\n・效果撐約 1–2 個月\n・前擋／後擋／後照鏡都能用\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0',
    },
    {
      group: 'interior',
      keywords: ['內裝', '真皮', '座椅', '方向盤'],
      response: '【內裝清潔劑 · NT$390】\n\n・真皮／塑膠／布料 一瓶到底\n・免水洗、噴上擦掉就乾淨\n・無香配方，怕香味的人也能用\n・含護劑成分，不會擦完發白\n\n👉 蝦皮下單：https://s.shopee.tw/3fzneUIhU0',
    },
    {
      group: 'howto',
      keywords: ['教學', '怎麼用', 'DIY', '步驟', '新手'],
      response: '新手三步驟：\n\n1. 先洗車（用清水或洗車精都行）\n2. 擦乾車身\n3. 噴／滴上產品 → 擦勻 → 收乾\n\n📺 詳細教學影片：https://popmonster.vip\n\n小提醒：第一次先做引擎蓋一小區，習慣手感再整車。',
    },
    {
      group: 'price',
      keywords: ['價格', '多少', '售價', '費用'],
      response: '價格一覽：\n\n・天使鍍膜 NT$890\n・極速封體蠟 NT$590\n・鋁圈一擦淨 NT$490\n・玻璃驅水 NT$390\n・內裝清潔 NT$390\n\n蝦皮經常有組合優惠：\nhttps://s.shopee.tw/3fzneUIhU0',
    },
    {
      group: 'shop',
      keywords: ['哪裡買', '蝦皮', '購買', '通路', '買得到'],
      response: 'Pop Monster 主要在蝦皮：\n👉 https://s.shopee.tw/3fzneUIhU0\n\n網站也能下單（同價格）：\n👉 https://popmonster.vip',
    },
    {
      group: 'shipping',
      keywords: ['出貨', '物流', '運費', '取貨'],
      response: '蝦皮下單後：\n\n・台灣本島 24–48 小時出貨\n・滿 NT$490 蝦皮全站免運\n・可選宅配 / 超商取貨\n\n出貨後蝦皮會自動推追蹤連結給你。',
    },
    {
      group: 'support',
      keywords: ['客服', '聯絡', '問題', '退換'],
      response: '客服請走這裡：\n\n・蝦皮聊聊（最快）：訂單頁右下\n・Email：service@popmonster.vip\n・LINE：直接打字給我，我會轉給真人',
    },
    {
      group: 'about',
      keywords: ['關於', '是誰', '品牌', '故事'],
      response: '我們是一群開了 10 年車的工程師。\n\n受夠了：\n・看不懂的成分表\n・洗車後手酸到隔天\n・洗車店收費沒個準\n\n所以做了 Pop Monster — 一個讓「自己保養車」變得跟「洗碗」一樣簡單的品牌。\n\n更多：https://popmonster.vip',
    },
  ],

  // Postback (rich menu tap) → synthetic intent text routed back through autoReplies
  postbackMap: {
    'menu:catalog': '產品',
    'menu:howto':   '教學',
    'menu:support': '客服',
  },

  carouselPush: {
    title: 'Pop Monster · 5 款主推',
    cards: [
      { eyebrow: 'NO. 01', title: '天使鍍膜\n日常防護',     meta: 'NT$890 · 易用',
        action: { type: 'message', text: '鍍膜' } },
      { eyebrow: 'NO. 02', title: '極速封體蠟\n5 分鐘速保', meta: 'NT$590 · 撥水',
        action: { type: 'message', text: '蠟' } },
      { eyebrow: 'NO. 03', title: '鋁圈一擦淨\n安全配方',   meta: 'NT$490 · pH 中性',
        action: { type: 'message', text: '鋁圈' } },
      { eyebrow: 'NO. 04', title: '玻璃驅水油膜\n雨天清晰', meta: 'NT$390 · 一瓶兩用',
        action: { type: 'message', text: '玻璃' } },
    ],
  },

  checklist: [
    { id: 'cover',   label: '上傳封面圖 Cover',                detail: '1080 × 878 px',           done: false },
    { id: 'avatar',  label: '上傳大頭照 Avatar',                detail: '640 × 640 px',            done: false },
    { id: 'name',    label: '設定帳號名稱 + 狀態消息',         detail: '帳號名 + 19 字內',         done: false },
    { id: 'about',   label: '填寫 About / 介紹',                detail: 'LINE Profile 頁',          done: false },
    { id: 'greet',   label: '關閉 OA Manager 開始訊息',          detail: 'Worker 接管',              done: false },
    { id: 'menu',    label: '上傳圖文選單 Rich Menu',           detail: '2500 × 1686 + tap zones', done: false },
    { id: 'reply',   label: '關閉 OA Manager 關鍵字自動回覆',    detail: 'Worker 處理 13 組 + AI fallback', done: false },
    { id: 'away',    label: '關閉 OA Manager 非營業時間訊息',    detail: 'AI fallback by Worker',    done: false },
    { id: 'push',    label: '準備首推輪播訊息',                  detail: '4 張卡 + tap actions',    done: false },
    { id: 'qa',      label: '上線前 QA — 每個按鈕都點過',         detail: '13 keywords + 4 menu cells + AI fallback', done: false },
  ],
};
