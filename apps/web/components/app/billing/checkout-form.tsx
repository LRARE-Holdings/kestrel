"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

/** Kestrel-branded Stripe Elements appearance */
const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#2B5C4F",
    colorBackground: "#FFFFFF",
    colorText: "#0C1311",
    colorTextSecondary: "#4A5553",
    colorTextPlaceholder: "#7A8583",
    borderRadius: "0.5rem",
    fontFamily: "DM Sans, system-ui, sans-serif",
    fontSizeBase: "14px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #D4CEC6",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #2B5C4F",
      boxShadow: "0 0 0 1px #2B5C4F",
    },
  },
};

interface CheckoutFormProps {
  priceId: string;
  planName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/settings/billing?success=true`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message ?? "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }

    // Payment succeeded without redirect
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />

      {error && (
        <div className="rounded-lg bg-error/5 border border-error/20 px-3.5 py-2.5 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={!stripe || processing} className="flex-1">
          {processing ? "Processing..." : "Subscribe"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CheckoutForm({
  priceId,
  planName,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function initCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to initialise checkout");
        setLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  // If we don't have a client secret yet, show the init button
  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-kestrel/20 bg-kestrel/5 p-4">
          <h3 className="text-sm font-semibold text-ink">
            Subscribe to {planName}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Enter your payment details to complete your subscription. Your card
            will be charged at the start of each billing period.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-error/5 border border-error/20 px-3.5 py-2.5 text-sm text-error">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={initCheckout} disabled={loading}>
            {loading ? "Preparing..." : "Continue to payment"}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Render Stripe Elements with the client secret
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance }}
    >
      <PaymentForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
