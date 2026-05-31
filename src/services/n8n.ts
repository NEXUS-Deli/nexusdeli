import { createServerFn } from "@tanstack/react-start";

const WEBHOOK_MAP: Record<string, string> = {
  extractor: "https://nexus360.infra-conectamarketing.site/webhook/0c548d15-e025-4521-85a0-8bfe0e93bc00",
  import_leads: "https://nexus360.infra-conectamarketing.site/webhook/ff773158-9e44-4c44-8efb-5a0fbcf2cd54",
  start_campaign: "https://nexus360.infra-conectamarketing.site/webhook/4e395ffa-f900-41c3-a0e9-80b2a3013ec0",
  export_leads: "https://nexus360.infra-conectamarketing.site/webhook/a4077c32-1f4b-4837-8ad3-9144e48ce2e3",
  other_webhook: "https://nexus360.infra-conectamarketing.site/webhook/b12d7a71-65d2-4865-8a82-5e84f8b4c9f9",
  immediate_disparador: "https://nexus360.infra-conectamarketing.site/webhook/nexusdeli-disparador",
};

interface TriggerWebhookPayload {
  webhookKey: keyof typeof WEBHOOK_MAP;
  payload: Record<string, any>;
}

export const triggerN8NWebhook = createServerFn({ method: "POST" })
  .validator((data: TriggerWebhookPayload) => data)
  .handler(async ({ data }) => {
    const url = WEBHOOK_MAP[data.webhookKey];
    if (!url) {
      throw new Error(`Webhook key "${data.webhookKey}" is not defined.`);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data.payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger N8N Webhook (Status: ${response.status})`);
    }

    // Try parsing as JSON or return raw text if not JSON
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: true, response: text };
    }
  });
