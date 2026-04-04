import { createClient } from "@kestrel/shared/supabase/server";

/**
 * Track tool usage events. Fire-and-forget — errors are silently caught
 * so tracking never blocks the user's flow.
 */
export async function trackToolUsage(params: {
  toolName: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("tool_usage_events").insert({
      tool_name: params.toolName,
      action: params.action ?? "generate",
      user_id: params.userId ?? null,
      session_id: params.sessionId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch {
    // Non-blocking: don't let tracking failures break the user's flow
  }
}
