import type Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { plans, type PlanId } from "@/lib/stripe/config";

/**
 * Supabase admin client for webhook handlers.
 * Uses service role key to bypass RLS (webhooks don't have user context).
 */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Determine plan ID from a Stripe price ID by matching against config.
 * Falls back to "professional" if no match (better than "free" — the user paid).
 */
function planFromPriceId(priceId: string | null | undefined): PlanId {
  if (!priceId) return "professional";

  for (const plan of Object.values(plans)) {
    if (plan.monthlyPriceId === priceId || plan.annualPriceId === priceId) {
      return plan.id;
    }
  }

  return "professional";
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    case "customer.subscription.created":
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

    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    default:
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
    plan: "professional",
    status: "active",
    current_period_start: new Date().toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getAdminClient();
  const userId = subscription.metadata?.supabase_user_id;

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id;
  const periodStart = item?.current_period_start;
  const periodEnd = item?.current_period_end;
  const plan = planFromPriceId(priceId);

  const updateData: Record<string, unknown> = {
    status: subscription.status,
    plan,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    ...(periodStart && {
      current_period_start: new Date(periodStart * 1000).toISOString(),
    }),
    ...(periodEnd && {
      current_period_end: new Date(periodEnd * 1000).toISOString(),
    }),
  };

  if (userId) {
    // If we have the user ID in metadata, upsert (handles new subscriptions)
    await supabase
      .from("subscriptions")
      .upsert({ user_id: userId, ...updateData });
  } else {
    // Otherwise update by subscription ID
    await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("stripe_subscription_id", subscription.id);
  }
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
  const subscriptionId =
    typeof sub === "string" ? sub : (sub as { id?: string })?.id;

  if (subscriptionId) {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscriptionId);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const supabase = getAdminClient();
  const sub = (invoice as unknown as Record<string, unknown>).subscription;
  const subscriptionId =
    typeof sub === "string" ? sub : (sub as { id?: string })?.id;

  if (subscriptionId) {
    await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("stripe_subscription_id", subscriptionId);
  }
}
