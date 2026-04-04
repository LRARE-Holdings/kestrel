export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface DisputeEmailContext {
  referenceNumber: string;
  subject: string;
  disputeType: string;
  amount?: string;
  actionUrl: string;
}

export interface EmailResult {
  subject: string;
  html: string;
}
