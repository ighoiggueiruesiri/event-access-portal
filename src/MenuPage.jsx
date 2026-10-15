import { motion, useReducedMotion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Colours taken from the menu picture: forest green, butter yellow,  */
/*  antique gold on warm cream. The cream matches the logo's own       */
/*  background so the logo sits flush on the card.                     */
/* ------------------------------------------------------------------ */
const C = {
  desk: '#F3F0E2',
  paper: '#FCFBF6',
  ink: '#14502F', // headings
  body: '#2F4A38', // dish names
  leaf: '#2F6B3F',
  brush: '#FBEE9F', // yellow highlight stroke
  gold: '#C9A227',
  line: '#E3D49A',
};

/* ------------------------------------------------------------------ */
/*  Menu content. Edit the text here only.                             */
/* ------------------------------------------------------------------ */
const MENU = {
  hashtag: '#Bestfriendsforever',
  title: 'Wedding Menu',
  welcome: { title: 'Welcome & Appetizers', items: ['Chilled Water', 'Local Snacks', 'Assorted Small Chops'] },
  local: {
    title: 'Local',
    groups: [
      { name: 'Abula', items: ['Amala', 'Gbegiri & Ewedu', 'Fresh Fish', 'Assorted Meat'] },
      { name: 'Iyan', items: ['Pounded Yam', 'Egusi Soup or Efo Riro', 'Fish', 'Meat'] },
      { name: 'Ofada', items: ['Ofada Rice', 'Ayamase Sauce', 'Egg', 'Fish', 'Moi Moi', 'Assorted Meat'] },
    ],
  },
  continental: { title: 'Continental', items: ['Jollof Rice', 'Fried Rice', 'Coleslaw', 'Chicken'] },
  dessert: { title: 'Dessert', items: ['Assorted Parfait'] },
  drinks: { title: 'Drinks', items: ['Water', 'Soft Drinks', 'Assorted Juices', 'Wine', 'Palm Wine'] },
  late: { title: 'Late-Night Bites', items: ['Fries & Chicken Wings'] },
  after: { title: 'After-Party', items: ['Asun', 'Spaghetti & Gizzard'] },
  footer: ['Good Food', 'Good Drinks', 'Great Memories'],
};

const serif = "'Playfair Display', Georgia, serif";
const script = "'Pinyon Script', cursive";

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */
function Leaf({ size = 18, rotate = 0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M12 22V10" stroke={C.leaf} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 15C6.5 15 4 11 4 6.5c5 0 8 2.6 8 8.5Z" fill={C.leaf} />
      <path d="M12 11.5c0-4.500 2.800-7.600 8-8 0 5-3 8-8 8Z" fill={C.leaf} opacity=".78" />
    </svg>
  );
}

function Rings({ width = 44 }) {
  return (
    <svg width={width} height={width * 0.72} viewBox="0 0 60 43" fill="none" stroke={C.gold} strokeWidth="3" aria-hidden="true">
      <circle cx="22" cy="25" r="14" />
      <circle cx="38" cy="25" r="14" />
      <path d="M22 11l-4-5 4-4h8l4 4-4 5" strokeWidth="2" strokeLinejoin="round" transform="translate(-4 0)" />
    </svg>
  );
}

function Rule({ icon = <Leaf />, w = 'w-14 sm:w-24' }) {
  return (
    <div className="my-6 flex items-center justify-center gap-3" aria-hidden="true">
      <span className={`h-px ${w}`} style={{ background: C.gold, opacity: 0.7 }} />
      {icon}
      <span className={`h-px ${w}`} style={{ background: C.gold, opacity: 0.7 }} />
    </div>
  );
}

/* Heading on a butter-yellow brush stroke, as in the picture */
function Heading({ children, big = false, leaf = true }) {
  return (
    <div className="flex justify-center md:justify-start" style={big ? { justifyContent: 'center' } : undefined}>
      <h2
        className="relative inline-flex items-center gap-2 font-semibold uppercase"
        style={{
          fontFamily: serif,
          color: C.ink,
          letterSpacing: '0.03em',
          fontSize: big ? 'clamp(1.25rem, 5vw, 1.7rem)' : '0.98rem',
          padding: big ? '0.55rem 3rem' : '0.38rem 1.2rem 0.38rem 0.9rem',
          background: C.brush,
          borderRadius: big ? '6px 18px 8px 20px / 14px 8px 18px 10px' : '4px 14px 6px 16px / 10px 6px 14px 8px',
          boxShadow: `0 1px 0 ${C.line}`,
        }}
      >
        {leaf && !big && <Leaf size={18} rotate={-12} />}
        {children}
      </h2>
    </div>
  );
}

function Dishes({ items, center = false }) {
  return (
    <ul className={`space-y-1.5 ${center ? 'mx-auto w-fit' : ''}`} style={{ listStyle: 'none', paddingLeft: 0 }}>
      {items.map((it) => (
        <li key={it} className="flex items-baseline gap-2.5 text-[0.98rem] leading-snug" style={{ color: C.body }}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.ink, transform: 'translateY(-0.12em)' }} />
          {it}
        </li>
      ))}
    </ul>
  );
}

function Corner({ src, className }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable="false"
      className={`pointer-events-none absolute select-none ${className}`}
      style={{ width: 'clamp(104px, 25vw, 215px)', height: 'auto' }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function MenuPage() {
  const reduce = useReducedMotion();
  const rise = (i = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-30px' },
          transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6 sm:py-12" style={{ background: C.desk, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div
        className="relative mx-auto max-w-[880px] overflow-hidden"
        style={{
          background: C.paper,
          border: `1.5px solid ${C.gold}`,
          boxShadow: `inset 0 0 0 7px ${C.paper}, inset 0 0 0 8px ${C.line}, 0 20px 50px -24px rgba(20,80,47,.35)`,
        }}
      >
        <Corner src="/corner-tl.png" className="left-0 top-0" />
        <Corner src="/corner-tr.png" className="right-0 top-0" />
        <Corner src="/corner-bl.png" className="bottom-0 left-0" />
        <Corner src="/corner-br.png" className="bottom-0 right-0" />

        <div className="relative px-6 pb-16 pt-10 sm:px-14 sm:pt-12">
          {/* Header: event logo */}
          <motion.header {...rise()} className="text-center">
            <img
              src="/menu-logo.jpg"
              alt="B&O wedding logo: #bestfriendsforever"
              width="190"
              height="190"
              className="mx-auto block h-auto"
              style={{ width: 'clamp(130px, 34vw, 190px)' }}
            />
            <div className="mt-1 flex items-center justify-center gap-4" aria-hidden="true">
              <span className="h-px w-16 sm:w-28" style={{ background: C.gold }} />
              <Rings />
              <span className="h-px w-16 sm:w-28" style={{ background: C.gold }} />
            </div>
            <h1
              className="mt-3 font-semibold uppercase"
              style={{ fontFamily: serif, color: C.ink, fontSize: 'clamp(2.1rem, 9vw, 3.5rem)', letterSpacing: '0.035em', lineHeight: 1.1 }}
            >
              {MENU.title}
            </h1>
            <Rule />
          </motion.header>

          {/* Welcome */}
          <motion.section {...rise(1)} aria-label={MENU.welcome.title} className="text-center">
            <div className="flex justify-center">
              <h2
                className="inline-block font-semibold uppercase"
                style={{
                  fontFamily: serif,
                  color: C.ink,
                  fontSize: 'clamp(0.95rem, 3.6vw, 1.15rem)',
                  letterSpacing: '0.03em',
                  padding: '0.45rem 1.8rem',
                  background: C.brush,
                  borderRadius: '6px 18px 8px 20px / 14px 8px 18px 10px',
                }}
              >
                {MENU.welcome.title}
              </h2>
            </div>
            <div className="mt-4">
              <Dishes items={MENU.welcome.items} center />
            </div>
          </motion.section>

          <Rule />

          {/* Main menu */}
          <motion.div {...rise(1)}>
            <Heading big leaf={false}>Main Menu</Heading>
          </motion.div>

          <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-0">
            <motion.section {...rise(1)} aria-label={MENU.local.title} className="md:pr-7">
              <Heading>{MENU.local.title}</Heading>
              <div className="mt-5 space-y-5">
                {MENU.local.groups.map((g) => (
                  <div key={g.name}>
                    <h3 className="mb-1.5 text-[0.95rem] font-bold uppercase tracking-wide text-center md:text-left" style={{ color: C.ink }}>
                      {g.name}
                    </h3>
                    <div className="mx-auto w-fit md:mx-0">
                      <Dishes items={g.items} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              {...rise(2)}
              aria-label={MENU.continental.title}
              className="md:border-x md:px-7"
              style={{ borderColor: C.line }}
            >
              <Heading>{MENU.continental.title}</Heading>
              <div className="mx-auto mt-5 w-fit md:mx-0">
                <Dishes items={MENU.continental.items} />
              </div>
              <Rule icon={<Leaf size={16} />} w="w-10" />
              <Heading>{MENU.dessert.title}</Heading>
              <div className="mx-auto mt-5 w-fit md:mx-0">
                <Dishes items={MENU.dessert.items} />
              </div>
            </motion.section>

            <motion.section {...rise(3)} aria-label="Drinks, late-night bites and after-party" className="md:pl-7">
              <Heading>{MENU.drinks.title}</Heading>
              <div className="mx-auto mt-5 w-fit md:mx-0">
                <Dishes items={MENU.drinks.items} />
              </div>
              <Rule icon={<Leaf size={16} />} w="w-10" />
              <Heading>{MENU.late.title}</Heading>
              <div className="mx-auto mt-5 w-fit md:mx-0">
                <Dishes items={MENU.late.items} />
              </div>
              <Rule icon={<Leaf size={16} />} w="w-10" />
              <Heading>{MENU.after.title}</Heading>
              <div className="mx-auto mt-5 w-fit md:mx-0">
                <Dishes items={MENU.after.items} />
              </div>
            </motion.section>
          </div>

          <Rule />

          {/* Footer */}
          <motion.footer {...rise()} className="relative text-center">
            <p style={{ fontFamily: script, fontSize: 'clamp(2rem, 8vw, 2.8rem)', lineHeight: 1.2, color: C.ink, margin: 0 }}>
              {MENU.hashtag}
            </p>
            <div className="my-2 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-14" style={{ background: C.gold }} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2">
                <path d="M12 21s-8-5.2-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11Z" />
              </svg>
              <span className="h-px w-14" style={{ background: C.gold }} />
            </div>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm" style={{ color: C.body, margin: 0 }}>
              {MENU.footer.map((t, i) => (
                <span key={t} className="flex items-center gap-3">
                  {i > 0 && <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.gold }} />}
                  {t}
                </span>
              ))}
            </p>
          </motion.footer>
        </div>
      </div>
    </main>
  );
}