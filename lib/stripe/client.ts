import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * @deprecated Use getStripe() for lazy initialization.
 * This export is kept for convenience but will throw at import time
 * if STRIPE_SECRET_KEY is not set.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop);
  },
});
