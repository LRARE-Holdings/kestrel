/**
 * Re-export of the shared pricing types for ergonomic in-app imports.
 *
 * The canonical implementation lives in `@kestrel/shared/pricing/types`,
 * shared between apps/web and apps/admin. Keep this file as a pure re-export
 * — do not add app-specific types here.
 */

export type {
  TierId,
  PartyRole,
  PaymentPurpose,
  PaymentStatus,
  FeeQuote,
  TierBumpQuote,
  GoodFaithEligibilityInput,
  GoodFaithEligibilityResult,
} from "@kestrel/shared/pricing/types";
