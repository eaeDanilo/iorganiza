import { ImageResponse } from 'next/og';

export const alt = 'iOrganiza — Sistemas de gestão para o seu negócio';
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
          backgroundColor: '#111113',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 55%)',
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
              backgroundColor: '#FFFFFF',
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>
            iOrganiza
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Sistemas de gestão para o seu negócio
          </div>
          <div style={{ fontSize: 32, color: '#A1A1AA', maxWidth: 900 }}>
            Empréstimos e cobranças com o iCobra. Maletas de consignação com o
            iMaleta.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                padding: '10px 24px',
                borderRadius: 9999,
                border: '1px solid #00C853',
                color: '#00C853',
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              iCobra
            </div>
            <div
              style={{
                display: 'flex',
                padding: '10px 24px',
                borderRadius: 9999,
                border: '1px solid #DEDAD3',
                color: '#DEDAD3',
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              iMaleta
            </div>
          </div>
          <div style={{ fontSize: 26, color: '#71717A' }}>iorganiza.com.br</div>
        </div>
      </div>
    ),
    size
  );
}
