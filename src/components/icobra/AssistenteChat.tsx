"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, Loader2, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LGPD_CONSENT_KEY = "icobra_ai_lgpd_consent";

function renderMarkdown(text: string): React.ReactNode {
  return text.split("\n").map((line, i, arr) => {
    const isBullet = /^[-*]\s/.test(line);
    const content = isBullet ? line.replace(/^[-*]\s/, "") : line;

    const bold = content.split(/\*\*(.*?)\*\*/g).map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );

    return (
      <span key={i}>
        {isBullet && <span className="mr-1">•</span>}
        {bold}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

type Mensagem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

const STORAGE_KEY = "icobra_chat_history";
const MAX_HISTORICO = 100;

const MSG_INICIAL: Mensagem = {
  id: "0",
  role: "assistant",
  content:
    "Olá! Sou o assistente do iCobra. Posso criar empréstimos, listar clientes, marcar parcelas como pagas e muito mais. Como posso ajudar?",
  timestamp: 0,
};

const SUGESTOES = [
  "Liste meus empréstimos ativos",
  "Quem está em atraso?",
  "Adicione João, emprestei R$200, vai pagar R$240 em 4x de R$60, começando dia 15",
];

function carregarHistorico(): Mensagem[] {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return [MSG_INICIAL];
    const parsed = JSON.parse(salvo) as Mensagem[];
    return parsed.length > 0 ? parsed : [MSG_INICIAL];
  } catch {
    return [MSG_INICIAL];
  }
}

function salvarHistorico(msgs: Mensagem[]) {
  try {
    const parasSalvar = [
      MSG_INICIAL,
      ...msgs.filter((m) => m.id !== "0").slice(-MAX_HISTORICO),
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parasSalvar));
  } catch {}
}

export function AssistenteChat() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mensagens, setMensagens] = useState<Mensagem[]>([MSG_INICIAL]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [hidratado, setHidratado] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMensagens(carregarHistorico());
    const consent = localStorage.getItem(LGPD_CONSENT_KEY);
    setLgpdConsent(consent === "true");
    setHidratado(true);
  }, []);

  function aceitarLgpd() {
    localStorage.setItem(LGPD_CONSENT_KEY, "true");
    setLgpdConsent(true);
  }

  useEffect(() => {
    if (hidratado) salvarHistorico(mensagens);
  }, [mensagens, hidratado]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  function limparHistorico() {
    setMensagens([MSG_INICIAL]);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function enviar(texto?: string) {
    const msg = (texto ?? input).trim();
    if (!msg || carregando) return;

    const novaMensagemUser: Mensagem = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: Date.now(),
    };

    const historico = [...mensagens, novaMensagemUser];
    setMensagens(historico);
    setInput("");
    setCarregando(true);

    try {
      const res = await fetch("/api/icobra/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historico
            .filter((m) => m.id !== "0")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const json = await res.json();
      const resposta = json.resposta ?? json.error ?? "Erro ao processar.";

      setMensagens((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: resposta,
          timestamp: Date.now(),
        },
      ]);

      if (json.mutated) {
        startTransition(() => router.refresh());
      }
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Erro de conexão. Tente novamente.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  if (hidratado && lgpdConsent === false) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center rounded-xl border bg-background shadow-sm p-8 text-center gap-6 max-w-md mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ShieldCheck className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Aviso de privacidade</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O assistente iCobra usa inteligência artificial da{' '}
            <strong>Anthropic Inc. (EUA)</strong>. As mensagens que você enviar,
            incluindo nomes de devedores e valores de empréstimos, serão processadas
            nos servidores da Anthropic conforme a{' '}
            <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Política de Privacidade
            </a>{' '}
            do iOrganiza.
          </p>
          <p className="text-sm text-muted-foreground">
            Ao continuar, você consente com esse tratamento (Art. 7-I, LGPD).
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Button onClick={aceitarLgpd} className="w-full">
            Entendi e quero continuar
          </Button>
          <a href="/dashboard/icobra" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Voltar ao painel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col rounded-xl border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>Assistente iCobra</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={limparHistorico}
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Limpar conversa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {m.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              )}
            >
              {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
            </div>
          </div>
        ))}

        {carregando && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {mensagens.length === 1 && (
        <div className="border-t px-4 py-3 flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Adicione Maria, emprestei R$500, paga R$600 em 3x..."
            disabled={carregando}
            className="flex-1"
          />
          <Button
            onClick={() => enviar()}
            disabled={!input.trim() || carregando}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
