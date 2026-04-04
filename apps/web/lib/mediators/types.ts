import type { Tables } from "@kestrel/shared/supabase/types";

export type Mediator = Tables<"mediators">;
export type MediatorSpecialisation = Tables<"mediator_specialisations">;
export type MediatorRequest = Tables<"dispute_mediator_requests">;
