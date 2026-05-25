function wrap(title: string, body: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;background:#000;color:#fff;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#0F1419;border:1px solid #333;border-radius:12px;padding:32px;">
    <h1 style="color:#0066FF;margin:0 0 16px 0;font-size:24px;">iOrganiza</h1>
    ${body}
    <p style="color:#A0A0A0;font-size:12px;margin-top:32px;">iOrganiza &middot; Centralize seus SaaS</p>
  </div>
</body></html>`;
}

export const emailTemplates = {
  confirmEmail(confirmUrl: string) {
    return {
      subject: 'Confirme seu e-mail para acessar o iOrganiza',
      html: wrap('Confirmar e-mail', `
        <h2 style="color:#fff;">Você está quase lá!</h2>
        <p style="color:#A0A0A0;">Só falta um passo: confirme seu e-mail para ativar sua conta e começar a organizar todos os seus SaaS em um só lugar.</p>
        <a href="${confirmUrl}"
           style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Confirmar meu e-mail
        </a>
        <p style="color:#606060;font-size:12px;margin-top:16px;">Este link expira em 24 horas. Se você não criou uma conta no iOrganiza, pode ignorar este e-mail com segurança.</p>
      `),
    };
  },
  resetPassword(resetUrl: string) {
    return {
      subject: 'Redefina sua senha no iOrganiza',
      html: wrap('Redefinir senha', `
        <h2 style="color:#fff;">Solicitação de nova senha</h2>
        <p style="color:#A0A0A0;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma senha nova.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Criar nova senha
        </a>
        <p style="color:#606060;font-size:12px;margin-top:16px;">Este link expira em 1 hora. Se você não fez essa solicitação, sua conta está segura — pode ignorar este e-mail.</p>
      `),
    };
  },
  welcome(name: string) {
    return {
      subject: `Sua conta está pronta, ${name || 'seja bem-vindo'}!`,
      html: wrap('Bem-vindo ao iOrganiza', `
        <h2 style="color:#fff;">Bem-vindo ao iOrganiza, ${name || 'seja bem-vindo'}!</h2>
        <p style="color:#A0A0A0;">Sua conta foi criada com sucesso. Agora você pode centralizar, controlar e pagar todos os seus SaaS em um único lugar — sem planilha, sem surpresa no cartão.</p>
        <p style="color:#A0A0A0;margin-top:12px;">Comece explorando o catálogo e ativando os serviços que você já usa.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Acessar meu painel
        </a>
      `),
    };
  },
  subscriptionActivated(saasName: string, accessUrl: string) {
    return {
      subject: `Assinatura do ${saasName} confirmada`,
      html: wrap('Assinatura ativa', `
        <h2 style="color:#fff;">Tudo certo! Sua assinatura está ativa.</h2>
        <p style="color:#A0A0A0;">O pagamento foi confirmado e sua assinatura do <strong>${saasName}</strong> já está ativa. Você já pode acessar o serviço.</p>
        <a href="${accessUrl}" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Acessar ${saasName}
        </a>
      `),
    };
  },
  subscriptionCanceled(saasName: string) {
    return {
      subject: `Cancelamento do ${saasName} registrado`,
      html: wrap('Assinatura cancelada', `
        <h2 style="color:#fff;">Cancelamento registrado</h2>
        <p style="color:#A0A0A0;">Sua assinatura do <strong>${saasName}</strong> foi cancelada com sucesso. Você continuará com acesso completo até o fim do período já pago.</p>
        <p style="color:#A0A0A0;margin-top:12px;">Se mudar de ideia, pode reativar a qualquer momento pelo seu painel.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#333;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Ir para o painel
        </a>
      `),
    };
  },
  renewalReminder(saasName: string, days: number) {
    return {
      subject: `Lembrete: ${saasName} renova em ${days} ${days === 1 ? 'dia' : 'dias'}`,
      html: wrap('Lembrete de renovação', `
        <h2 style="color:#fff;">Sua assinatura renova em breve</h2>
        <p style="color:#A0A0A0;">Só um aviso: sua assinatura do <strong>${saasName}</strong> será renovada automaticamente em <strong>${days} ${days === 1 ? 'dia' : 'dias'}</strong>.</p>
        <p style="color:#A0A0A0;margin-top:12px;">Se quiser cancelar ou alterar seu plano antes da renovação, acesse seu painel.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Gerenciar assinatura
        </a>
      `),
    };
  },
  paymentFailed(saasName: string) {
    return {
      subject: `Ação necessária: pagamento do ${saasName} recusado`,
      html: wrap('Pagamento recusado', `
        <h2 style="color:#FF3B30;">Não conseguimos processar seu pagamento</h2>
        <p style="color:#A0A0A0;">O pagamento da assinatura do <strong>${saasName}</strong> foi recusado. Para não perder acesso ao serviço, atualize seus dados de cobrança.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/faturamento" style="display:inline-block;background:#FF0055;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Atualizar dados de cobrança
        </a>
        <p style="color:#606060;font-size:12px;margin-top:16px;">Se precisar de ajuda, entre em contato com nosso suporte.</p>
      `),
    };
  },
};
