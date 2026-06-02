import Link from 'next/link';

const FEATURES = [
  'Controle de inadimplência',
  'Cobranças automáticas',
  'Assistente com IA',
] as const;

interface ICobraBannerProps {
  slug?: string;
}

export function ICobraBanner({ slug = 'icobra' }: ICobraBannerProps) {
  return (
    <div
      className="relative mb-10 overflow-hidden rounded-xl"
      style={{ background: '#0B1810' }}
    >
      {/* Dot grid fading left to right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,200,83,0.18) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage:
            'radial-gradient(ellipse 60% 120% at 95% 50%, black 10%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 120% at 95% 50%, black 10%, transparent 80%)',
        }}
      />

      <div className="relative flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
        {/* Identity */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
            style={{ background: '#00C853' }}
          >
            <svg width="20" height="15" viewBox="0 0 14 11" fill="none" aria-hidden="true">
              <path
                d="M1.5 5.5L5 9L12.5 1.5"
                stroke="#0B1810"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p
              className="text-[10px] font-semibold uppercase"
              style={{ color: '#00C853', letterSpacing: '0.14em' }}
            >
              Em destaque
            </p>
            <p className="text-xl font-bold leading-tight text-white">iCobra</p>
          </div>
        </div>

        {/* Feature list */}
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:flex-1 sm:flex-nowrap">
          {FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              <span
                className="block h-[5px] w-[5px] shrink-0 rounded-full"
                style={{ background: '#00C853' }}
              />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={`/saas/${slug}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{ background: '#00C853', color: '#0B1810' }}
        >
          Conhecer
        </Link>
      </div>
    </div>
  );
}
