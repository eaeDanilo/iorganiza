function wrap(title: string, body: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;background:#000;color:#fff;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#0F1419;border:1px solid #333;border-radius:12px;padding:32px;">
    <h1 style="color:#0066FF;margin:0 0 16px 0;font-size:24px;">iOrganiza</h1>
    ${body}
    <p style="color:#A0A0A0;font-size:12px;margin-top:32px;">iOrganiza Hub &middot; Centralize seus SaaS</p>
  </div>
</body></html>`;
}

export const emailTemplates = {
  welcome(name: string) {
    return {
      subject: 'Bem-vindo ao iOrganiza',
      html: wrap('Bem-vindo', `
        <h2 style="color:#fff;">Olá, ${name || 'usuário'}!</h2>
        <p style="color:#A0A0A0;">Sua conta foi criada com sucesso.</p>
        <p style="color:#A0A0A0;">Explore o catálogo e ative os SaaS que precisar.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Acessar Dashboard
        </a>
      `),
    };
  },
  subscriptionActivated(saasName: string, accessUrl: string) {
    return {
      subject: `Sua assinatura de ${saasName} está ativa`,
      html: wrap('Assinatura ativa', `
        <h2 style="color:#fff;">Pagamento confirmado</h2>
        <p style="color:#A0A0A0;">Sua assinatura de <strong>${saasName}</strong> foi ativada.</p>
        <a href="${accessUrl}" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Acessar ${saasName}
        </a>
      `),
    };
  },
  subscriptionCanceled(saasName: string) {
    return {
      subject: `Assinatura de ${saasName} cancelada`,
      html: wrap('Cancelada', `
        <h2 style="color:#fff;">Cancelamento confirmado</h2>
        <p style="color:#A0A0A0;">Sua assinatura de <strong>${saasName}</strong> foi cancelada. Você manterá acesso até o fim do período pago.</p>
      `),
    };
  },
  renewalReminder(saasName: string, days: number) {
    return {
      subject: `${saasName} renova em ${days} dias`,
      html: wrap('Renovação', `
        <h2 style="color:#fff;">Lembrete de renovação</h2>
        <p style="color:#A0A0A0;">Sua assinatura de <strong>${saasName}</strong> renova em ${days} dias.</p>
      `),
    };
  },
  paymentFailed(saasName: string) {
    return {
      subject: `Pagamento falhou em ${saasName}`,
      html: wrap('Pagamento falhou', `
        <h2 style="color:#FF3B30;">Não conseguimos cobrar</h2>
        <p style="color:#A0A0A0;">O pagamento de <strong>${saasName}</strong> falhou. Atualize seus dados de cobrança.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/faturamento" style="display:inline-block;background:#FF0055;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Atualizar pagamento
        </a>
      `),
    };
  },
};
