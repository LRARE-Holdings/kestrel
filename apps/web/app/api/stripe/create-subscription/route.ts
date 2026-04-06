import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@kestrel/shared/supabase/server";
import { stripeRateLimit, applyRateLimit } from "@/lib/security/rate-limit";

const subscriptionSchema = z.object({
  priceId: z.string().startsWith("price_", "Invalid price ID"),
});

/**
 * Creates a Stripe subscription with payment_behavior: 'default_incomplete'.
 * Returns a clientSecret for the PaymentIntent so the frontend can collect
 * payment details on-site using Stripe Elements (no redirect to Stripe).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rateLimitError = await applyRateLimit(request, stripeRateLimit(), user.id);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const parsed = subscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { priceId } = parsed.data;

    // Find or create customer
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Create the subscription — incomplete until payment is confirmed
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: { supabase_user_id: user.id },
    });

    // Extract the client secret from the pending payment intent
    const invoice = subscription.latest_invoice;
    const paymentIntent =
      typeof invoice === "object" && invoice !== null
        ? (invoice as Record<string, unknown>).payment_intent
        : null;
    const clientSecret =
      typeof paymentIntent === "object" && paymentIntent !== null
        ? (paymentIntent as Record<string, unknown>).client_secret
        : null;

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Failed to create payment intent" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}
