import type { DocumentSection } from "@/lib/clauses/types";
import type { SubcontractorInput } from "@/lib/contracts/schemas";

export function generateAppointment(
  data: SubcontractorInput,
): DocumentSection {
  return {
    number: "",
    title: "Appointment",
    content: `${data.partyA.businessName} ("the Contractor") appoints ${data.partyB.businessName} ("the Subcontractor") to carry out and complete the works described in this agreement in connection with the head contract referenced as ${data.headContractReference} ("the Head Contract").\n\nThe Subcontractor acknowledges that it has had the opportunity to review the relevant provisions of the Head Contract and agrees to be bound by the obligations imposed on the Contractor under the Head Contract to the extent they relate to the subcontract works, as if references to the Contractor were references to the Subcontractor.`,
    subSections: [],
  };
}

export function generateScopeOfWorks(
  data: SubcontractorInput,
): DocumentSection {
  return {
    number: "",
    title: "Scope of Works",
    content: `The Subcontractor shall carry out and complete the following works: ${data.scopeOfWorks}.\n\nThe Subcontractor shall carry out the works: (a) in a proper and workmanlike manner; (b) in accordance with good industry practice and all applicable standards, codes of practice, and regulations; (c) using materials of good quality and fit for their intended purpose; (d) in accordance with the programme and any reasonable instructions given by the Contractor; and (e) with due diligence and without delay.`,
    subSections: [],
  };
}

export function generatePayment(data: SubcontractorInput): DocumentSection {
  const paymentTypeText: Record<string, string> = {
    fixed: `a fixed price of ${formatCurrency(data.paymentAmount)} for the complete scope of works`,
    measured: `measured rates totalling an estimated ${formatCurrency(data.paymentAmount)}, subject to remeasurement based on the actual quantities of work executed`,
    "cost-plus": `cost-plus fees estimated at ${formatCurrency(data.paymentAmount)}, comprising the Subcontractor's actual costs of carrying out the works plus an agreed percentage or fixed fee for overheads and profit`,
  };

  return {
    number: "",
    title: "Payment",
    content: `The Contractor shall pay the Subcontractor ${paymentTypeText[data.paymentType]}.\n\nThe Subcontractor shall submit applications for payment at monthly intervals, supported by such details as the Contractor may reasonably require. The Contractor shall issue a payment notice within 5 days of each application, stating the sum considered to be due and the basis on which it has been calculated. Payment shall be made within ${data.paymentTermsDays} days of the date of each payment application.\n\nThe Contractor shall not be obliged to make any payment to the Subcontractor to the extent that the Contractor has not received corresponding payment from the employer under the Head Contract, provided that this shall not delay payment beyond 30 days after the Subcontractor's application.\n\nAll amounts are exclusive of VAT, which shall be charged at the prevailing rate where applicable.`,
    subSections: [],
  };
}

export function generateCompletion(data: SubcontractorInput): DocumentSection {
  return {
    number: "",
    title: "Completion",
    content: `The Subcontractor shall complete the works on or before ${formatDate(data.completionDate)} ("the Completion Date").\n\nIf the Subcontractor fails to complete the works by the Completion Date, the Subcontractor shall be liable for any delay damages, additional costs, or penalties incurred by the Contractor under the Head Contract to the extent attributable to the Subcontractor's delay.\n\nThe Subcontractor shall promptly notify the Contractor of any circumstances that may cause delay to the completion of the works and shall use all reasonable endeavours to minimise the effect of any delay. The Completion Date may be extended by the Contractor in writing if the delay is caused by: (a) a variation instructed by the Contractor; (b) an event of force majeure; or (c) any default of the Contractor.`,
    subSections: [],
  };
}

export function generateDefectsLiability(
  data: SubcontractorInput,
): DocumentSection {
  return {
    number: "",
    title: "Defects Liability",
    content: `The defects liability period shall be ${data.defectsLiabilityPeriodMonths} months from the date of practical completion of the works.\n\nDuring the defects liability period, the Subcontractor shall, at its own cost, make good any defects, shrinkages, or other faults in the works which are due to materials or workmanship not being in accordance with this agreement or which appear as a result of the Subcontractor's failure to comply with its obligations under this agreement.\n\nThe Contractor shall give the Subcontractor written notice of any defect, specifying the nature of the defect and requiring the Subcontractor to make good the defect within a reasonable time. If the Subcontractor fails to make good a defect within the specified time, the Contractor may engage others to carry out the remedial work and recover the reasonable cost from the Subcontractor.`,
    subSections: [],
  };
}

export function generateInsurance(
  data: SubcontractorInput,
): DocumentSection {
  if (!data.insuranceRequired) {
    return {
      number: "",
      title: "Insurance",
      content:
        "The Subcontractor shall maintain adequate insurance cover as is customary for works of the nature described in this agreement for the duration of the works and the defects liability period. The Subcontractor shall produce evidence of such insurance upon request by the Contractor.",
      subSections: [],
    };
  }

  return {
    number: "",
    title: "Insurance",
    content:
      "The Subcontractor shall maintain and shall procure that its sub-subcontractors maintain the following insurance policies for the duration of the works and the defects liability period:\n\n1. Public liability insurance with a minimum limit of indemnity of no less than the contract value or such higher amount as is reasonably required\n2. Employer's liability insurance with a minimum limit of indemnity of not less than the statutory minimum\n3. Professional indemnity insurance (where applicable) with a minimum limit of indemnity appropriate to the nature of the works\n4. All-risks insurance for the works, materials, and plant\n\nThe Subcontractor shall provide the Contractor with copies of all insurance policies and evidence of premium payment upon request. The Subcontractor shall not do or permit anything to be done which may invalidate any insurance policy. If the Subcontractor fails to maintain adequate insurance, the Contractor may take out such insurance and recover the cost from the Subcontractor.",
    subSections: [],
  };
}

export function generateTermination(
  data: SubcontractorInput,
): DocumentSection {
  return {
    number: "",
    title: "Termination",
    content: `Either party may terminate this agreement by giving the other party not less than ${data.terminationNoticeDays} days' written notice.\n\nThe Contractor may terminate this agreement with immediate effect by giving written notice if: (a) the Subcontractor commits a material breach which is irremediable, or which is not remedied within 14 days of written notice; (b) the Subcontractor suspends or threatens to suspend the carrying out of the works without reasonable cause; (c) the Subcontractor becomes insolvent or enters administration; (d) the Head Contract is terminated for any reason.\n\nUpon termination, the Subcontractor shall: (a) immediately cease work and secure the works; (b) remove its plant and equipment from the site within a reasonable period; (c) assign to the Contractor any sub-subcontracts and supply contracts as the Contractor may require. The Contractor shall pay the Subcontractor for work properly executed up to the date of termination, less any amounts previously paid and any costs, losses, or damages incurred by the Contractor as a result of the termination.`,
    subSections: [],
  };
}

export function generateHealthAndSafety(): DocumentSection {
  return {
    number: "",
    title: "Health and Safety",
    content:
      "The Subcontractor shall comply with all applicable health and safety legislation, regulations, and codes of practice, including the Health and Safety at Work etc. Act 1974 and the Construction (Design and Management) Regulations 2015 where applicable. The Subcontractor shall maintain a safe working environment, provide appropriate training and personal protective equipment to its personnel, and cooperate fully with the Contractor's health and safety arrangements.",
    subSections: [],
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getAllSubcontractorSections(
  data: SubcontractorInput,
): DocumentSection[] {
  return [
    generateAppointment(data),
    generateScopeOfWorks(data),
    generatePayment(data),
    generateCompletion(data),
    generateDefectsLiability(data),
    generateInsurance(data),
    generateHealthAndSafety(),
    generateTermination(data),
  ];
}
