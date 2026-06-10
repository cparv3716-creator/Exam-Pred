import type { PricingPlan } from "@/types/examiq";

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    cadence: "forever",
    description: "For exploring PYQ structure and basic topic analysis.",
    cta: "Start Free",
    features: [
      "Limited PYQ previews",
      "Basic topic and difficulty filters",
      "Basic report downloads",
      "Follow exam catalog",
    ],
  },
  {
    name: "Premium",
    price: "499",
    cadence: "per month",
    description: "For serious aspirants using probability-led preparation.",
    cta: "Unlock Premium",
    highlighted: true,
    features: [
      "Topic probability dashboards",
      "Predicted practice archetypes",
      "Trend-weighted mock papers",
      "Premium reports and heatmaps",
      "Weak-area practice planner",
    ],
  },
  {
    name: "Institution",
    price: "Custom",
    cadence: "demo",
    description: "For coaching teams and content operators.",
    cta: "Contact Team",
    features: [
      "Admin publishing workflows",
      "Quality-check dashboards",
      "Bulk upload pipeline planning",
      "Role-based content management",
    ],
  },
];
