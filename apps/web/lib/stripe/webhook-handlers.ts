import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client for webhook handlers.
 * Uses service role key to bypass RLS (webhooks don't have user context).
 */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
      );
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
      );
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      // Unhandled event type — log but don't error
      console.log(`Unhandled Stripe event: ${event.type}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) return;

  const supabase = getAdminClient();

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string,
    plan: "professional", // Determine from price ID in production
    status: "active",
    current_period_start: new Date().toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();

  // Extract period from the first subscription item
  const item = subscription.items?.data?.[0];
  const periodStart = item?.current_period_start;
  const periodEnd = item?.current_period_end;

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      ...(periodStart && {
        current_period_start: new Date(periodStart * 1000).toISOString(),
      }),
      ...(periodEnd && {
        current_period_end: new Date(periodEnd * 1000).toISOString(),
      }),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      plan: "free",
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getAdminClient();
  const sub = (invoice as unknown as Record<string, unknown>).subscription;
  const subscriptionId = typeof sub === "string" ? sub : (sub as { id?: string })?.id;

  if (subscriptionId) {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscriptionId);
  }
}
