// CoverImage.jsx — 1080x878. 60% editorial photo, 40% paper-white type.
// Phase 1 placeholder: reuses 3Q-era photography SVGs. Phase 1.5 swaps in
// Pop Monster product photos.
function CoverImage({ width = 1080, height = 878, photo = 'bowl' }) {
  const photos = {
    bowl: window.__resources.ph_bowl,
    ink:  window.__resources.ph_ink,
    linen:window.__resources.ph_linen,
    stalk:window.__resources.ph_stalk,
  };
  const s = (n) => `${(n / 1080) * width}px`;
  return (
    <div
      style={{
        width, height,
        display: 'grid',
        gridTemplateColumns: '60% 40%',
        background: 'var(--color-paper)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left — photography */}
      <div style={{
        backgroundImage: `url(${photos[photo]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}/>

      {/* Right — paper + type block */}
      <div style={{
        padding: `${s(80)} ${s(56)}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--color-paper)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 300,
            fontSize: s(14), letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--color-gold)',
          }}>CAR CARE · DIY</div>
          <div style={{
            width: s(40), height: 1, background: 'var(--color-gold)',
            margin: `${s(24)} 0 ${s(40)}`,
          }}/>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300,
            fontSize: s(38), lineHeight: 1.35,
            letterSpacing: '0.15em', color: 'var(--color-black)',
          }}>
            輕鬆守護<br/>愛車的<br/>怪獸。<br/>新手也能<br/>上手。
          </div>
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300,
            fontSize: s(28), letterSpacing: '0.2em', color: 'var(--color-black)',
          }}>Pop Monster</div>
          <div style={{
            marginTop: s(8),
            fontFamily: 'var(--font-sans)', fontWeight: 300,
            fontSize: s(11), letterSpacing: '0.3em', color: 'var(--color-stone)',
          }}>LINE · @popmonster</div>
        </div>
      </div>
    </div>
  );
}

window.CoverImage = CoverImage;
