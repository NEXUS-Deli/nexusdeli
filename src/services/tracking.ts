import { supabase } from "@/lib/supabase";

export interface TrackingEventPayload {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
  productId?: string;
  orderId?: string;
  clientId?: string;
  value?: number;
  metadata?: Record<string, any>;
}

// Generates a fallback UUID if window.crypto.randomUUID is not available
function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Injects Meta Pixel script into the DOM dynamically
function injectMetaPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  if ((window as any).fbq) return; // Already injected

  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  (window as any).fbq("init", pixelId);
  (window as any).fbq("track", "PageView");
}

export class TrackingService {
  private static sessionIdKey = "chamai_session_id";
  private static sessionUuidKey = "chamai_session_uuid";
  private static customerTokenKey = "chamai_customer_token";
  private static clientTokenKey = "chamai_client_token";
  private static capiEnabledKey = "chamai_capi_enabled";

  static getSessionUuid(): string {
    if (typeof window === "undefined") return "";
    let sessionUuid = localStorage.getItem(this.sessionUuidKey);
    if (!sessionUuid) {
      sessionUuid = generateUUID();
      localStorage.setItem(this.sessionUuidKey, sessionUuid);
    }
    return sessionUuid;
  }

  static getOrCreateSessionId(): { sessionId: string; isNew: boolean } {
    if (typeof window === "undefined") return { sessionId: "", isNew: false };
    let sessionId = localStorage.getItem(this.sessionIdKey);
    let isNew = false;
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem(this.sessionIdKey, sessionId);
      isNew = true;
    }
    return { sessionId, isNew };
  }

  static getCustomerToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.clientTokenKey) || localStorage.getItem(this.customerTokenKey);
  }

  static setCustomerToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.clientTokenKey, token);
    localStorage.setItem(this.customerTokenKey, token);
  }

  // Initializes session and returns company tracking settings (e.g. meta pixel id)
  static async initializeSession(companyId: string): Promise<{ metaPixelId: string | null; metaEnabled: boolean }> {
    if (typeof window === "undefined" || !companyId) {
      return { metaPixelId: null, metaEnabled: false };
    }

    const sessionUuid = this.getSessionUuid();
    const { sessionId, isNew } = this.getOrCreateSessionId();
    const clientId = this.getCustomerToken();
    const customerTokenStr = localStorage.getItem(this.clientTokenKey) || localStorage.getItem(this.customerTokenKey) || "";

    // Parse URL parameters for UTMs and source/context
    const params = new URLSearchParams(window.location.search);
    const utms = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
    };

    const contextParam = params.get("context") || "";
    const sourceParam = params.get("source") || "";

    // Determine Context
    let context = "delivery";
    if (["delivery", "mesa", "balcao", "retirada"].includes(contextParam.toLowerCase())) {
      context = contextParam.toLowerCase();
    } else if (params.get("mesa") || params.get("table")) {
      context = "mesa";
    }

    // Determine Source
    let source = "direct";
    const allowedSources = ["facebook", "instagram", "whatsapp", "google", "direct", "organic", "qr_table", "other"];
    if (allowedSources.includes(sourceParam.toLowerCase())) {
      source = sourceParam.toLowerCase();
    } else if (context === "mesa") {
      source = "qr_table";
    } else if (utms.utm_source) {
      const srcLower = utms.utm_source.toLowerCase();
      if (allowedSources.includes(srcLower)) {
        source = srcLower;
      } else if (srcLower.includes("fb") || srcLower.includes("face")) {
        source = "facebook";
      } else if (srcLower.includes("ig") || srcLower.includes("insta")) {
        source = "instagram";
      } else if (srcLower.includes("wa")) {
        source = "whatsapp";
      } else {
        source = "other";
      }
    }

    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
    };

    // Insert session if it's new, otherwise update securely via API
    if (isNew) {
      try {
        const { error } = await supabase.from("customer_sessions").insert({
          id: sessionUuid,
          company_id: companyId,
          client_id: clientId || null,
          session_id: sessionId,
          customer_token: customerTokenStr,
          context,
          source,
          utms,
          device_info: deviceInfo,
        });
        if (error) {
          console.error("Erro ao salvar sessão:", error.message, error.details, error.hint);
        }
      } catch (e: any) {
        console.error("Erro ao inicializar customer session:", e.message || e);
      }
    } else {
      // Securely update last_seen / metadata via Serverless endpoint
      fetch("/api/tracking/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionUuid, companyId, clientId }),
      }).catch((e) => console.error("Erro ao atualizar last_seen via API:", e));
    }

    // Fetch tracking settings from secure serverless route (omitting access tokens)
    try {
      const res = await fetch(`/api/tracking/settings?companyId=${companyId}`);
      if (res.ok) {
        const settings = await res.json();
        // Save CAPI enabled flag in sessionStorage for trackEvent reference
        sessionStorage.setItem(this.capiEnabledKey, settings.capiEnabled ? "true" : "false");

        if (settings.metaEnabled && settings.metaPixelId) {
          injectMetaPixel(settings.metaPixelId);
          return { metaPixelId: settings.metaPixelId, metaEnabled: true };
        }
      }
    } catch (e) {
      console.error("Erro ao carregar configurações de tracking via API:", e);
    }

    return { metaPixelId: null, metaEnabled: false };
  }

  // Records a tracking event and updates the abandonment score
  static async trackEvent(companyId: string, payload: TrackingEventPayload) {
    if (typeof window === "undefined" || !companyId) return;

    const sessionUuid = this.getSessionUuid();
    const { sessionId } = this.getOrCreateSessionId();
    const clientId = payload.clientId || this.getCustomerToken() || undefined;
    const eventId = generateUUID();
    const uniqueEventId = generateUUID();

    try {
      // 1. Save Event to tracking_events (Allowed via SELECT/INSERT Policies)
      const { error: eventError } = await supabase.from("tracking_events").insert({
        id: eventId,
        session_id: sessionUuid,
        company_id: companyId,
        event_name: payload.eventName,
        product_id: payload.productId || null,
        order_id: payload.orderId || null,
        client_id: clientId || null,
        value: payload.value || null,
        currency: "BRL",
        metadata: payload.metadata || {},
        event_id: uniqueEventId,
        session_key: sessionId,
      });

      if (eventError) {
        console.error("Erro ao salvar evento:", eventError.message, eventError.details, eventError.hint);
        return;
      }

      // 2. Recalculate Abandonment Score locally to avoid unauthorized database SELECT queries
      const triggeredKey = `chamai_triggered_${sessionId}`;
      let triggered: string[] = [];
      try {
        triggered = JSON.parse(sessionStorage.getItem(triggeredKey) || "[]");
      } catch {}

      if (!triggered.includes(payload.eventName)) {
        triggered.push(payload.eventName);
        try {
          sessionStorage.setItem(triggeredKey, JSON.stringify(triggered));
        } catch {}
      }

      let score = 0;
      const hasViewContent = triggered.includes("ViewContent") || payload.eventName === "ViewContent";
      const hasAddToCart = triggered.includes("AddToCart") || payload.eventName === "AddToCart";
      const hasInitiateCheckout = triggered.includes("InitiateCheckout") || payload.eventName === "InitiateCheckout";

      if (hasViewContent) score += 10;
      if (hasAddToCart) score += 25;
      if (hasInitiateCheckout) score += 40;
      if (payload.value && payload.value > 50) score += 15;
      if (clientId) score += 20;

      // Update abandonment score in session securely via serverless proxy
      fetch("/api/tracking/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionUuid,
          companyId,
          clientId: clientId || null,
          abandonmentScore: score,
        }),
      }).catch((err) => console.error("Erro ao atualizar session score via API:", err));

      // 3. Trigger Browser Meta Pixel if loaded
      const fbq = (window as any).fbq;
      if (fbq) {
        const customData: any = {};
        if (payload.value) {
          customData.value = payload.value;
          customData.currency = "BRL";
        }
        if (payload.productId) {
          customData.content_ids = [payload.productId];
        }

        fbq("track", payload.eventName, customData, { eventID: eventId });
      }

      // 4. Trigger Meta CAPI proxy for 'Purchase' events only
      if (payload.eventName === "Purchase") {
        const capiEnabled = sessionStorage.getItem(this.capiEnabledKey) === "true";

        if (capiEnabled) {
          // Fire Conversions API call to proxy serverless endpoint
          const customerData = payload.metadata?.customer || {};
          fetch("/api/meta/capi-event", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              companyId,
              eventId,
              value: payload.value || 0,
              customerData: {
                name: customerData.name,
                phone: customerData.phone,
                email: customerData.email,
              },
              sourceUrl: window.location.href,
              userAgent: navigator.userAgent,
            }),
          }).catch((err) => console.error("Falha ao enviar evento CAPI:", err));
        }
      }
    } catch (e) {
      console.error("Erro geral no trackEvent:", e);
    }
  }
}
