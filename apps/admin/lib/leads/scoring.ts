export interface ScoreBreakdown {
  signed_up: number;
  completed_onboarding: number;
  documents_generated: number;
  filed_dispute: number;
  used_multiple_tools: number;
  has_business_name: number;
  recent_activity: number;
  total: number;
}

export function computeLeadScore(signals: {
  hasAccount: boolean;
  completedOnboarding: boolean;
  documentsGenerated: number;
  filedDispute: boolean;
  toolsUsed: number;
  hasBusinessName: boolean;
  lastActivityWithin7Days: boolean;
}): ScoreBreakdown {
  const signed_up = signals.hasAccount ? 20 : 0;
  const completed_onboarding = signals.completedOnboarding ? 10 : 0;
  const documents_generated = Math.min(signals.documentsGenerated * 5, 30);
  const filed_dispute = signals.filedDispute ? 25 : 0;
  const used_multiple_tools = signals.toolsUsed >= 2 ? 15 : 0;
  const has_business_name = signals.hasBusinessName ? 10 : 0;
  const recent_activity = signals.lastActivityWithin7Days ? 10 : 0;

  const total =
    signed_up +
    completed_onboarding +
    documents_generated +
    filed_dispute +
    used_multiple_tools +
    has_business_name +
    recent_activity;

  return {
    signed_up,
    completed_onboarding,
    documents_generated,
    filed_dispute,
    used_multiple_tools,
    has_business_name,
    recent_activity,
    total,
  };
}
