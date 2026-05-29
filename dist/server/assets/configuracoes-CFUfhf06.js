import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { S as Sidebar, T as Topbar } from "./Topbar-jXAYa-6f.js";
import { Printer, FileText, Plus, Loader2, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { g as getCompanyId, s as supabase } from "./router-BotcCoyH.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "zod";
function SettingsPage() {
  const [activeTab, setActiveTab] = useState("impressao");
  const [printers, setPrinters] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrinterForm, setShowPrinterForm] = useState(false);
  const [editPrinter, setEditPrinter] = useState(null);
  const [printerName, setPrinterName] = useState("");
  const [printerSector, setPrinterSector] = useState("cozinha");
  const [printerPaper, setPrinterPaper] = useState("80mm");
  const [printerMode, setPrinterMode] = useState("browser");
  const [printerCopies, setPrinterCopies] = useState("1");
  const [printerFooter, setPrinterFooter] = useState("");
  const [printerAuto, setPrinterAuto] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
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
      const [printResult, templResult] = await Promise.all([supabase.from("printer_settings").select("*").eq("company_id", companyId), supabase.from("receipt_templates").select("*").eq("company_id", companyId)]);
      if (printResult.data) setPrinters(printResult.data);
      if (templResult.data) setTemplates(templResult.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    loadData();
  }, [loadData]);
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
  const handleSavePrinter = async (e) => {
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
        auto_print: printerAuto
      };
      if (editPrinter) {
        const {
          error
        } = await supabase.from("printer_settings").update(payload).eq("id", editPrinter.id);
        if (error) throw error;
        toast.success("Impressora atualizada");
      } else {
        const {
          error
        } = await supabase.from("printer_settings").insert(payload);
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
  const handleDeletePrinter = async (id) => {
    if (!window.confirm("Excluir configuracao de impressora?")) return;
    try {
      await supabase.from("printer_settings").delete().eq("id", id);
      setPrinters(printers.filter((p) => p.id !== id));
      toast.success("Configuracao excluida");
    } catch {
      toast.error("Erro ao excluir");
    }
  };
  const handleSaveTemplate = async (e) => {
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
        footer_text: templateFooter || null
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
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Excluir template?")) return;
    try {
      await supabase.from("receipt_templates").delete().eq("id", id);
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success("Template excluido");
    } catch {
      toast.error("Erro ao excluir");
    }
  };
  const handleSetDefault = async (id) => {
    const companyId = await getCompanyId();
    await supabase.from("receipt_templates").update({
      is_default: false
    }).eq("company_id", companyId);
    await supabase.from("receipt_templates").update({
      is_default: true
    }).eq("id", id);
    loadData();
    toast.success("Template padrao atualizado");
  };
  const sectors = [{
    value: "cozinha",
    label: "Cozinha"
  }, {
    value: "balcao",
    label: "Balcao"
  }, {
    value: "bar",
    label: "Bar"
  }, {
    value: "delivery",
    label: "Delivery"
  }, {
    value: "caixa",
    label: "Caixa"
  }];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsx(Topbar, {}),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Configuracoes" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Impressao termica e templates de recibo" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("impressao"), className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "impressao" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-3.5 w-3.5" }),
            " Impressoras"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("recibos"), className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "recibos" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
            " Templates de Recibo"
          ] })
        ] }),
        activeTab === "impressao" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
              printers.length,
              " impressora(s) configurada(s)"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => {
              resetPrinterForm();
              setShowPrinterForm(true);
            }, className: "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
              " Nova Impressora"
            ] })
          ] }),
          isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : printers.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl", children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
            /* @__PURE__ */ jsx("p", { children: "Nenhuma impressora configurada" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", children: "Adicione pelo menos uma para comecar a imprimir" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: printers.map((printer) => /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0
          }, animate: {
            opacity: 1
          }, className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center border border-primary/20", children: /* @__PURE__ */ jsx(Printer, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: printer.printer_name || "Impressora" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent border border-border text-muted-foreground", children: printer.printer_sector }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20", children: printer.print_mode })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                printer.paper_width,
                " · ",
                printer.copies,
                " copia(s) · Auto: ",
                printer.auto_print ? "Sim" : "Nao"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setEditPrinter(printer);
                setPrinterName(printer.printer_name || "");
                setPrinterSector(printer.printer_sector);
                setPrinterPaper(printer.paper_width);
                setPrinterMode(printer.print_mode);
                setPrinterCopies(printer.copies.toString());
                setPrinterFooter(printer.footer_text || "");
                setPrinterAuto(printer.auto_print);
                setShowPrinterForm(true);
              }, className: "h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent cursor-pointer", children: "Editar" }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleDeletePrinter(printer.id), className: "h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, printer.id)) })
        ] }),
        activeTab === "recibos" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
              templates.length,
              " template(s)"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => {
              resetTemplateForm();
              setShowTemplateForm(true);
            }, className: "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
              " Novo Template"
            ] })
          ] }),
          isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : templates.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-2xl", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
            /* @__PURE__ */ jsx("p", { children: "Nenhum template de recibo" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: templates.map((tpl) => /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0
          }, animate: {
            opacity: 1
          }, className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center border border-primary/20", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: tpl.name }),
                tpl.is_default && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded-md border border-success/20", children: "Padrao" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                tpl.paper_width,
                " · Logo: ",
                tpl.show_logo ? "Sim" : "Nao",
                " · Tel: ",
                tpl.show_customer_phone ? "Sim" : "Nao",
                " · End: ",
                tpl.show_delivery_address ? "Sim" : "Nao"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              !tpl.is_default && /* @__PURE__ */ jsx("button", { onClick: () => handleSetDefault(tpl.id), className: "h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent cursor-pointer", children: "Definir Padrao" }),
              /* @__PURE__ */ jsx("button", { onClick: () => {
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
              }, className: "h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent cursor-pointer", children: "Editar" }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteTemplate(tpl.id), className: "h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, tpl.id)) })
        ] })
      ] })
    ] }),
    showPrinterForm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, className: "w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSavePrinter, className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: editPrinter ? "Editar Impressora" : "Nova Impressora" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
          setShowPrinterForm(false);
          resetPrinterForm();
        }, className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome da Impressora" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: printerName, onChange: (e) => setPrinterName(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Setor" }),
            /* @__PURE__ */ jsx("select", { value: printerSector, onChange: (e) => setPrinterSector(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none", children: sectors.map((s) => /* @__PURE__ */ jsx("option", { value: s.value, children: s.label }, s.value)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Modo de Impressao" }),
            /* @__PURE__ */ jsxs("select", { value: printerMode, onChange: (e) => setPrinterMode(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none", children: [
              /* @__PURE__ */ jsx("option", { value: "browser", children: "Navegador (Browser)" }),
              /* @__PURE__ */ jsx("option", { value: "qztray", children: "QZ Tray" }),
              /* @__PURE__ */ jsx("option", { value: "printnode", children: "PrintNode" }),
              /* @__PURE__ */ jsx("option", { value: "local_agent", children: "Agente Local" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Papel" }),
            /* @__PURE__ */ jsxs("select", { value: printerPaper, onChange: (e) => setPrinterPaper(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none", children: [
              /* @__PURE__ */ jsx("option", { value: "80mm", children: "80mm" }),
              /* @__PURE__ */ jsx("option", { value: "58mm", children: "58mm" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Copias" }),
            /* @__PURE__ */ jsx("input", { type: "number", min: 1, value: printerCopies, onChange: (e) => setPrinterCopies(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Texto do rodape" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: printerFooter, onChange: (e) => setPrinterFooter(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: printerAuto, onChange: (e) => setPrinterAuto(e.target.checked), className: "rounded border-border" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Impressao automatica" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-border flex justify-end gap-3", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
            setShowPrinterForm(false);
            resetPrinterForm();
          }, className: "rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold cursor-pointer", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: saving, className: "rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2", children: [
            saving ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3 w-3" }),
            "Salvar"
          ] })
        ] })
      ] })
    ] }) }) }),
    showTemplateForm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, className: "w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveTemplate, className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: editTemplate ? "Editar Template" : "Novo Template" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
          setShowTemplateForm(false);
          resetTemplateForm();
        }, className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome do Template" }),
          /* @__PURE__ */ jsx("input", { type: "text", required: true, value: templateName, onChange: (e) => setTemplateName(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Largura do papel" }),
          /* @__PURE__ */ jsxs("select", { value: templatePaper, onChange: (e) => setTemplatePaper(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none", children: [
            /* @__PURE__ */ jsx("option", { value: "80mm", children: "80mm" }),
            /* @__PURE__ */ jsx("option", { value: "58mm", children: "58mm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Exibir no recibo:" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: templateShowLogo, onChange: (e) => setTemplateShowLogo(e.target.checked) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Logo" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: templateShowPhone, onChange: (e) => setTemplateShowPhone(e.target.checked) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Telefone do cliente" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: templateShowAddress, onChange: (e) => setTemplateShowAddress(e.target.checked) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Endereco de entrega" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: templateShowPayment, onChange: (e) => setTemplateShowPayment(e.target.checked) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Forma de pagamento" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Texto do cabecalho" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: templateHeader, onChange: (e) => setTemplateHeader(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Texto do rodape" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: templateFooter, onChange: (e) => setTemplateFooter(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-border flex justify-end gap-3", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
            setShowTemplateForm(false);
            resetTemplateForm();
          }, className: "rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold cursor-pointer", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: saving, className: "rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2", children: [
            saving ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3 w-3" }),
            "Salvar"
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  SettingsPage as component
};
