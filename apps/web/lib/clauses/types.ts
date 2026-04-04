export interface PartyDetails {
  name: string;
  businessName: string;
  address: string;
  email: string;
  companyNumber?: string;
}

export interface ClauseSection {
  heading?: string;
  content: string;
}

export interface DocumentSection {
  number: string;
  title: string;
  content: string;
  subSections?: { number: string; content: string }[];
}

export interface AssembledDocument {
  title: string;
  date: string;
  parties: { a: PartyDetails; b: PartyDetails };
  sections: DocumentSection[];
  includesDisputeClause: boolean;
  generatedAt: string;
}
