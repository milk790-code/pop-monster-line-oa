// RichMenu.jsx — 2500x1686. Hero band (800) + 4-grid (886).
// Pop Monster Phase 1: hero tap → popmonster.vip; 4 cells = catalog / DIY / Shopee / support.
function RichMenu({ width = 1000 }) {
  const ratio = width / 2500;
  const height = 1686 * ratio;
  const heroH = 800 * ratio;
  const gridH = 886 * ratio;
  const s = (n) => `${n * ratio}px`;

  const cells = [
    { icon: window.__resources.ic_consultation, zh: '看產品',     en: 'OUR PRODUCTS' },
    { icon: window.__resources.ic_camera,       zh: 'DIY 教學',   en: 'HOW TO USE' },
    { icon: window.__resources.ic_compass,      zh: '蝦皮選購',   en: 'BUY ON SHOPEE' },
    { icon: window.__resources.ic_clock,        zh: '客服',       en: 'TALK TO US' },
  ];

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', background: '#0A0A0A' }}>
      {/* Hero band — paper, photo left + type right */}
      <div style={{
        height: heroH,
        background: 'var(--color-paper)',
        display: 'grid',
        gridTemplateColumns: '40% 60%',
      }}>
        <div style={{
          backgroundImage: `url(${window.__resources.ph_palm})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}/>
        <div style={{
          padding: `${s(80)} ${s(80)}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: s(40),
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 300,
            fontSize: s(28), letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--color-gold)',
          }}>POP MONSTER · CAR CARE</div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300,
            fontSize: s(96), lineHeight: 1.15,
            letterSpacing: '0.15em', color: 'var(--color-black)',
          }}>輕鬆守護<br/>愛車的怪獸。</div>
          <div style={{ width: s(80), height: 1, background: 'var(--color-gold)' }}/>
        </div>
      </div>

      {/* 4-grid CTA */}
      <div style={{
        height: gridH,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'var(--color-gold)',
        gap: '1px',
      }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            background: '#0A0A0A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(40),
            padding: s(48),
          }}>
            <img src={c.icon} style={{ width: s(150), height: s(150) }}/>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(14) }}>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 300,
                fontSize: s(58), letterSpacing: '0.18em',
                color: 'var(--color-paper)',
              }}>{c.zh}</div>
              <div style={{ width: s(24), height: 1, background: 'var(--color-gold)' }}/>
              <div style={{
                fontFamily: 'var(--font-sans)', fontWeight: 300,
                fontSize: s(20), letterSpacing: '0.3em',
                color: 'var(--color-gold)',
              }}>{c.en}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.RichMenu = RichMenu;
