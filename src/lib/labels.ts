// Traduções PT-BR de enums e termos técnicos visíveis ao usuário.

import type { SubscriptionStatus, PaymentMethod, PaymentStatus, SaasStatus, WebhookStatus, WebhookProvider } from '@/types/database';

export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  active: 'Ativa',
  canceling: 'Cancelamento agendado',
  canceled: 'Cancelada',
  pending: 'Pendente',
  expired: 'Expirada',
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  stripe: 'Stripe',
  kiwify: 'Kiwify',
  hotmart: 'Hotmart',
  kirvano: 'Kirvano',
  manual: 'Manual',
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  succeeded: 'Aprovado',
  pending: 'Pendente',
  failed: 'Falhou',
  refunded: 'Estornado',
};

export const saasStatusLabel: Record<SaasStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export const webhookStatusLabel: Record<WebhookStatus, string> = {
  success: 'Sucesso',
  failed: 'Falhou',
  pending_retry: 'Aguardando',
};

export const webhookProviderLabel: Record<WebhookProvider, string> = {
  stripe: 'Stripe',
  kiwify: 'Kiwify',
  hotmart: 'Hotmart',
  kirvano: 'Kirvano',
};
