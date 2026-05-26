import Link from 'next/link';
import { Footer } from '@/components/shared/Footer';

export const metadata = {
  title: 'Política de Privacidade — iOrganiza',
  description: 'Como o iOrganiza coleta, usa e protege seus dados pessoais conforme a LGPD.',
};

export default function PrivacidadePage() {
  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="container flex h-14 items-center">
          <Link href="/" className="text-lg font-bold text-primary">iOrganiza</Link>
        </div>
      </header>

      <main className="container max-w-3xl py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última atualização: 26 de maio de 2026 &nbsp;·&nbsp; Lei nº 13.709/2018 (LGPD)
          </p>
        </div>

        <Section title="1. Quem somos (Controlador)">
          <p>
            O <strong>iOrganiza</strong> é operado por Danilo (CPF/CNPJ disponível mediante solicitação),
            com sede no Brasil. Para dúvidas sobre privacidade, contate nosso responsável pelo
            tratamento de dados: <a href="mailto:eaedanilo1@gmail.com" className="text-primary underline">eaedanilo1@gmail.com</a>.
          </p>
        </Section>

        <Section title="2. Quais dados coletamos">
          <p>Coletamos apenas o necessário para prestar os serviços contratados:</p>
          <ul className="mt-3 space-y-2 list-disc pl-5">
            <li><strong>Cadastro:</strong> nome completo, endereço de e-mail, senha (armazenada em hash)</li>
            <li><strong>Pagamentos:</strong> valor, moeda, status da transação, datas de período e renovação. Dados de cartão são processados exclusivamente pela Stripe — não os armazenamos.</li>
            <li><strong>Assinaturas:</strong> plano contratado, datas de início/fim, status, ID de cliente Stripe</li>
            <li><strong>iCobra (gestão de empréstimos):</strong> nomes e dados dos seus devedores, valores, datas e status de parcelas que você mesmo cadastra</li>
            <li><strong>Logs técnicos:</strong> registros de eventos de webhook de integrações de pagamento</li>
            <li><strong>Cookies de sessão:</strong> tokens de autenticação gerenciados pelo Supabase Auth (HttpOnly, Secure)</li>
          </ul>
        </Section>

        <Section title="3. Para que usamos os dados (Finalidade e Base Legal)">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-semibold">Finalidade</th>
                <th className="text-left p-3 font-semibold">Base Legal (Art. 7 LGPD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3">Criar e manter sua conta</td>
                <td className="p-3">Execução de contrato (inciso V)</td>
              </tr>
              <tr>
                <td className="p-3">Processar pagamentos e assinaturas</td>
                <td className="p-3">Execução de contrato (inciso V)</td>
              </tr>
              <tr>
                <td className="p-3">Enviar confirmações, faturas e notificações do serviço</td>
                <td className="p-3">Execução de contrato (inciso V)</td>
              </tr>
              <tr>
                <td className="p-3">Gerenciar empréstimos no iCobra via IA</td>
                <td className="p-3">Consentimento explícito (inciso I)</td>
              </tr>
              <tr>
                <td className="p-3">Prevenir fraudes e garantir segurança</td>
                <td className="p-3">Legítimo interesse (inciso IX)</td>
              </tr>
              <tr>
                <td className="p-3">Cumprir obrigações legais (ex: registros fiscais)</td>
                <td className="p-3">Obrigação legal (inciso II)</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="4. Compartilhamento com terceiros (Suboperadores)">
          <p>Seus dados são compartilhados somente com os seguintes prestadores de serviço, estritamente para as finalidades indicadas:</p>
          <ul className="mt-3 space-y-3 list-disc pl-5">
            <li>
              <strong>Supabase</strong> (EUA) — banco de dados e autenticação.{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Política de privacidade</a>
            </li>
            <li>
              <strong>Stripe</strong> (EUA) — processamento de pagamentos.{' '}
              <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Política de privacidade</a>
            </li>
            <li>
              <strong>Resend</strong> (EUA) — envio de e-mails transacionais.{' '}
              <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Política de privacidade</a>
            </li>
            <li>
              <strong>Anthropic</strong> (EUA) — IA do assistente iCobra. As mensagens enviadas ao assistente, incluindo dados de empréstimos e nomes de devedores, são processadas pela Anthropic. Você será informado e solicitado a consentir antes do primeiro uso.{' '}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Política de privacidade</a>
            </li>
            <li>
              <strong>Kiwify, Hotmart, Kirvano</strong> (Brasil/EUA) — plataformas alternativas de pagamento. Quando você compra via essas plataformas, seu e-mail e nome são recebidos por nós para criar sua conta.
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Não vendemos, alugamos nem comercializamos seus dados pessoais a terceiros.
          </p>
        </Section>

        <Section title="5. Transferência internacional de dados (Art. 33)">
          <p>
            Supabase, Stripe, Resend e Anthropic operam com infraestrutura nos Estados Unidos. A transferência
            é necessária para a execução do contrato de prestação de serviços (Art. 33, inciso II, LGPD).
            Todos esses fornecedores possuem políticas de proteção de dados compatíveis com padrões internacionais.
          </p>
        </Section>

        <Section title="6. Por quanto tempo guardamos seus dados (Retenção)">
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Dados de conta e empréstimos (iCobra):</strong> enquanto a conta estiver ativa + 90 dias após a exclusão da conta (período de recuperação)</li>
            <li><strong>Dados de pagamento e transações:</strong> 5 anos conforme exigência fiscal (Lei nº 9.613/98)</li>
            <li><strong>Logs de webhook:</strong> 12 meses</li>
            <li><strong>Backups de banco de dados:</strong> até 30 dias após geração</li>
          </ul>
        </Section>

        <Section title="7. Seus direitos como titular (Art. 18 LGPD)">
          <p>Você tem direito a:</p>
          <ul className="mt-3 space-y-2 list-disc pl-5">
            <li><strong>Acesso:</strong> confirmar a existência de tratamento e obter cópia dos seus dados</li>
            <li><strong>Retificação:</strong> corrigir dados incompletos, inexatos ou desatualizados (via Perfil)</li>
            <li><strong>Exclusão:</strong> solicitar a exclusão de dados tratados com base em consentimento (via Perfil → Excluir conta)</li>
            <li><strong>Portabilidade:</strong> exportar seus dados em formato JSON (via Perfil → Exportar meus dados)</li>
            <li><strong>Revogação de consentimento:</strong> retirar o consentimento para tratamentos baseados nele a qualquer momento</li>
            <li><strong>Informação sobre compartilhamento:</strong> saber com quais entidades compartilhamos seus dados (esta política)</li>
          </ul>
          <p className="mt-4">
            Para exercer esses direitos ou fazer qualquer solicitação, acesse sua página de{' '}
            <Link href="/dashboard/perfil" className="text-primary underline">Perfil</Link> ou contate:{' '}
            <a href="mailto:eaedanilo1@gmail.com" className="text-primary underline">eaedanilo1@gmail.com</a>.
            Respondemos em até 15 dias.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Utilizamos exclusivamente cookies de sessão necessários para autenticação (tokens HttpOnly, Secure),
            gerenciados pelo Supabase Auth. Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.
          </p>
        </Section>

        <Section title="9. Segurança">
          <p>
            Adotamos medidas técnicas como Row Level Security (RLS) no banco de dados, transmissão criptografada
            via HTTPS, autenticação segura com confirmação por e-mail e armazenamento de senhas em hash.
            Nenhum sistema é 100% seguro; em caso de incidente, notificaremos os titulares afetados conforme
            exigido pelo Art. 48 da LGPD.
          </p>
        </Section>

        <Section title="10. Alterações nesta política">
          <p>
            Podemos atualizar esta política periodicamente. Alterações relevantes serão comunicadas por e-mail
            ou via aviso na plataforma com antecedência mínima de 15 dias. A data de &quot;última atualização&quot;
            no topo indica a versão vigente.
          </p>
        </Section>

        <Section title="11. Contato e DPO">
          <p>
            Responsável pelo tratamento de dados:<br />
            <strong>Danilo</strong><br />
            E-mail: <a href="mailto:eaedanilo1@gmail.com" className="text-primary underline">eaedanilo1@gmail.com</a>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Você também pode registrar reclamações junto à{' '}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              ANPD (Autoridade Nacional de Proteção de Dados)
            </a>.
          </p>
        </Section>
      </main>

      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
