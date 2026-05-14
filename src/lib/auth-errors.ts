// Traduz mensagens de erro do Supabase Auth para PT-BR.
const map: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha inválidos.',
  'Email not confirmed': 'Email ainda não confirmado. Verifique sua caixa de entrada.',
  'User already registered': 'Email já cadastrado. Faça login.',
  'New password should be different from the old password': 'A nova senha deve ser diferente da atual.',
  'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
  'Password should be at least 8 characters': 'A senha deve ter no mínimo 8 caracteres.',
  'Unable to validate email address: invalid format': 'Email com formato inválido.',
  'Signup requires a valid password': 'Senha inválida.',
  'For security purposes, you can only request this after 60 seconds': 'Por segurança, aguarde 60 segundos antes de tentar novamente.',
  'Token has expired or is invalid': 'Link expirado ou inválido. Solicite um novo.',
  'Email link is invalid or has expired': 'Link de email inválido ou expirado.',
  'Auth session missing!': 'Sessão expirada. Faça login novamente.',
  'User not found': 'Usuário não encontrado.',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  'Same password as old one': 'A nova senha deve ser diferente da atual.',
};

export function translateAuthError(msg: string | undefined | null): string {
  if (!msg) return 'Erro desconhecido.';
  if (map[msg]) return map[msg];
  // fallback: tenta match parcial
  const lower = msg.toLowerCase();
  if (lower.includes('different from the old')) return 'A nova senha deve ser diferente da atual.';
  if (lower.includes('invalid login')) return 'Email ou senha inválidos.';
  if (lower.includes('already registered')) return 'Email já cadastrado.';
  if (lower.includes('email not confirmed')) return 'Email ainda não confirmado.';
  if (lower.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.';
  if (lower.includes('weak password') || lower.includes('password should')) return 'Senha fraca. Use ao menos 8 caracteres.';
  return msg; // último recurso: retorna original
}
