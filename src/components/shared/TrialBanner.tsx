import Link from 'next/link';

interface TrialBannerProps {
  usesRemaining?: number;
  subscribeHref: string;
  accent: string;
  bg: string;
}

export function TrialBanner({ usesRemaining, subscribeHref, accent, bg }: TrialBannerProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 px-4"
      style={{ background: bg, height: 40 }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-widest rounded px-2 py-0.5"
        style={{ background: `${accent}1a`, color: accent, border: `1px solid ${accent}33` }}
      >
        Modo teste
      </span>
      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {usesRemaining !== undefined ? (
          <>
            <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {usesRemaining}
            </span>{' '}
            {usesRemaining === 1 ? 'uso restante' : 'usos restantes'}
          </>
        ) : (
          'Acesso de teste ativo'
        )}
      </span>
      <Link
        href={subscribeHref}
        className="text-xs font-semibold rounded px-3 py-1 transition-opacity hover:opacity-80"
        style={{ background: accent, color: bg }}
      >
        Fazer upgrade
      </Link>
    </div>
  );
}
