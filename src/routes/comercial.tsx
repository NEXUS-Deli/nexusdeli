import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  ChevronLeft, ChevronRight, Play, CheckCircle, BarChart3, 
  Smartphone, Users, MessageSquare, Percent, Sparkles, 
  TrendingUp, FileText, PlusCircle, Volume2, ShieldAlert, Award, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/comercial")({
  component: ComercialPage,
});

const SLIDES = [
  { id: "hero", label: "Apresentação" },
  { id: "problema", label: "O Problema" },
  { id: "solucao", label: "A Solução" },
  { id: "como-funciona", label: "Como Funciona" },
  { id: "crm", label: "CRM Inteligente" },
  { id: "campanhas", label: "Campanhas WhatsApp" },
  { id: "fidelizacao", label: "Fidelização" },
  { id: "comparativo", label: "Comparativo" },
  { id: "roi", label: "Simulador de ROI" },
  { id: "oferta", label: "A Oferta" },
  { id: "fechamento", label: "Fechamento" }
];

function ComercialPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // ROI Simulator States
  const [monthlyOrders, setMonthlyOrders] = useState(1500);
  const [ticketMedio, setTicketMedio] = useState(65);
  const [lossRate, setLossRate] = useState(25); // % of customers who don't return in 30 days

  useEffect(() => {
    if (!loading && (!user || !profile?.is_super_admin)) {
      toast.error("Acesso restrito para administradores.");
      navigate({ to: "/dashboard" });
    }
  }, [user, profile, loading, navigate]);

  if (loading || !profile?.is_super_admin) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // ROI Calculations
  const monthlyRevenue = monthlyOrders * ticketMedio;
  const lostCustomersValue = monthlyRevenue * (lossRate / 100);
  // ChamAI recovers ~35% of lost customers
  const recoveredRevenue = lostCustomersValue * 0.35;
  const netReturn = recoveredRevenue - 300; // 300 BRL monthly price
  const roiMultiplier = (recoveredRevenue / 300).toFixed(1);

  const handleGenerateProposal = () => {
    toast.success("Proposta comercial em PDF gerada com sucesso! Enviando para o seu e-mail.");
  };

  const handleCreateCompany = () => {
    navigate({ to: "/super-admin" });
    toast.info("Crie uma nova empresa e vincule o cliente no painel Super Admin.");
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-[#0F1424]/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ChamAI" className="h-8 w-auto object-contain" />
          <span className="text-xs bg-gradient-to-r from-[#FF5E36]/20 to-[#FF1E56]/20 text-[#FF5E36] border border-[#FF5E36]/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Apresentação Comercial
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 font-medium">
            Slide {currentSlide + 1} de {SLIDES.length}
          </span>
          <div className="h-1.5 w-32 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Slide Area */}
      <main className="flex-1 relative flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto min-h-[500px] flex items-center justify-center">
          
          {/* SLIDE 1: Hero */}
          {currentSlide === 0 && (
            <div className="text-center space-y-8 animate-fadeIn max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5E36]/10 to-[#FF1E56]/10 px-4 py-1.5 text-sm font-semibold text-[#FF5E36] border border-[#FF5E36]/20">
                <Sparkles className="w-4 h-4" /> A Nova Era do Delivery Automático
              </span>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">
                O fim do <span className="bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] bg-clip-text text-transparent">delivery parado</span>.
              </h1>
              <p className="text-lg lg:text-xl text-gray-400 leading-relaxed">
                Transforme seu canal do WhatsApp em uma máquina de vendas automática. Recupere clientes sumidos, automatize o cardápio e dispare o seu faturamento.
              </p>
              <div className="pt-6 flex justify-center gap-4">
                <button 
                  onClick={nextSlide}
                  className="bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] hover:opacity-95 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#FF5E36]/10 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  Iniciar Apresentação <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 2: Problema */}
          {currentSlide === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full animate-fadeIn">
              <div className="space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-red-500">O Cenário Atual</span>
                <h2 className="text-4xl font-extrabold tracking-tight">O vazamento silencioso de clientes no delivery.</h2>
                <p className="text-gray-400 leading-relaxed">
                  Restaurantes gastam fortunas para atrair clientes no iFood ou Instagram, mas <strong>perdem de 20% a 30% da base todos os meses</strong>.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl">
                    <span className="text-red-500 font-bold">●</span>
                    <p className="text-sm text-gray-300">Clientes compram uma vez e nunca mais retornam.</p>
                  </div>
                  <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl">
                    <span className="text-red-500 font-bold">●</span>
                    <p className="text-sm text-gray-300">Mensagens manuais no WhatsApp tomam tempo e são ineficientes.</p>
                  </div>
                  <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl">
                    <span className="text-red-500 font-bold">●</span>
                    <p className="text-sm text-gray-300">Falta de dados e CRM para saber quem parou de comprar.</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#0F1424] border border-gray-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500/10 text-red-500 text-xs px-3 py-1 rounded-bl-xl font-bold uppercase">Dado Alarmante</div>
                <span className="text-7xl font-black text-red-500">27%</span>
                <h3 className="mt-4 text-xl font-bold">Taxa Média de Churn</h3>
                <p className="mt-2 text-sm text-gray-400 max-w-xs">
                  Dos clientes que compram este mês, mais de um quarto não pedirá no mês seguinte sem um estímulo ativo.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 3: Solução */}
          {currentSlide === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full animate-fadeIn">
              <div className="bg-gradient-to-br from-[#0F1424] to-[#151B30] border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF5E36]/10 rounded-full blur-2xl" />
                <div className="space-y-4">
                  <div className="h-10 w-10 bg-[#FF5E36]/15 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#FF5E36]" />
                  </div>
                  <h3 className="text-xl font-bold">Automação Inteligente de Vendas</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    O ChamAI analisa o comportamento dos clientes, categoriza sua base e envia a mensagem certa, na hora certa, de forma 100% autônoma.
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-[#FF5E36]">+35%</div>
                    <div className="text-xs text-gray-400 mt-1">Retenção ativa</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-500">Zero</div>
                    <div className="text-xs text-gray-400 mt-1">Trabalho manual</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">A Solução ChamAI</span>
                <h2 className="text-4xl font-extrabold tracking-tight">O CRM que vende por você enquanto você dorme.</h2>
                <p className="text-gray-400 leading-relaxed">
                  Conectamos o seu painel ao WhatsApp oficial do seu restaurante. Nossa inteligência artificial monitora os hábitos de compra e estimula novas vendas automaticamente.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Monitoramento automático de inativos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Campanhas e cupons de recompra
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Integração instantânea com WhatsApp
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* SLIDE 4: Como Funciona */}
          {currentSlide === 3 && (
            <div className="space-y-8 w-full animate-fadeIn">
              <div className="text-center space-y-3">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">Simples e Direto</span>
                <h2 className="text-3xl font-extrabold tracking-tight">Fluxo Operacional Automatizado</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0F1424] border border-gray-800 rounded-2xl p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto text-lg font-bold">1</div>
                  <h3 className="text-lg font-bold">Integração</h3>
                  <p className="text-sm text-gray-400">
                    O ChamAI conecta com seu WhatsApp de atendimento e importa os dados históricos do seu delivery.
                  </p>
                </div>
                <div className="bg-[#0F1424] border border-gray-800 rounded-2xl p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto text-lg font-bold">2</div>
                  <h3 className="text-lg font-bold">Análise e Regras</h3>
                  <p className="text-sm text-gray-400">
                    Nossa IA classifica quem é cliente frequente, quem está sumido e quem precisa de um incentivo de compra.
                  </p>
                </div>
                <div className="bg-[#0F1424] border border-gray-800 rounded-2xl p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-[#FF1E56]/10 text-[#FF1E56] flex items-center justify-center mx-auto text-lg font-bold">3</div>
                  <h3 className="text-lg font-bold">Disparo & Lucro</h3>
                  <p className="text-sm text-gray-400">
                    Disparos individuais e humanizados são feitos no privado, estimulando o pedido e gerando novas vendas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: CRM */}
          {currentSlide === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full animate-fadeIn">
              <div className="space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">CRM Ativo</span>
                <h2 className="text-4xl font-extrabold tracking-tight">Não perca o rastro de nenhum cliente.</h2>
                <p className="text-gray-400 leading-relaxed">
                  Nossa aba de clientes categoriza automaticamente toda a sua base de contatos em funis dinâmicos de comportamento:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0F1424] border border-gray-800 p-4 rounded-xl">
                    <span className="text-[#FF5E36] font-bold block text-lg">Novos</span>
                    <span className="text-xs text-gray-400">Primeira compra feita nos últimos 7 dias.</span>
                  </div>
                  <div className="bg-[#0F1424] border border-gray-800 p-4 rounded-xl">
                    <span className="text-emerald-500 font-bold block text-lg">Frequentes</span>
                    <span className="text-xs text-gray-400">Compram com frequência e regularidade.</span>
                  </div>
                  <div className="bg-[#0F1424] border border-gray-800 p-4 rounded-xl">
                    <span className="text-amber-500 font-bold block text-lg">Em Risco</span>
                    <span className="text-xs text-gray-400">Não pedem há mais de 20 dias.</span>
                  </div>
                  <div className="bg-[#0F1424] border border-gray-800 p-4 rounded-xl">
                    <span className="text-red-500 font-bold block text-lg">Inativos</span>
                    <span className="text-xs text-gray-400">Sumidos há mais de 45 dias.</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-gray-800 rounded-3xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <span className="text-sm font-bold">Simulação de Funil de Clientes</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Tempo Real</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="bg-[#0F1424] p-3 rounded-lg flex items-center justify-between border border-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-semibold">João da Silva</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Frequente</span>
                  </div>
                  <div className="bg-[#0F1424] p-3 rounded-lg flex items-center justify-between border border-amber-500/10">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-sm font-semibold">Maria Souza</span>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">Em Risco (19 dias)</span>
                  </div>
                  <div className="bg-[#0F1424] p-3 rounded-lg flex items-center justify-between border border-red-500/10">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-sm font-semibold">Carlos Ferreira</span>
                    </div>
                    <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded">Inativo (43 dias)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: Campanhas */}
          {currentSlide === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full animate-fadeIn">
              <div className="bg-slate-900/50 border border-gray-800 rounded-3xl p-6 space-y-4">
                <div className="bg-[#0B0F19] rounded-2xl p-4 border border-gray-800 space-y-3">
                  <div className="flex items-center gap-2 text-[#FF5E36]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Preview da Mensagem</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-gray-800">
                    "Olá, <strong>João</strong>! Vimos que faz um tempinho que você não pede nossa pizza favorita 🍕. Que tal um desconto de <strong>15%</strong> válido apenas para hoje? Clique aqui: link.chamai.delivery/123"
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Taxa de abertura média: <strong>98%</strong></span>
                    <span>CLIQUES: <strong>43%</strong></span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">Campanhas Instantâneas</span>
                <h2 className="text-4xl font-extrabold tracking-tight">O poder do disparo inteligente.</h2>
                <p className="text-gray-400 leading-relaxed">
                  Crie campanhas segmentadas e personalizadas por nome, produto favorito ou período de inatividade. O envio direto no celular do cliente garante a maior taxa de conversão do mercado.
                </p>
                <div className="flex items-center gap-4 bg-[#0F1424] p-4 rounded-xl border border-gray-800">
                  <div className="text-3xl font-black text-[#FF5E36]">98%</div>
                  <div className="text-xs text-gray-400 leading-normal">
                    Taxa de abertura no WhatsApp contra apenas 15% do e-mail ou 2% do Instagram orgânico.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: Fidelização */}
          {currentSlide === 6 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full animate-fadeIn">
              <div className="space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">Programa de Fidelidade</span>
                <h2 className="text-4xl font-extrabold tracking-tight">Estimule a recorrência de forma nativa.</h2>
                <p className="text-gray-400 leading-relaxed">
                  Com o sistema de fidelização da ChamAI, o cliente ganha pontos ou vantagens automáticas no fechamento de cada pedido no WhatsApp.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-300">Pontuação creditada de forma 100% automática.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-300">Alerta de resgate direto no celular quando atinge o prêmio.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-300">Aumenta a frequência de compra mensal do cliente em até 2.4x.</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#0F1424] border border-gray-800 rounded-3xl p-8 text-center space-y-4">
                <div className="h-16 w-16 bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#FF5E36]/25">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Fidelidade Recorrente</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Clientes cadastrados em programas de fidelidade compram com mais frequência e têm ticket médio 18% maior.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 8: Comparativo */}
          {currentSlide === 7 && (
            <div className="space-y-8 w-full animate-fadeIn">
              <div className="text-center space-y-3">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">Comparativo de Mercado</span>
                <h2 className="text-3xl font-extrabold tracking-tight">ChamAI vs. Outras Alternativas</h2>
              </div>
              <div className="overflow-x-auto border border-gray-800 rounded-2xl">
                <table className="w-full border-collapse text-left bg-[#0F1424]">
                  <thead>
                    <tr className="border-b border-gray-800 bg-slate-900/50">
                      <th className="p-4 text-sm font-bold text-gray-300">Funcionalidade</th>
                      <th className="p-4 text-sm font-bold text-[#FF5E36]">ChamAI Delivery</th>
                      <th className="p-4 text-sm font-bold text-gray-400">WhatsApp Comum</th>
                      <th className="p-4 text-sm font-bold text-gray-400">iFood / Plataformas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="p-4 text-sm font-medium">Automação de Inativos</td>
                      <td className="p-4 text-sm text-emerald-500 font-bold">Sim (Automático)</td>
                      <td className="p-4 text-sm text-red-500">Não (Manual)</td>
                      <td className="p-4 text-sm text-red-500">Não</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="p-4 text-sm font-medium">Taxas de Pedido</td>
                      <td className="p-4 text-sm text-emerald-500 font-bold">0% (Sem comissão)</td>
                      <td className="p-4 text-sm text-emerald-500 font-bold">0%</td>
                      <td className="p-4 text-sm text-red-500">12% a 27% por pedido</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="p-4 text-sm font-medium">Base de Dados & CRM</td>
                      <td className="p-4 text-sm text-emerald-500 font-bold">Sim (Completo)</td>
                      <td className="p-4 text-sm text-red-500">Não</td>
                      <td className="p-4 text-sm text-red-500">Não (iFood esconde a base)</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-medium">Programa de Fidelidade</td>
                      <td className="p-4 text-sm text-emerald-500 font-bold">Sim (Integrado)</td>
                      <td className="p-4 text-sm text-red-500">Não</td>
                      <td className="p-4 text-sm text-amber-500">Pago / Limitado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLIDE 9: Simulador ROI */}
          {currentSlide === 8 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full animate-fadeIn">
              <div className="space-y-6">
                <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">Simulador de Retorno</span>
                <h2 className="text-4xl font-extrabold tracking-tight">Simule o Retorno sobre o Investimento</h2>
                
                <div className="space-y-5 bg-[#0F1424] p-6 rounded-2xl border border-gray-800">
                  {/* Slider 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Pedidos mensais:</span>
                      <span className="text-white font-bold">{monthlyOrders} pedidos</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="10000" 
                      step="50"
                      value={monthlyOrders}
                      onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF5E36]"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Ticket médio por pedido:</span>
                      <span className="text-white font-bold">R$ {ticketMedio},00</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="200" 
                      step="5"
                      value={ticketMedio}
                      onChange={(e) => setTicketMedio(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF5E36]"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Perda de clientes (mensal):</span>
                      <span className="text-white font-bold">{lossRate}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="50" 
                      step="1"
                      value={lossRate}
                      onChange={(e) => setLossRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF5E36]"
                    />
                  </div>
                </div>
              </div>

              {/* ROI Panel */}
              <div className="bg-gradient-to-br from-[#0F1424] to-[#151B30] border border-gray-800 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FF5E36]/15 text-[#FF5E36] text-xs px-3 py-1 rounded-bl-xl font-bold uppercase">Resultado Simulado</div>
                
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Faturamento Recuperado</span>
                  <div className="text-4xl lg:text-5xl font-black text-emerald-500">
                    R$ {recoveredRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-xs text-gray-500 leading-normal block">
                    Recuperação média estimada de 35% dos clientes inativos.
                  </span>
                </div>

                <div className="pt-6 border-t border-gray-800 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-bold block">Retorno Líquido</span>
                    <span className="text-lg font-bold text-gray-200">
                      R$ {netReturn.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-bold block">Multiplicador ROI</span>
                    <span className="text-lg font-bold text-[#FF5E36]">{roiMultiplier}x mais faturamento</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 10: Oferta */}
          {currentSlide === 9 && (
            <div className="text-center space-y-8 animate-fadeIn max-w-2xl mx-auto">
              <span className="text-sm font-bold uppercase tracking-wider text-[#FF5E36]">Assinatura Sem Fidelidade</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Investimento Simples e Justo</h2>
              <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
                Acesse todas as funcionalidades do ChamAI Delivery, sem taxas ocultas ou contratos de fidelização.
              </p>
              
              <div className="bg-gradient-to-br from-[#0F1424] to-[#151B30] border-2 border-[#FF5E36] rounded-3xl p-8 max-w-sm mx-auto shadow-xl shadow-[#FF5E36]/5 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#FF5E36] text-white text-xs px-4 py-1 rounded-full font-bold uppercase tracking-wide">Plano Único</div>
                <div className="space-y-4">
                  <div className="text-5xl font-black text-white">R$ 300,00<span className="text-sm text-gray-400 font-normal">/mês</span></div>
                  <div className="text-xs text-[#FF5E36] font-bold">Sem comissões por pedido. Lucro 100% seu.</div>
                  <div className="border-t border-gray-800 pt-4 space-y-2 text-left text-sm text-gray-300">
                    <div className="flex items-center gap-2">✓ WhatsApp Oficial ilimitado</div>
                    <div className="flex items-center gap-2">✓ Funil de CRM automático</div>
                    <div className="flex items-center gap-2">✓ Campanhas e cupons de recompra</div>
                    <div className="flex items-center gap-2">✓ Programa de fidelidade integrado</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 11: Fechamento */}
          {currentSlide === 10 && (
            <div className="text-center space-y-8 animate-fadeIn max-w-2xl mx-auto">
              <div className="h-16 w-16 bg-[#FF5E36]/10 rounded-3xl flex items-center justify-center mx-auto text-[#FF5E36]">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Pronto para começar?</h2>
              <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
                Selecione uma das opções abaixo para formalizar a proposta ou ativar o sistema imediatamente para a empresa parceira.
              </p>

              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGenerateProposal}
                  className="bg-white hover:bg-gray-100 text-[#0B0F19] font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <FileText className="w-5 h-5" /> Gerar Proposta Comercial
                </button>
                <button
                  onClick={handleCreateCompany}
                  className="bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] hover:opacity-95 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-lg shadow-[#FF5E36]/15"
                >
                  <PlusCircle className="w-5 h-5" /> Ativar/Criar Empresa
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Navigation Controls */}
      <footer className="h-20 border-t border-gray-800 bg-[#0F1424]/50 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 select-none">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-1 bg-gray-800/80 hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none text-white px-5 py-2.5 rounded-xl border border-gray-700/50 transition-all font-semibold cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>

        {/* Thumbnail Selector */}
        <div className="hidden md:flex items-center gap-1.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
                currentSlide === idx 
                  ? "bg-[#FF5E36] text-white border-transparent" 
                  : "bg-gray-800/40 text-gray-400 border-gray-800/60 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {slide.label}
            </button>
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === SLIDES.length - 1}
          className="flex items-center gap-1 bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] hover:opacity-95 disabled:opacity-40 disabled:pointer-events-none text-white px-5 py-2.5 rounded-xl transition-all font-semibold cursor-pointer"
        >
          Avançar <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
