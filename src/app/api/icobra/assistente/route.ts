import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import { calcularEmprestimo, calcularStatusParcela, diasEntreDatas, hoje } from "@/lib/icobra/calculos";
import { revalidatePath } from "next/cache";
import type { EmprestimoFormData } from "@/lib/icobra/types";
import { assertEmprestimoLimit } from "@/lib/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple in-memory rate limiter: 20 req/min per user
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `Você é o assistente do iCobra, sistema de gestão de empréstimos.
Hoje é ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.

Realize ações usando as ferramentas disponíveis. Responda em português, de forma amigável e concisa.

REGRA CRÍTICA — NUNCA VIOLE:
- Se o resultado da ferramenta contiver "erro": true, a operação FALHOU.
- Nesse caso, informe o usuário claramente que a ação NÃO foi realizada e mostre a mensagem de erro.
- JAMAIS confirme sucesso se o campo "sucesso" não for true no resultado.
- JAMAIS invente ou presuma que uma operação funcionou. Apenas confirme o que o resultado da ferramenta afirma explicitamente.

Ao criar empréstimo, extraia do texto:
- nome_pessoa: nome do devedor
- valor_emprestado: valor emprestado
- valor_parcela: valor de cada parcela
- numero_parcelas: quantidade de parcelas
- data_primeiro_pagamento: primeira parcela em YYYY-MM-DD
- frequencia: diario/semanal/mensal (inferir; padrão mensal)

Para "dia 12" sem mês, use o mês/ano atual.
Se o intervalo entre parcelas for ~7 dias use semanal, ~30 dias use mensal, ~1 dia use diario.`;

const tools: Anthropic.Tool[] = [
  {
    name: "criar_emprestimo",
    description: "Cria um novo empréstimo",
    input_schema: {
      type: "object" as const,
      properties: {
        nome_pessoa: { type: "string" },
        valor_emprestado: { type: "number" },
        valor_parcela: { type: "number" },
        numero_parcelas: { type: "number" },
        data_primeiro_pagamento: { type: "string", description: "YYYY-MM-DD" },
        frequencia: { type: "string", enum: ["diario", "semanal", "mensal"] },
      },
      required: ["nome_pessoa", "valor_emprestado", "valor_parcela", "numero_parcelas", "data_primeiro_pagamento"],
    },
  },
  {
    name: "listar_emprestimos",
    description: "Lista empréstimos do usuário",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "string", enum: ["ativo", "quitado", "todos"] },
        nome_pessoa: { type: "string" },
      },
    },
  },
  {
    name: "ver_emprestimo",
    description: "Ver detalhes e parcelas de um empréstimo",
    input_schema: {
      type: "object" as const,
      properties: {
        nome_pessoa: { type: "string" },
      },
      required: ["nome_pessoa"],
    },
  },
  {
    name: "marcar_parcela_paga",
    description: "Marca uma parcela como paga",
    input_schema: {
      type: "object" as const,
      properties: {
        nome_pessoa: { type: "string" },
        numero_parcela: { type: "number" },
      },
      required: ["nome_pessoa", "numero_parcela"],
    },
  },
  {
    name: "deletar_emprestimo",
    description: "Exclui um empréstimo",
    input_schema: {
      type: "object" as const,
      properties: {
        nome_pessoa: { type: "string" },
      },
      required: ["nome_pessoa"],
    },
  },
  {
    name: "ver_inadimplentes",
    description: "Lista parcelas em atraso",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
];

async function executarFerramenta(
  nome: string,
  input: Record<string, unknown>,
  userId: string
): Promise<string> {
  const supabase = createICobraServiceClient();

  switch (nome) {
    case "criar_emprestimo": {
      try {
        await assertEmprestimoLimit(userId);
      } catch (e) {
        return JSON.stringify({ erro: true, mensagem: e instanceof Error ? e.message : 'Limite de empréstimos atingido.' });
      }

      const formData: EmprestimoFormData = {
        nome_pessoa: String(input.nome_pessoa),
        valor_emprestado: Number(input.valor_emprestado),
        tipo_retorno: "valor_fixo",
        valor_parcela_input: Number(input.valor_parcela),
        frequencia: (input.frequencia as EmprestimoFormData["frequencia"]) ?? "mensal",
        numero_parcelas: Number(input.numero_parcelas),
        data_primeiro_pagamento: String(input.data_primeiro_pagamento),
        dias_pagamento: "todos_dias",
      };

      const calculo = calcularEmprestimo(formData);

      const { data: emprestimo, error } = await supabase
        .from("emprestimos")
        .insert({
          user_id: userId,
          nome_pessoa: formData.nome_pessoa.trim(),
          valor_emprestado: formData.valor_emprestado,
          tipo_retorno: formData.tipo_retorno,
          percentual: null,
          frequencia: formData.frequencia,
          numero_parcelas: formData.numero_parcelas,
          data_primeiro_pagamento: formData.data_primeiro_pagamento,
          dias_pagamento: formData.dias_pagamento,
          valor_parcela: calculo.valor_parcela,
          total_a_receber: calculo.total_a_receber,
          lucro: calculo.lucro,
          status: "ativo",
        })
        .select()
        .single();

      if (error || !emprestimo) {
        return JSON.stringify({ erro: true, mensagem: `Falha ao inserir no banco: ${error?.message ?? "resposta vazia"}` });
      }

      const parcelas = calculo.datas_vencimento.map((dataVenc, i) => ({
        emprestimo_id: emprestimo.id,
        user_id: userId,
        numero: i + 1,
        data_vencimento: dataVenc,
        valor: calculo.valor_parcela,
        status: "pendente" as const,
      }));

      const { error: errParcelas } = await supabase.from("parcelas").insert(parcelas);
      if (errParcelas) {
        await supabase.from("emprestimos").delete().eq("id", emprestimo.id);
        return JSON.stringify({ erro: true, mensagem: `Empréstimo criado mas parcelas falharam: ${errParcelas.message}. Operação revertida.` });
      }

      // Verificação pós-insert: confirma que o registro existe no banco
      const { data: verificacao } = await supabase
        .from("emprestimos")
        .select("id")
        .eq("id", emprestimo.id)
        .maybeSingle();

      if (!verificacao) {
        return JSON.stringify({ erro: true, mensagem: "Empréstimo não encontrado após gravação. Dados podem não ter sido salvos." });
      }

      revalidatePath("/dashboard/icobra");
      revalidatePath("/dashboard/icobra/emprestimos");

      return JSON.stringify({
        sucesso: true,
        id: emprestimo.id,
        nome_pessoa: formData.nome_pessoa,
        valor_emprestado: formData.valor_emprestado,
        valor_parcela: calculo.valor_parcela,
        total_a_receber: calculo.total_a_receber,
        numero_parcelas: formData.numero_parcelas,
        datas: calculo.datas_vencimento,
      });
    }

    case "listar_emprestimos": {
      let query = supabase
        .from("emprestimos")
        .select("id, nome_pessoa, valor_emprestado, total_a_receber, numero_parcelas, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (input.status && input.status !== "todos") {
        query = query.eq("status", input.status as string);
      }
      if (input.nome_pessoa) {
        query = query.ilike("nome_pessoa", `%${input.nome_pessoa}%`);
      }

      const { data, error } = await query;
      if (error) return JSON.stringify({ erro: true, mensagem: `Falha ao consultar empréstimos: ${error.message}` });
      if (!data || data.length === 0) return JSON.stringify({ emprestimos: [], total: 0 });

      return JSON.stringify({ emprestimos: data, total: data.length });
    }

    case "ver_emprestimo": {
      const { data: emprestimos, error } = await supabase
        .from("emprestimos")
        .select("*, parcelas(*)")
        .eq("user_id", userId)
        .ilike("nome_pessoa", `%${input.nome_pessoa}%`)
        .limit(1);

      if (error) return JSON.stringify({ erro: true, mensagem: `Falha ao buscar: ${error.message}` });
      if (!emprestimos || emprestimos.length === 0) {
        return JSON.stringify({ erro: false, encontrado: false, mensagem: `Nenhum empréstimo encontrado para "${input.nome_pessoa}".` });
      }

      const emp = emprestimos[0];
      const dataHoje = hoje();
      const parcelas = (emp.parcelas ?? []).map((p: any) => ({
        numero: p.numero,
        valor: p.valor,
        data_vencimento: p.data_vencimento,
        status: calcularStatusParcela(p.data_vencimento, p.data_pagamento),
        data_pagamento: p.data_pagamento,
        dias_atraso: p.data_pagamento ? null : diasEntreDatas(p.data_vencimento, dataHoje),
      }));

      return JSON.stringify({
        id: emp.id,
        nome_pessoa: emp.nome_pessoa,
        valor_emprestado: emp.valor_emprestado,
        total_a_receber: emp.total_a_receber,
        valor_parcela: emp.valor_parcela,
        numero_parcelas: emp.numero_parcelas,
        status: emp.status,
        parcelas,
      });
    }

    case "marcar_parcela_paga": {
      const { data: emprestimos, error: errEmp } = await supabase
        .from("emprestimos")
        .select("id, nome_pessoa")
        .eq("user_id", userId)
        .ilike("nome_pessoa", `%${input.nome_pessoa}%`)
        .limit(1);

      if (errEmp) return JSON.stringify({ erro: true, mensagem: `Falha ao buscar empréstimo: ${errEmp.message}` });
      if (!emprestimos || emprestimos.length === 0) {
        return JSON.stringify({ erro: true, mensagem: `Empréstimo de "${input.nome_pessoa}" não encontrado.` });
      }

      const empId = emprestimos[0].id;
      const { data: parcela, error: errParc } = await supabase
        .from("parcelas")
        .select("id, status, data_pagamento")
        .eq("emprestimo_id", empId)
        .eq("numero", Number(input.numero_parcela))
        .single();

      if (errParc || !parcela) {
        return JSON.stringify({ erro: true, mensagem: `Parcela ${input.numero_parcela} não encontrada no empréstimo de ${emprestimos[0].nome_pessoa}.` });
      }
      if (parcela.data_pagamento) {
        return JSON.stringify({ sucesso: true, ja_paga: true, mensagem: `Parcela ${input.numero_parcela} já estava marcada como paga.` });
      }

      const { error: errUpdate } = await supabase
        .from("parcelas")
        .update({ data_pagamento: hoje(), status: "pago" })
        .eq("id", parcela.id);

      if (errUpdate) {
        return JSON.stringify({ erro: true, mensagem: `Falha ao atualizar parcela: ${errUpdate.message}` });
      }

      // Verificação pós-update
      const { data: verificacao } = await supabase
        .from("parcelas")
        .select("data_pagamento")
        .eq("id", parcela.id)
        .maybeSingle();

      if (!verificacao?.data_pagamento) {
        return JSON.stringify({ erro: true, mensagem: "Atualização falhou silenciosamente. Parcela não foi marcada como paga." });
      }

      revalidatePath("/dashboard/icobra");
      revalidatePath("/dashboard/icobra/emprestimos");
      revalidatePath("/dashboard/icobra/inadimplencia");

      return JSON.stringify({ sucesso: true, parcela: Number(input.numero_parcela), nome_pessoa: emprestimos[0].nome_pessoa });
    }

    case "deletar_emprestimo": {
      const { data: emprestimos, error: errEmp } = await supabase
        .from("emprestimos")
        .select("id, nome_pessoa")
        .eq("user_id", userId)
        .ilike("nome_pessoa", `%${input.nome_pessoa}%`)
        .limit(1);

      if (errEmp) return JSON.stringify({ erro: true, mensagem: `Falha ao buscar: ${errEmp.message}` });
      if (!emprestimos || emprestimos.length === 0) {
        return JSON.stringify({ erro: true, mensagem: `Empréstimo de "${input.nome_pessoa}" não encontrado.` });
      }

      const { error } = await supabase
        .from("emprestimos")
        .delete()
        .eq("id", emprestimos[0].id);

      if (error) return JSON.stringify({ erro: true, mensagem: `Falha ao excluir: ${error.message}` });

      // Verificação pós-delete
      const { data: ainda } = await supabase
        .from("emprestimos")
        .select("id")
        .eq("id", emprestimos[0].id)
        .maybeSingle();

      if (ainda) {
        return JSON.stringify({ erro: true, mensagem: "Exclusão falhou silenciosamente. Registro ainda existe no banco." });
      }

      revalidatePath("/dashboard/icobra");
      revalidatePath("/dashboard/icobra/emprestimos");

      return JSON.stringify({ sucesso: true, nome_pessoa: emprestimos[0].nome_pessoa });
    }

    case "ver_inadimplentes": {
      const { data: parcelas, error: errParc } = await supabase
        .from("parcelas")
        .select("*, emprestimos(nome_pessoa)")
        .eq("user_id", userId)
        .is("data_pagamento", null);

      if (errParc) return JSON.stringify({ erro: true, mensagem: `Falha ao buscar inadimplentes: ${errParc.message}` });

      const dataHoje = hoje();
      const inadimplentes = (parcelas ?? [])
        .filter((p: any) => calcularStatusParcela(p.data_vencimento, p.data_pagamento) === "atrasado")
        .map((p: any) => ({
          nome_pessoa: p.emprestimos?.nome_pessoa,
          parcela: p.numero,
          valor: p.valor,
          data_vencimento: p.data_vencimento,
          dias_atraso: diasEntreDatas(p.data_vencimento, dataHoje),
        }))
        .sort((a: any, b: any) => b.dias_atraso - a.dias_atraso);

      return JSON.stringify({ inadimplentes, total: inadimplentes.length });
    }

    default:
      return "Ação desconhecida.";
  }
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!checkRateLimit(`assistente:${authUser.id}`)) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde um momento." },
      { status: 429 }
    );
  }

  // Check that user's active iCobra subscription has a plan with has_ai_chat = true
  {
    const { data: icobraSaas } = await supabase
      .from("saas")
      .select("id")
      .eq("slug", "icobra")
      .maybeSingle();

    if (icobraSaas) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id, saas_plans:plan_id(has_ai_chat)")
        .eq("user_id", authUser.id)
        .eq("saas_id", icobraSaas.id)
        .eq("status", "active")
        .maybeSingle();

      const hasAiAccess = (sub as any)?.saas_plans?.has_ai_chat === true;
      if (!hasAiAccess) {
        return NextResponse.json(
          { error: "Plano não inclui o assistente IA. Faça upgrade para o plano Pro." },
          { status: 403 }
        );
      }
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const raw = (body as any)?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) {
    return NextResponse.json({ error: "Campo 'messages' inválido." }, { status: 400 });
  }

  for (const m of raw) {
    if (m.role !== "user" && m.role !== "assistant") {
      return NextResponse.json({ error: "Role inválido." }, { status: 400 });
    }
    if (typeof m.content !== "string" || m.content.length > 4000) {
      return NextResponse.json({ error: "Conteúdo inválido." }, { status: 400 });
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no .env.local." },
      { status: 500 }
    );
  }

  const userId = authUser.id;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const claudeMessages: Anthropic.MessageParam[] = (raw as { role: "user" | "assistant"; content: string }[]).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const MUTATING_TOOLS = new Set(["criar_emprestimo", "marcar_parcela_paga", "deletar_emprestimo"]);

  let response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages: claudeMessages,
  });

  let mutated = false;

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      if (MUTATING_TOOLS.has(block.name)) mutated = true;
      const result = await executarFerramenta(
        block.name,
        block.input as Record<string, unknown>,
        userId
      );
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }

    claudeMessages.push({ role: "assistant", content: response.content });
    claudeMessages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: claudeMessages,
    });
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  return NextResponse.json({ resposta: textBlock?.text ?? "Ação executada.", mutated });
}
