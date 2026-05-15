// WelcomeCard.jsx — 1040x1040. Top photo / bottom type block.
function WelcomeCard({ width = 1040 }) {
  const ratio = width / 1040;
  const height = 1040 * ratio;
  const s = (n) => `${n * ratio}px`;

  return (
    <div style={{
      width, height,
      background: 'var(--color-paper)',
      display: 'grid',
      gridTemplateRows: '1fr 1fr',
      overflow: 'hidden',
    }}>
      <div style={{
        backgroundImage: `url(${window.__resources.ph_envelope})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}/>
      <div style={{
        padding: `${s(72)} ${s(64)}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'center',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 300,
            fontSize: s(14), letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--color-gold)',
          }}>WELCOME</div>
          <div style={{
            margin: `${s(24)} auto`, width: s(40), height: 1, background: 'var(--color-gold)',
          }}/>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300,
            fontSize: s(56), lineHeight: 1.3,
            letterSpacing: '0.15em', color: 'var(--color-black)',
          }}>新手也能上手，<br/>零風險守護愛車。</div>
          <div style={{
            marginTop: s(28),
            fontFamily: 'var(--font-sans)', fontWeight: 300,
            fontSize: s(18), lineHeight: 1.8,
            letterSpacing: '0.05em', color: 'var(--color-ink)',
            maxWidth: s(720),
          }}>
            從鍍膜到內裝，每瓶都設計成 —<br/>
            你不必會，也不會壞。Pop Monster 陪你動手。
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(8) }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300,
            fontSize: s(22), letterSpacing: '0.2em', color: 'var(--color-black)',
          }}>Pop Monster · 泡泡怪獸</div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 300,
            fontSize: s(11), letterSpacing: '0.3em', color: 'var(--color-stone)',
          }}>LINE · @popmonster</div>
        </div>
      </div>
    </div>
  );
}

window.WelcomeCard = WelcomeCard;
