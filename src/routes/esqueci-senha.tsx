import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Flame, Mail, Loader2, ArrowLeft, Send } from "lucide-react";

export const Route = createFileRoute("/esqueci-senha")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, informe seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/redefinir-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast.error(error.message || "Erro ao solicitar recuperação de senha.");
        setLoading(false);
        return;
      }

      setSent(true);
      toast.success("E-mail de recuperação enviado!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-20 pointer-events-none" />
      <div className="bg-glow absolute inset-0 opacity-10 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-3">
            <Flame className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nexus<span className="text-primary">Deli</span>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-glow">
          <div className="mb-6 flex items-center gap-3">
            <Link to="/login" className="p-1.5 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-foreground">Recuperar senha</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Informe o seu e-mail para receber as instruções.
              </p>
            </div>
          </div>

          {sent ? (
            <div className="space-y-4 text-center py-4">
              <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium">
                Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.
              </div>
              <p className="text-xs text-muted-foreground">
                Verifique sua caixa de entrada e pasta de spam.
              </p>
              <Link to="/login" className="mt-2 block w-full">
                <button className="w-full bg-background border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-accent transition-all cursor-pointer">
                  Voltar para o login
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">E-mail</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar link de recuperação
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
