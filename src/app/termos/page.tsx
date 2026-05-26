import Link from 'next/link';
import { Footer } from '@/components/shared/Footer';

export const metadata = {
  title: 'Termos de Uso — iOrganiza',
  description: 'Termos e condições de uso da plataforma iOrganiza.',
};

export default function TermosPage() {
  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="container flex h-14 items-center">
          <Link href="/" className="text-lg font-bold text-primary">iOrganiza</Link>
        </div>
      </header>

      <main className="container max-w-3xl py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Termos de Uso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última atualização: 26 de maio de 2026
          </p>
        </div>

        <Section title="1. Aceitação">
          <p>
            Ao criar uma conta ou usar qualquer serviço do <strong>iOrganiza</strong>, você concorda com estes
            Termos de Uso e com nossa{' '}
            <Link href="/privacidade" className="text-primary underline">Política de Privacidade</Link>.
            Se não concordar, não utilize a plataforma.
          </p>
        </Section>

        <Section title="2. Descrição do serviço">
          <p>
            O iOrganiza é uma plataforma SaaS que centraliza ferramentas de produtividade, incluindo o
            <strong> iCobra</strong> (gestão de empréstimos). Os serviços são prestados conforme o plano
            contratado, sujeito a disponibilidade e às condições descritas aqui.
          </p>
        </Section>

        <Section title="3. Cadastro e conta">
          <ul className="space-y-2 list-disc pl-5">
            <li>Você deve fornecer informações verdadeiras e manter seus dados atualizados.</li>
            <li>Você é responsável por manter a confidencialidade de sua senha.</li>
            <li>É proibido compartilhar credenciais de acesso com terceiros.</li>
            <li>Você deve ter ao menos 18 anos ou capacidade civil plena para contratar.</li>
          </ul>
        </Section>

        <Section title="4. Uso aceitável">
          <p>É proibido:</p>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            <li>Utilizar a plataforma para fins ilegais ou fraudulentos</li>
            <li>Registrar dados de terceiros sem autorização legal para processá-los</li>
            <li>Tentar acessar contas de outros usuários ou sistemas internos</li>
            <li>Fazer engenharia reversa, descompilar ou copiar o software</li>
            <li>Revender ou sublicenciar o acesso à plataforma</li>
            <li>Enviar spam, malware ou conteúdo ofensivo através dos sistemas</li>
          </ul>
        </Section>

        <Section title="5. Pagamento e assinaturas">
          <ul className="space-y-2 list-disc pl-5">
            <li>Planos pagos são cobrados antecipadamente pelo período contratado.</li>
            <li>O cancelamento interrompe a renovação; o acesso permanece até o fim do período pago.</li>
            <li>Não há reembolso de períodos parciais, salvo obrigação legal (ex: Código de Defesa do Consumidor Art. 49 — direito de arrependimento em 7 dias para contratações online).</li>
            <li>Preços podem ser alterados com aviso prévio de 30 dias.</li>
          </ul>
        </Section>

        <Section title="6. Seus dados no iCobra">
          <p>
            Os dados de empréstimos e devedores que você cadastra no iCobra são de sua exclusiva
            responsabilidade. Você declara ter base legal para tratar esses dados conforme a LGPD
            (ex: contrato com o devedor). O iOrganiza é mero processador desses dados em seu nome.
          </p>
          <p className="mt-2">
            Ao usar o assistente de IA do iCobra, você consente que dados das suas consultas
            (incluindo nomes e valores) sejam processados pela Anthropic Inc. (EUA) conforme
            indicado na nossa Política de Privacidade.
          </p>
        </Section>

        <Section title="7. Propriedade intelectual">
          <p>
            Todo o software, design, marca e conteúdo da plataforma são propriedade do iOrganiza e
            protegidos por direitos autorais. O uso da plataforma não lhe confere nenhum direito
            sobre esses ativos além do acesso ao serviço contratado.
          </p>
        </Section>

        <Section title="8. Disponibilidade e SLA">
          <p>
            Nos esforçamos para manter disponibilidade superior a 99%, mas não garantimos serviço
            ininterrupto. Manutenções programadas serão comunicadas com antecedência quando possível.
            Não somos responsáveis por indisponibilidades causadas por terceiros (Supabase, Vercel, etc.).
          </p>
        </Section>

        <Section title="9. Limitação de responsabilidade">
          <p>
            O iOrganiza é fornecido &quot;como está&quot;. Não nos responsabilizamos por perdas indiretas,
            lucros cessantes, perda de dados por falha do usuário ou danos decorrentes do uso dos
            dados cadastrados (ex: cobranças a devedores). Nossa responsabilidade total é limitada
            ao valor pago nos últimos 3 meses de assinatura.
          </p>
        </Section>

        <Section title="10. Rescisão">
          <p>
            Podemos suspender ou encerrar sua conta imediatamente em caso de violação destes Termos,
            uso fraudulento ou por determinação legal. Você pode excluir sua conta a qualquer momento
            via <Link href="/dashboard/perfil" className="text-primary underline">Perfil → Excluir conta</Link>.
            Após 90 dias da exclusão, seus dados serão permanentemente removidos, exceto os que
            devemos manter por obrigação legal.
          </p>
        </Section>

        <Section title="11. Lei aplicável e foro">
          <p>
            Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de
            domicílio do usuário para dirimir eventuais conflitos, conforme Art. 101, I do CDC.
          </p>
        </Section>

        <Section title="12. Contato">
          <p>
            Dúvidas sobre estes Termos:{' '}
            <a href="mailto:eaedanilo1@gmail.com" className="text-primary underline">eaedanilo1@gmail.com</a>
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
