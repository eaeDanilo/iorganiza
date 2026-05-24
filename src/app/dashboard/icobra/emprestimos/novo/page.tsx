import { PageHeader } from "@/components/icobra/PageHeader";
import { NovoEmprestimoFlow } from "./NovoEmprestimoFlow";

export default function NovoEmprestimoPage() {
  return (
    <div>
      <PageHeader
        title="Novo empréstimo"
        description="Preencha os dados e revise antes de salvar."
      />
      <NovoEmprestimoFlow />
    </div>
  );
}
