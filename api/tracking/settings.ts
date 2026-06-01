import { getSupabaseServiceRole } from "../uazapi/_auth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const companyId = req.query.companyId || req.body?.companyId;

    if (!companyId) {
      return res.status(200).json({
        metaPixelId: null,
        metaEnabled: false,
        capiEnabled: false,
      });
    }

    const supabase = getSupabaseServiceRole();

    const { data: settings, error } = await supabase
      .from("company_tracking_settings")
      .select("meta_pixel_id, meta_enabled, capi_enabled")
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) {
      console.error("Erro na query de tracking settings:", error);
      return res.status(200).json({
        metaPixelId: null,
        metaEnabled: false,
        capiEnabled: false,
      });
    }

    return res.status(200).json({
      metaPixelId: settings?.meta_pixel_id || null,
      metaEnabled: settings?.meta_enabled || false,
      capiEnabled: settings?.capi_enabled || false,
    });
  } catch (error: any) {
    console.error("Erro ao buscar configurações de tracking:", error);
    return res.status(200).json({
      metaPixelId: null,
      metaEnabled: false,
      capiEnabled: false,
    });
  }
}
