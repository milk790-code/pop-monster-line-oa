// Avatar.jsx — 640x640 circle. "POP" mark + gold hairline + EN sublabel.
// Designed to stay legible at 56px (LINE thumb) all the way to 640.
// Phase 1 placeholder — Phase 1.5 swaps in Pop Monster real logo.
function Avatar({ size = 640, ring = false }) {
  const px = (n) => `${(n / 640) * size}px`;
  return (
    <div
      className="hat-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-paper)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: ring ? '0 0 0 2px rgba(184,146,74,0.35)' : 'none',
        flex: '0 0 auto',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          fontSize: px(220),
          lineHeight: 1,
          letterSpacing: '0.04em',
          color: 'var(--color-black)',
          marginTop: px(-10),
        }}
      >
        POP
      </div>
      <div
        style={{
          width: px(40),
          height: '1px',
          background: 'var(--color-gold)',
          marginTop: px(28),
        }}
      />
      <div
        style={{
          marginTop: px(22),
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: px(20),
          letterSpacing: '0.3em',
          color: 'var(--color-black)',
        }}
      >
        MONSTER
      </div>
    </div>
  );
}

window.Avatar = Avatar;
