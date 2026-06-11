import { ImageResponse } from 'next/og';

export const alt = 'iCobra — Controle de empréstimos e cobranças';
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
          backgroundColor: '#0C1A10',
          backgroundImage:
            'radial-gradient(circle at 85% 20%, rgba(0,200,83,0.22) 0%, rgba(0,200,83,0) 55%)',
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
              backgroundColor: '#00C853',
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>
            iCobra
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
            Saiba quem deve, quanto deve e quando paga
          </div>
          <div style={{ fontSize: 32, color: '#9DB5A4', maxWidth: 900 }}>
            Controle empréstimos, parcelas e inadimplência sem planilha, direto
            no celular.
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
              backgroundColor: '#00C853',
              color: '#0C1A10',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Teste grátis
          </div>
          <div style={{ fontSize: 26, color: '#6B8273' }}>
            iorganiza.com.br/icobra
          </div>
        </div>
      </div>
    ),
    size
  );
}
