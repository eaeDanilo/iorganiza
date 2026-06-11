# Product

## Register

brand

## Users

Pequenos e médios empreendedores brasileiros que gerenciam negócios informais ou semi-formais:

- **iCobra**: pessoas que emprestam dinheiro ou vendem fiado e precisam controlar empréstimos, parcelas e inadimplência. Usam principalmente celular, fora de escritório.
- **iMaleta**: revendedoras(es) de semijoias/cosméticos que despacham maletas em consignação para vendedoras externas e precisam rastrear produtos, conferências e acertos. Mobile-first, uso em campo com leitura de código de barras.
- **iOrganiza Hub**: o guarda-chuva; visitante chega via tráfego pago ou orgânico, avalia o SaaS específico e assina (Stripe ou Kiwify/Hotmart/Kirvano).

Contexto: público brasileiro, sensível a preço, baixa paciência com fricção; decide rápido no celular. Idioma: português (pt-BR) em toda a interface.

## Product Purpose

Hub centralizador de múltiplos micro-SaaS (SSO Supabase, checkout Stripe, distribuição via plataformas de infoproduto). Sucesso = visitante entende o produto em segundos, inicia trial/assinatura sem atrito, e o dashboard entrega o trabalho diário sem treinamento.

Conversão é a métrica norte das páginas públicas (landing, /icobra, /imaleta, catálogo, trial). Retenção e eficiência de tarefa são a métrica norte dos dashboards.

## Brand Personality

Sóbria, premium, direta. Confiante sem ser arrogante; editorial, não publicitária. Fala de resultado concreto ("recupere o que te devem", "saiba onde cada peça está") em vez de jargão SaaS. Visual: preto + bege (tokens ink/sand), tipografia Epilogue como display.

Sub-marcas mantêm identidade própria e NUNCA compartilham tokens com o hub:
- iCobra: verde próprio (hardcoded, separado dos tokens globais).
- iMaleta: fundo #181818 + acento #DEDAD3.

## Anti-references

- SaaS genérico roxo/gradiente (Stripe-clone, hero com gradient text, glassmorphism).
- Página de infoproduto chamativa (contadores regressivos falsos, setas vermelhas, caps lock).
- Template hero-metric com card grids idênticos.
- Tom "corporativês" frio ou tradução literal de copy americana.

## Design Principles

1. **Resultado antes de recurso**: toda headline e CTA fala do ganho do usuário, não da feature.
2. **Uma página, uma ação**: cada página pública tem um CTA primário claro; o resto é suporte.
3. **Celular primeiro de verdade**: o fluxo crítico (entender → assinar → usar) precisa ser impecável em 360px antes de qualquer desktop polish.
4. **Confiança se constrói com prova**: preço transparente, LGPD visível, termos/privacidade acessíveis, sem promessas vazias.
5. **Sub-marcas separadas**: iCobra e iMaleta têm cor e clima próprios; o hub é neutro ink/sand.

## Accessibility & Inclusion

- Alvo: WCAG 2.1 AA (contraste 4.5:1, foco visível, navegação por teclado, labels em todos os inputs, hierarquia de headings).
- Respeitar `prefers-reduced-motion`.
- Touch targets ≥ 44px (público majoritariamente mobile).

## Metrics & Tracking

- Analytics: Google Analytics 4 (decisão 2026-06-11). Requer banner de consentimento LGPD antes de carregar — consentimento é pré-requisito, não opcional.
- Vercel Speed Insights já instalado (performance).
- Eventos de conversão a rastrear: view landing → click CTA → signup iniciado → signup confirmado → trial iniciado → checkout iniciado → assinatura ativa.
