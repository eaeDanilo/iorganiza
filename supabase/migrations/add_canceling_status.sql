-- Migration: adicionar 'canceling' ao enum subscription_status
-- Necessário para o fluxo de cancelamento com período de vigência restante.
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'canceling';
