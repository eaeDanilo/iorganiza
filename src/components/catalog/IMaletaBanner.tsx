import Link from "next/link";

const FEATURES = [
  "Controle de maletas",
  "Leitura de código de barras",
  "Conferência de retorno",
] as const;

interface IMaletaBannerProps {
  slug?: string;
}

export function IMaletaBanner({ slug = "imaleta" }: IMaletaBannerProps) {
  return (
    <div
      className="relative mb-10 overflow-hidden rounded-xl"
      style={{ background: "#1C1C1C" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(222,218,211,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 60% 120% at 95% 50%, black 10%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 120% at 95% 50%, black 10%, transparent 80%)",
        }}
      />

      <div className="relative flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
        <div className="flex items-center gap-3.5 shrink-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
            style={{ background: "#DEDAD3" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="7" width="16" height="11" rx="2" stroke="#1C1C1C" strokeWidth="1.8" />
              <path d="M7 7V5a3 3 0 016 0v2" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M7 12h6" stroke="#1C1C1C" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p
              className="text-[10px] font-semibold uppercase"
              style={{ color: "#DEDAD3", letterSpacing: "0.14em" }}
            >
              Em destaque
            </p>
            <p className="text-xl font-bold leading-tight text-white">iMaleta</p>
          </div>
        </div>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:flex-1 sm:flex-nowrap">
          {FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <span
                className="block h-[5px] w-[5px] shrink-0 rounded-full"
                style={{ background: "#DEDAD3" }}
              />
              {f}
            </li>
          ))}
        </ul>

        <Link
          href={`/saas/${slug}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
          style={{ background: "#DEDAD3", color: "#1C1C1C" }}
        >
          Conhecer
        </Link>
      </div>
    </div>
  );
}
