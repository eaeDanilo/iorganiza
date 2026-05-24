export type UUID = string;

export type SubscriptionStatus = 'active' | 'canceled' | 'pending' | 'expired';
export type PaymentMethod = 'stripe' | 'kiwify' | 'hotmart' | 'kirvano' | 'manual';
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';
export type SaasStatus = 'active' | 'inactive';
export type WebhookProvider = 'stripe' | 'kiwify' | 'hotmart' | 'kirvano';
export type WebhookStatus = 'success' | 'failed' | 'pending_retry';

export interface User {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Saas {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  price_monthly: number;
  features: string[];
  status: SaasStatus;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  external_url: string | null;
  trial_enabled: boolean;
  trial_max_uses: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Subscription {
  id: UUID;
  user_id: UUID;
  saas_id: UUID;
  plan_id: UUID | null;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  kiwify_purchase_id: string | null;
  hotmart_purchase_id: string | null;
  kirvano_purchase_id: string | null;
  price_paid: number | null;
  payment_method: PaymentMethod;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaasPlan {
  id: UUID;
  saas_id: UUID;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  features: string[];
  stripe_price_id: string | null;
  has_ai_chat: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SaasIntegration {
  id: UUID;
  source_saas_id: UUID;
  target_saas_id: UUID;
  user_id: UUID;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: UUID;
  user_id: UUID;
  subscription_id: UUID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  stripe_transaction_id: string | null;
  external_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: UUID;
  provider: WebhookProvider;
  event_type: string | null;
  payload: Record<string, unknown> | null;
  status: WebhookStatus;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface SubscriptionWithSaas extends Subscription {
  saas: Saas;
}
