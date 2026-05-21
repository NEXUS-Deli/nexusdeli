import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import {
  Printer,
  FileText,
  Save,
  Loader2,
  Plus,
  Trash2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";

export const Route = createFileRoute("/configuracoes")({
  component: SettingsPage,
});

type PrinterSetting = {
  id: string;
  printer_name: string;
  printer_sector: string;
  printer_type: string;
  paper_width: string;
  print_mode: string;
  auto_print: boolean;
  copies: number;
  footer_text: string | null;
  is_active: boolean;
};

type ReceiptTemplate = {
  id: string;
  name: string;
  paper_width: string;
  show_logo: boolean;
  show_customer_phone: boolean;
  show_delivery_address: boolean;
  show_payment_method: boolean;
  show_qr_code_pix: boolean;
  show_order_qr_code: boolean;
  header_text: string | null;
  footer_text: string | null;
  is_default: boolean;
  is_active: boolean;
};

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"impressao" | "recibos">("impressao");
  const [printers, setPrinters] = useState<PrinterSetting[]>([]);
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Printer form
  const [showPrinterForm, setShowPrinterForm] = useState(false);
  const [editPrinter, setEditPrinter] = useState<PrinterSetting | null>(null);
  const [printerName, setPrinterName] = useState("");
  const [printerSector, setPrinterSector] = useState("cozinha");
  const [printerPaper, setPrinterPaper] = useState("80mm");
  const [printerMode, setPrinterMode] = useState("browser");
  const [printerCopies, setPrinterCopies] = useState("1");
  const [printerFooter, setPrinterFooter] = useState("");
  const [printerAuto, setPrinterAuto] = useState(false);

  // Template form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ReceiptTemplate | null>(null);
  const [templateName, setTemplateName] = useState("Modelo padrao");
  const [templatePaper, setTemplatePaper] = useState("80mm");
  const [templateShowLogo, setTemplateShowLogo] = useState(false);
  const [templateShowPhone, setTemplateShowPhone] = useState(true);
  const [templateShowAddress, setTemplateShowAddress] = useState(true);
  const [templateShowPayment, setTemplateShowPayment] = useState(true);
  const [templateHeader, setTemplateHeader] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();
      const [printResult, templResult] = await Promise.all([
        supabase.from("printer_settings").select("*").eq("company_id", companyId),
        supabase.from("receipt_templates").select("*").eq("company_id", companyId),
      ]);
      if (printResult.data) setPrinters(printResult.data);
      if (templResult.data) setTemplates(templResult.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetPrinterForm = () => {
    setPrinterName("");
    setPrinterSector("cozinha");
    setPrinterPaper("80mm");
    setPrinterMode("browser");
    setPrinterCopies("1");
    setPrinterFooter("");
    setPrinterAuto(false);
    setEditPrinter(null);
  };

  const resetTemplateForm = () => {
    setTemplateName("Modelo padrao");
    setTemplatePaper("80mm");
    setTemplateShowLogo(false);
    setTemplateShowPhone(true);
    setTemplateShowAddress(true);
    setTemplateShowPayment(true);
    setTemplateHeader("");
    setTemplateFooter("");
    setEditTemplate(null);
  };

  const handleSavePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const companyId = await getCompanyId();
      const payload = {
        company_id: companyId,
        printer_name: printerName || null,
        printer_sector: printerSector,
        paper_width: printerPaper,
        print_mode: printerMode,
        copies: Number(printerCopies) || 1,
        footer_text: printerFooter || null,
        auto_print: printerAuto,
      };

      if (editPrinter) {
        const { error } = await supabase.from("printer_settings").update(payload).eq("id", editPrinter.id);
        if (error) throw error;
        toast.success("Impressora atualizada");
      } else {
        const { error } = await supabase.from("printer_settings").insert(payload);
        if (error) throw error;
        toast.success("Impressora adicionada");
      }

      setShowPrinterForm(false);
      resetPrinterForm();
      loadData();
    } catch (err) {
      toast.error("Erro ao salvar impressora");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrinter = async (id: string) => {
    if (!window.confirm("Excluir configuracao de impressora?")) return;
    try {
      await supabase.from("printer_settings").delete().eq("id", id);
      setPrinters(printers.filter((p) => p.id !== id));
      toast.success("Configuracao excluida");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const companyId = await getCompanyId();
      const payload = {
        company_id: companyId,
        name: templateName,
        paper_width: templatePaper,
        show_logo: templateShowLogo,
        show_customer_phone: templateShowPhone,
        show_delivery_address: templateShowAddress,
        show_payment_method: templateShowPayment,
        header_text: templateHeader || null,
        footer_text: templateFooter || null,
      };

      if (editTemplate) {
        await supabase.from("receipt_templates").update(payload).eq("id", editTemplate.id);
        toast.success("Template atualizado");
      } else {
        await supabase.from("receipt_templates").insert(payload);
        toast.success("Template criado");
      }

      setShowTemplateForm(false);
      resetTemplateForm();
      loadData();
    } catch (err) {
      toast.error("Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm("Excluir template?")) return;
    try {
      await supabase.from("receipt_templates").delete().eq("id", id);
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success("Template excluido");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleSetDefault = async (id: string) => {
    const companyId = await getCompanyId();
    await supabase.from("receipt_templates").update({ is_default: false }).eq("company_id", companyId);
    await supabase.from("receipt_templates").update({ is_default: true }).eq("id", id);
    loadData();
    toast.success("Template padrao atualizado");
  };

  const sectors = [
    { value: "cozinha", label: "Cozinha" },
    { value: "balcao", label: "Balcao" },
    { value: "bar", label: "Bar" },
    { value: "delivery", label: "Delivery" },
    { value: "caixa", label: "Caixa" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configuracoes</h1>
            <p className="text-sm text-muted-foreground">Impressao termica e templates de recibo</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start">
            <button
              onClick={() => setActiveTab("impressao")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "impressao" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Printer className="h-3.5 w-3.5" /> Impressoras
            </button>
            <button
              onClick={() => setActiveTab("recibos")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "recibos" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Templates de Recibo
            </button>
          </div>

          {activeTab === "impressao" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{printers.length} impressora(s) configurada(s)</p>
                <button
                  onClick={() => { resetPrinterForm(); setShowPrinterForm(true); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Nova Impressora
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : printers.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                  <Printer className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma impressora configurada</p>
                  <p className="text-xs mt-1">Adicione pelo menos uma para comecar a imprimir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {printers.map((printer) => (
                    <motion.div
                      key={printer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card flex items-center gap-4"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center border border-primary/20">
                        <Printer className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{printer.printer_name || "Impressora"}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent border border-border text-muted-foreground">
                            {printer.printer_sector}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {printer.print_mode}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {printer.paper_width} · {printer.copies} copia(s) · Auto: {printer.auto_print ? "Sim" : "Nao"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditPrinter(printer);
                            setPrinterName(printer.printer_name || "");
                            setPrinterSector(printer.printer_sector);
                            setPrinterPaper(printer.paper_width);
                            setPrinterMode(printer.print_mode);
                            setPrinterCopies(printer.copies.toString());
                            setPrinterFooter(printer.footer_text || "");
                            setPrinterAuto(printer.auto_print);
                            setShowPrinterForm(true);
                          }}
                          className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePrinter(printer.id)}
                          className="h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "recibos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{templates.length} template(s)</p>
                <button
                  onClick={() => { resetTemplateForm(); setShowTemplateForm(true); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Novo Template
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum template de recibo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((tpl) => (
                    <motion.div
                      key={tpl.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card flex items-center gap-4"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center border border-primary/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{tpl.name}</span>
                          {tpl.is_default && (
                            <span className="text-[9px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded-md border border-success/20">
                              Padrao
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {tpl.paper_width} · Logo: {tpl.show_logo ? "Sim" : "Nao"} · Tel: {tpl.show_customer_phone ? "Sim" : "Nao"} · End: {tpl.show_delivery_address ? "Sim" : "Nao"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!tpl.is_default && (
                          <button
                            onClick={() => handleSetDefault(tpl.id)}
                            className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent cursor-pointer"
                          >
                            Definir Padrao
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditTemplate(tpl);
                            setTemplateName(tpl.name);
                            setTemplatePaper(tpl.paper_width);
                            setTemplateShowLogo(tpl.show_logo);
                            setTemplateShowPhone(tpl.show_customer_phone);
                            setTemplateShowAddress(tpl.show_delivery_address);
                            setTemplateShowPayment(tpl.show_payment_method);
                            setTemplateHeader(tpl.header_text || "");
                            setTemplateFooter(tpl.footer_text || "");
                            setShowTemplateForm(true);
                          }}
                          className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Printer Form Modal */}
      {showPrinterForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow"
          >
            <form onSubmit={handleSavePrinter} className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{editPrinter ? "Editar Impressora" : "Nova Impressora"}</h2>
                <button type="button" onClick={() => { setShowPrinterForm(false); resetPrinterForm(); }} className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nome da Impressora</label>
                  <input type="text" value={printerName} onChange={(e) => setPrinterName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Setor</label>
                    <select value={printerSector} onChange={(e) => setPrinterSector(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none">
                      {sectors.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Modo de Impressao</label>
                    <select value={printerMode} onChange={(e) => setPrinterMode(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none">
                      <option value="browser">Navegador (Browser)</option>
                      <option value="qztray">QZ Tray</option>
                      <option value="printnode">PrintNode</option>
                      <option value="local_agent">Agente Local</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Papel</label>
                    <select value={printerPaper} onChange={(e) => setPrinterPaper(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none">
                      <option value="80mm">80mm</option>
                      <option value="58mm">58mm</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Copias</label>
                    <input type="number" min={1} value={printerCopies} onChange={(e) => setPrinterCopies(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Texto do rodape</label>
                  <input type="text" value={printerFooter} onChange={(e) => setPrinterFooter(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={printerAuto} onChange={(e) => setPrinterAuto(e.target.checked)} className="rounded border-border" />
                  <span className="text-xs font-semibold text-muted-foreground">Impressao automatica</span>
                </label>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowPrinterForm(false); resetPrinterForm(); }} className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold cursor-pointer">Cancelar</button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow"
          >
            <form onSubmit={handleSaveTemplate} className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{editTemplate ? "Editar Template" : "Novo Template"}</h2>
                <button type="button" onClick={() => { setShowTemplateForm(false); resetTemplateForm(); }} className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nome do Template</label>
                  <input type="text" required value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Largura do papel</label>
                  <select value={templatePaper} onChange={(e) => setTemplatePaper(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option value="80mm">80mm</option>
                    <option value="58mm">58mm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">Exibir no recibo:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={templateShowLogo} onChange={(e) => setTemplateShowLogo(e.target.checked)} />
                      <span className="text-xs">Logo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={templateShowPhone} onChange={(e) => setTemplateShowPhone(e.target.checked)} />
                      <span className="text-xs">Telefone do cliente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={templateShowAddress} onChange={(e) => setTemplateShowAddress(e.target.checked)} />
                      <span className="text-xs">Endereco de entrega</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={templateShowPayment} onChange={(e) => setTemplateShowPayment(e.target.checked)} />
                      <span className="text-xs">Forma de pagamento</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Texto do cabecalho</label>
                  <input type="text" value={templateHeader} onChange={(e) => setTemplateHeader(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Texto do rodape</label>
                  <input type="text" value={templateFooter} onChange={(e) => setTemplateFooter(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" />
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowTemplateForm(false); resetTemplateForm(); }} className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold cursor-pointer">Cancelar</button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
