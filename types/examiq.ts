export type Role = "guest" | "free" | "premium" | "admin";

export type Difficulty = "easy" | "medium" | "hard";

export type Trend = "up" | "flat" | "down";

export type Risk = "low" | "medium" | "high";

export type ExamSection = {
  name: string;
  code: string;
};

export type TopicWeight = {
  name: string;
  weight: number;
  trend: Trend;
};

export type Exam = {
  slug: string;
  name: string;
  fullName: string;
  category: string;
  accent: string;
  description: string;
  yearsCovered: string;
  pyqCount: number;
  topicCount: number;
  lastUpdated: string;
  sections: ExamSection[];
  highlights: string[];
  topTopics: TopicWeight[];
};

export type DemoQuestion = {
  id: string;
  examSlug: string;
  section: string;
  year: number;
  slot: string;
  paperCode: string;
  questionText: string;
  questionType: "MCQ" | "Numeric" | "Match" | "Assertion-Reason";
  options: Record<"a" | "b" | "c" | "d", string>;
  correct: "a" | "b" | "c" | "d";
  solution: string;
  topic: string;
  subtopic: string;
  archetype: string;
  difficulty: Difficulty;
  frequencyWeight: number;
  probability: number;
  trend: number;
  isFree: boolean;
};

export type TopicProbability = {
  topic: string;
  probability: number;
  frequency: number;
  risk: Risk;
};

export type HeatmapData = {
  years: string[];
  rows: Array<{
    topic: string;
    values: number[];
  }>;
};

export type PredictedQuestion = {
  id: string;
  topic: string;
  subtopic: string;
  probability: number;
  difficulty: Difficulty;
  archetype: string;
  rationale: string;
};

export type MockPaper = {
  id: string;
  title: string;
  spec: string;
  questions: number;
  duration: string;
  difficulty: string;
};

export type Report = {
  id: string;
  title: string;
  description: string;
  tier: "free" | "premium";
  format: "PDF" | "CSV" | "Deck";
};

export type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};
