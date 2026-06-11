import { ImageResponse } from 'next/og';

export const alt = 'iMaleta — Controle de maletas de consignação';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#181818',
          backgroundImage:
            'radial-gradient(circle at 85% 20%, rgba(222,218,211,0.14) 0%, rgba(222,218,211,0) 55%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: '#DEDAD3',
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>
            iMaleta
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            Maletas de consignação sob controle
          </div>
          <div style={{ fontSize: 32, color: '#A8A49D', maxWidth: 920 }}>
            Monte maletas, bipe produtos pela câmera e saiba o que foi vendido
            na conferência.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '12px 28px',
              borderRadius: 9999,
              backgroundColor: '#DEDAD3',
              color: '#181818',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Teste grátis
          </div>
          <div style={{ fontSize: 26, color: '#7C7873' }}>
            iorganiza.com.br/imaleta
          </div>
        </div>
      </div>
    ),
    size
  );
}
