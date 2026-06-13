export const EXAM_IDS = ["cat", "isi_msqe", "ugc_net", "jee", "neet"] as const;
export const PLAN_IDS = ["free", "pro_monthly", "pro_yearly"] as const;

export type ExamId = (typeof EXAM_IDS)[number];
export type PlanId = (typeof PLAN_IDS)[number];
export type PaidPlanId = Exclude<PlanId, "free">;

export type ExamOption = {
  id: ExamId;
  name: string;
  description: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  priceRupees: number;
  cadence: string;
  description: string;
  features: readonly string[];
  highlighted?: boolean;
};

export type CreateOrderRequest = {
  examId: ExamId;
  planId: PaidPlanId;
};

export type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: "INR";
  examId: ExamId;
  planId: PaidPlanId;
};

export type VerifyPaymentRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  examId: ExamId;
  planId: PaidPlanId;
};

export type VerifyPaymentResponse = {
  success: boolean;
};

export const paymentExams: readonly ExamOption[] = [
  { id: "cat", name: "CAT", description: "Common Admission Test" },
  { id: "isi_msqe", name: "ISI MSQE", description: "M.S. in Quantitative Economics" },
  { id: "ugc_net", name: "UGC NET", description: "National Eligibility Test" },
  { id: "jee", name: "JEE", description: "Joint Entrance Examination" },
  { id: "neet", name: "NEET", description: "Medical entrance examination" },
];

export const paymentPlans: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    priceRupees: 0,
    cadence: "forever",
    description: "Explore the platform and start with essential exam resources.",
    features: ["Basic exam access", "Limited practice previews", "Core progress tracking"],
  },
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    priceRupees: 199,
    cadence: "per month",
    description: "Full Pro access with the flexibility of monthly billing.",
    features: ["Full exam intelligence", "Premium practice and solutions", "Advanced analytics"],
    highlighted: true,
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    priceRupees: 1999,
    cadence: "per year",
    description: "The best value for a complete year of focused preparation.",
    features: ["Everything in Pro Monthly", "Two months of savings", "Year-long exam access"],
  },
];

export function isExamId(value: unknown): value is ExamId {
  return typeof value === "string" && (EXAM_IDS as readonly string[]).includes(value);
}

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return value === "pro_monthly" || value === "pro_yearly";
}

export function getExam(examId: ExamId) {
  return paymentExams.find((exam) => exam.id === examId);
}

export function getPlan(planId: PlanId) {
  return paymentPlans.find((plan) => plan.id === planId);
}

