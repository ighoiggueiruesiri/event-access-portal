import { useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { Armchair, MapPin, Navigation, ShieldAlert, ShieldCheck } from 'lucide-react';
import { registeredGuests } from './guests';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

// Table may be empty while seating is still being planned.
// "12" -> "Table 12", "Magenta" -> "Magenta Table", "Head Table" stays as typed.
function formatSeating(table) {
  const t = table == null ? '' : String(table).trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) return `Table ${t}`;
  return /table/i.test(t) ? t : `${t} Table`;
}

// Deterministic barcode: the same guest always gets the same bars
// (the old version used Math.random(), so it changed on every render).
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Barcode({ value, reduce }) {
  const bars = useMemo(() => {
    const rand = mulberry32(hashString(value));
    return Array.from({ length: 64 }, () => 1 + Math.floor(rand() * 3));
  }, [value]);

  return (
    <div className="flex h-12 w-full items-stretch justify-between" aria-hidden="true">
      {bars.map((w, i) => (
        <motion.div
          key={i}
          className="origin-bottom bg-[#2A130A]"
          style={{ width: `${w}px` }}
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1 + i * 0.012, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

function Stage({ children }) {
  return (
    <div
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden p-4 font-sans selection:bg-[#5B3320] selection:text-white sm:p-8"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, #3b1f12 0%, #1a0b05 55%, #0d0503 100%)',
      }}
    >
      {/* Ambient light: cocoa warmth and a soft white bloom */}
      <div className="drift pointer-events-none absolute -left-24 -top-32 h-[460px] w-[460px] rounded-full bg-[#7A4A2B]/35 blur-[120px]" />
      <div className="drift-slow pointer-events-none absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-[#F5E9DF]/10 blur-[110px]" />

      {/* Monogram watermark */}
      <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-serif text-[38vw] font-semibold leading-none text-white/[0.025] sm:text-[320px]">
        B&amp;O
      </div>

      <div className="relative z-10 w-full max-w-[400px]">{children}</div>
    </div>
  );
}

// 3D tilt that follows the pointer. Disabled for reduced-motion users.
function TiltCard({ reduce, children }) {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 160, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [0, 1], [-9, 9]);
  const rotateX = useTransform(sy, [0, 1], [9, -9]);
  const glare = useTransform(
    [sx, sy],
    ([gx, gy]) =>
      `radial-gradient(380px circle at ${gx * 100}% ${gy * 100}%, rgba(255,255,255,0.22), transparent 60%)`
  );

  const handleMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        onPointerCancel={reset}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        {children(glare)}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AccessPortal() {
  const { guestName } = useParams();
  const reduce = useReducedMotion();

  const guest = registeredGuests.find(
    (g) => g.id.toLowerCase() === guestName?.toLowerCase()
  );

  /* ---------- Invalid pass ---------- */
  if (!guest) {
    return (
      <Stage>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#2C1509]/90 to-[#170a04]/90 p-10 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <ShieldAlert className="h-7 w-7 text-white/70" strokeWidth={1.5} />
          </div>
          <h2 className="mb-3 font-serif text-3xl text-white">Access Denied</h2>
          <p className="mb-8 text-sm leading-relaxed text-white/60">
            This digital pass is invalid or the guest cannot be located in the secure registry.
          </p>
          <span className="inline-block rounded-full border border-white/20 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
            Please see the ushering team
          </span>
        </motion.div>
      </Stage>
    );
  }

  /* ---------- Valid pass ---------- */
  const words = guest.name.split(' ');
  const seating = formatSeating(guest.table);

  return (
    <Stage>
      {/* Entrance */}
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Idle float + shadow */}
        <motion.div
          animate={reduce ? undefined : { y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="drop-shadow-[0_35px_45px_rgba(0,0,0,0.55)]"
        >
          <TiltCard reduce={reduce}>
            {(glare) => (
              <div className="text-center">
                {/* ============ Chocolate half ============ */}
                <div
                  className="notch-bottom grain sheen relative overflow-hidden rounded-t-[28px] px-7 pb-11 pt-7 text-[#FBF6F1]"
                  style={{
                    background:
                      'linear-gradient(155deg, #5B3320 0%, #3A1D10 45%, #1F0E07 100%)',
                  }}
                >
                  {/* Pointer-following glare */}
                  {!reduce && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-[6]"
                      style={{ background: glare }}
                    />
                  )}

                  {/* Decorative concentric rings */}
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] text-white"
                    viewBox="0 0 300 300"
                    fill="none"
                    stroke="currentColor"
                  >
                    {[40, 65, 90, 115, 140].map((r) => (
                      <circle key={r} cx="150" cy="150" r={r} strokeWidth="1" opacity="0.09" />
                    ))}
                  </svg>

                  {/* Inner frame (open at the perforation) */}
                  <div className="pointer-events-none absolute inset-x-3 bottom-0 top-3 rounded-t-[20px] border-x border-t border-white/10" />

                  <div className="relative z-10">
                    {/* Top row */}
                    <div className="mb-7 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.25em] text-white/60">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Verified
                      </span>
                      <span>Admit One</span>
                    </div>

                    {/* Logo with halo */}
                    <div className="relative mx-auto mb-7 h-24 w-24">
                      {!reduce && (
                        <motion.span
                          className="absolute -inset-2 rounded-full border border-white/30"
                          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut' }}
                        />
                      )}
                      <span className="absolute -inset-2 rounded-full border border-white/15" />
                      <motion.img
                        initial={reduce ? false : { scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 15 }}
                        src="/logo.jpeg"
                        alt="B&O Logo"
                        className="relative h-24 w-24 rounded-full object-cover shadow-[0_12px_30px_rgba(0,0,0,0.5)] ring-4 ring-white"
                      />
                    </div>

                    {/* Label */}
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/40" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
                        Official Entry Pass
                      </p>
                      <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/40" />
                    </div>

                    <motion.p
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="font-script mb-2 mt-4 text-white/70"
                    >
                      Joyfully admitting
                    </motion.p>

                    {/* Name: words slide up from a mask */}
                    <h2
                      aria-label={guest.name}
                      className="mb-6 flex flex-wrap justify-center gap-x-[0.28em] font-serif text-[clamp(1.85rem,8vw,2.6rem)] font-semibold leading-[1.12] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
                    >
                      {words.map((word, i) => (
                        <span key={i} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em]">
                          <motion.span
                            aria-hidden="true"
                            className="inline-block"
                            initial={reduce ? false : { y: '115%' }}
                            animate={{ y: 0 }}
                            transition={{
                              delay: 0.55 + i * 0.09,
                              duration: 0.75,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          >
                            {word}
                          </motion.span>
                        </span>
                      ))}
                    </h2>

                    {/* Category chip: inverted white on chocolate */}
                    <motion.div
                      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 18 }}
                      className="inline-flex max-w-full items-center gap-2.5 rounded-[22px] bg-white px-5 py-2.5 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)]"
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#5B3320]" />
                      <span className="text-balance text-[11px] font-bold uppercase leading-snug tracking-[0.16em] text-[#2A130A]">
                        {guest.category}
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* ============ White half ============ */}
                <div
                  className="notch-top relative rounded-b-[28px] px-7 pb-7 pt-10 text-left"
                  style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F0EA 100%)' }}
                >
                  {/* Perforation */}
                  <div className="absolute inset-x-6 top-[1px] border-t-2 border-dashed border-[#3A1D10]/20" />

                  {/* Seating */}
                  <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#3A1D10]/10 bg-white/70 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Armchair className="h-5 w-5 text-[#8B5E3C]" strokeWidth={1.75} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B5E3C]">
                        Seating
                      </span>
                    </div>
                    {seating ? (
                      <span className="text-right font-serif text-lg font-semibold leading-tight text-[#2A130A]">
                        {seating}
                      </span>
                    ) : (
                      <span className="text-right text-[11px] italic leading-snug text-[#2A130A]/55">
                        Assigned on arrival
                      </span>
                    )}
                  </div>

                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B3320] to-[#2A130A] text-white shadow-[0_8px_18px_-6px_rgba(42,19,10,0.6)]">
                      <MapPin className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B5E3C]">
                        Event Location
                      </h3>
                      <p className="text-[15px] leading-relaxed text-[#2A130A]">
                        17 Obasanmi Olakanpo St,
                        <br />
                        off Adeyi Avenue, Old Bodija,
                        <br />
                        Ibadan 200212, Oyo
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://maps.app.goo.gl/kVioD3VdvUw2hxgKA?g_st=iw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mb-7 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-[#4A2815] to-[#2A130A] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_14px_28px_-10px_rgba(42,19,10,0.75)] transition duration-300 hover:brightness-125 active:scale-[0.98]"
                  >
                    <Navigation className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    Get Directions
                  </a>

                  {/* Barcode + pass id */}
                  <div className="border-t border-[#3A1D10]/10 pt-5">
                    <Barcode value={guest.id} reduce={reduce} />
                    <div className="mt-3 flex items-center justify-between px-0.5">
                      <span className="font-mono text-[9px] tracking-[0.3em] text-[#8B5E3C]">
                        PASS ID
                      </span>
                      <span className="font-mono text-[12px] font-bold tracking-[0.2em] text-[#2A130A]">
                        {guest.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TiltCard>
        </motion.div>
      </motion.div>

      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-white/35"
      >
        Present this pass at the entrance
      </motion.p>
    </Stage>
  );
}