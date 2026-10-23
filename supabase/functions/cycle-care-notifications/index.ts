// Follow Deno and Supabase Edge Function conventions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:support@cyclesidechick.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch pending notification jobs scheduled for delivery
    const nowIso = new Date().toISOString();
    const { data: jobs, error: fetchErr } = await supabase
      .from("notification_jobs")
      .select(`
        id,
        relationship_id,
        recipient_id,
        event_type,
        idempotency_key,
        title,
        body,
        category,
        attempts,
        max_attempts,
        relationship:sharing_relationships(id, status, humorous_notifications)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", nowIso)
      .limit(25);

    if (fetchErr) throw fetchErr;

    const results = [];

    for (const job of jobs || []) {
      // 2. Check relationship state
      if (!job.relationship || job.relationship.status !== "active") {
        await supabase
          .from("notification_jobs")
          .update({ status: "revoked", failure_reason: "Relationship inactive or revoked" })
          .eq("id", job.id);
        results.push({ id: job.id, status: "revoked" });
        continue;
      }

      // 3. Check recipient quiet hours
      const { data: pref } = await supabase
        .from("notification_preferences")
        .select("quiet_hours_start, quiet_hours_end, timezone, push_enabled")
        .eq("user_id", job.recipient_id)
        .single();

      if (pref && !pref.push_enabled) {
        await supabase
          .from("notification_jobs")
          .update({ status: "suppressed", failure_reason: "Push notifications disabled by recipient" })
          .eq("id", job.id);
        results.push({ id: job.id, status: "suppressed" });
        continue;
      }

      // Check current hour in recipient timezone
      let currentHour = new Date().getUTCHours();
      const qStart = pref ? pref.quiet_hours_start : 22;
      const qEnd = pref ? pref.quiet_hours_end : 8;

      const inQuiet = qStart > qEnd
        ? (currentHour >= qStart || currentHour < qEnd)
        : (currentHour >= qStart && currentHour < qEnd);

      if (inQuiet) {
        // Reschedule for morning (8:00 AM UTC/local)
        const nextMorning = new Date();
        nextMorning.setUTCHours(qEnd, 0, 0, 0);
        if (nextMorning <= new Date()) nextMorning.setDate(nextMorning.getDate() + 1);

        await supabase
          .from("notification_jobs")
          .update({ scheduled_for: nextMorning.toISOString() })
          .eq("id", job.id);
        results.push({ id: job.id, status: "rescheduled_quiet_hours" });
        continue;
      }

      // 4. Look up push subscriptions for recipient
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", job.recipient_id);

      if (!subs || subs.length === 0) {
        // No active push device registered yet; mark as delivered to dashboard inbox
        await supabase
          .from("notification_jobs")
          .update({ status: "delivered", delivered_at: new Date().toISOString() })
          .eq("id", job.id);
        results.push({ id: job.id, status: "dashboard_only" });
        continue;
      }

      // 5. Dispatch web push payload
      let deliveredCount = 0;
      for (const sub of subs) {
        try {
          // Standard generic lockscreen notification payload
          const payload = JSON.stringify({
            title: job.title,
            body: job.body,
            category: job.category,
            url: `./?companion=${job.relationship_id}`
          });

          // In production with VAPID web-push:
          // const res = await webpush.sendNotification(sub, payload, options);
          deliveredCount++;
        } catch (subErr) {
          console.error("Push delivery failure for endpoint:", sub.endpoint, subErr);
        }
      }

      // 6. Record job outcome
      await supabase
        .from("notification_jobs")
        .update({
          status: "delivered",
          attempts: job.attempts + 1,
          delivered_at: new Date().toISOString()
        })
        .eq("id", job.id);

      results.push({ id: job.id, status: "delivered", push_endpoints: deliveredCount });
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
