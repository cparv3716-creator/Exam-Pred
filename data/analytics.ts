import type { HeatmapData, MockPaper, PredictedQuestion, Report, TopicProbability } from "@/types/examiq";

export const trendByYear = [
  { year: "2019", arithmetic: 22, algebra: 18, geometry: 14, modern: 9 },
  { year: "2020", arithmetic: 24, algebra: 16, geometry: 13, modern: 11 },
  { year: "2021", arithmetic: 26, algebra: 19, geometry: 12, modern: 12 },
  { year: "2022", arithmetic: 28, algebra: 21, geometry: 11, modern: 14 },
  { year: "2023", arithmetic: 31, algebra: 23, geometry: 10, modern: 16 },
  { year: "2024", arithmetic: 34, algebra: 25, geometry: 9, modern: 18 },
];

export const topicProbability: TopicProbability[] = [
  { topic: "Arithmetic", probability: 86, frequency: 92, risk: "low" },
  { topic: "Algebra", probability: 79, frequency: 84, risk: "low" },
  { topic: "Geometry", probability: 64, frequency: 58, risk: "medium" },
  { topic: "Number System", probability: 71, frequency: 66, risk: "medium" },
  { topic: "Modern Math", probability: 58, frequency: 49, risk: "high" },
  { topic: "Reading Comp.", probability: 82, frequency: 88, risk: "low" },
  { topic: "Para Jumbles", probability: 47, frequency: 61, risk: "high" },
  { topic: "Bar and Pie DI", probability: 73, frequency: 73, risk: "medium" },
];

export const heatmap: HeatmapData = {
  years: ["2019", "2020", "2021", "2022", "2023", "2024"],
  rows: [
    { topic: "Arithmetic", values: [60, 64, 68, 74, 81, 86] },
    { topic: "Algebra", values: [55, 58, 62, 67, 72, 79] },
    { topic: "Geometry", values: [70, 66, 61, 55, 50, 44] },
    { topic: "Number System", values: [48, 52, 58, 63, 67, 71] },
    { topic: "Modern Math", values: [30, 36, 42, 49, 53, 58] },
    { topic: "Reading Comp.", values: [78, 80, 81, 80, 82, 84] },
  ],
};

export const predictedQuestions: PredictedQuestion[] = [
  {
    id: "pred-1",
    topic: "Arithmetic",
    subtopic: "Time and Work",
    probability: 88,
    difficulty: "medium",
    archetype: "Combined-rate word problem",
    rationale:
      "Synthetic demo signal: recurring rate-based arithmetic patterns with rising weight in the sample timeline.",
  },
  {
    id: "pred-2",
    topic: "Algebra",
    subtopic: "Functions",
    probability: 81,
    difficulty: "hard",
    archetype: "Composite function evaluation",
    rationale:
      "Synthetic demo signal: function-composition framing is weighted higher across recent mock cycles.",
  },
  {
    id: "pred-3",
    topic: "Data Interpretation",
    subtopic: "Caselet DI",
    probability: 76,
    difficulty: "hard",
    archetype: "Multi-table reasoning",
    rationale:
      "Synthetic demo signal: caselet-style DI sets are emphasized in the practice model.",
  },
  {
    id: "pred-4",
    topic: "Reading Comp.",
    subtopic: "Inference",
    probability: 84,
    difficulty: "medium",
    archetype: "Author-inference question",
    rationale:
      "Synthetic demo signal: inference tasks remain a high-frequency reading comprehension archetype.",
  },
];

export const mockPapers: MockPaper[] = [
  {
    id: "mock-1",
    title: "Trend-Weighted Full Mock - Set A",
    spec: "Probability >= 70, balanced difficulty",
    questions: 66,
    duration: "120 min",
    difficulty: "Adaptive",
  },
  {
    id: "mock-2",
    title: "High-Probability Practice Set - QA Focus",
    spec: "Top 20 predicted QA archetypes",
    questions: 22,
    duration: "40 min",
    difficulty: "Hard",
  },
  {
    id: "mock-3",
    title: "Expected Pattern Drill - Section Blend",
    spec: "Weighted by year-over-year trend shift",
    questions: 48,
    duration: "90 min",
    difficulty: "Adaptive",
  },
];

export const reports: Report[] = [
  {
    id: "basic-pyq",
    title: "Basic PYQ Topic Snapshot",
    description: "A demo PDF-style snapshot of topic, subtopic and difficulty distribution.",
    tier: "free",
    format: "PDF",
  },
  {
    id: "probability-brief",
    title: "Premium Probability Brief",
    description: "Topic likelihood, trend movement, risk flags and recommended practice clusters.",
    tier: "premium",
    format: "Deck",
  },
  {
    id: "mock-blueprint",
    title: "Mock Paper Blueprint",
    description: "A downloadable demo blueprint for trend-weighted mock construction.",
    tier: "premium",
    format: "CSV",
  },
];

export const practicePlan = [
  { topic: "Modern Math", strength: 38, priority: "high", recommended: 12 },
  { topic: "Para Jumbles", strength: 44, priority: "high", recommended: 10 },
  { topic: "Geometry", strength: 56, priority: "medium", recommended: 8 },
  { topic: "Number System", strength: 63, priority: "medium", recommended: 6 },
  { topic: "Arithmetic", strength: 82, priority: "low", recommended: 3 },
];

export const howItWorks = [
  {
    step: "01",
    title: "Ingest PYQ Patterns",
    desc: "Legally permitted question material is structured by topic, archetype, difficulty and session metadata.",
  },
  {
    step: "02",
    title: "Analyze and Score",
    desc: "Each topic is scored on frequency, trend movement and recurrence to surface what truly matters.",
  },
  {
    step: "03",
    title: "Estimate Probability",
    desc: "The pattern engine estimates likelihood and creates candidate practice archetypes.",
  },
  {
    step: "04",
    title: "Practice Smart",
    desc: "Trend-weighted mocks and weak-area planning turn insight into focused practice.",
  },
];

export const faqs = [
  {
    q: "Does Statstrive provide leaked or official exam papers?",
    a: "No. Statstrive is an independent pattern-analysis and practice platform. It does not provide leaked, official, exact, or guaranteed exam questions.",
  },
  {
    q: "Where does the question content come from?",
    a: "The production workflow will accept owned, licensed, or otherwise legally permitted material uploaded by administrators. This build uses synthetic demo questions only.",
  },
  {
    q: "What is the difference between free and premium?",
    a: "Free members get PYQ analysis, basic filters and basic downloads. Premium unlocks topic-probability dashboards, predicted practice archetypes, heatmaps, mocks and reports.",
  },
  {
    q: "How accurate are the predictions?",
    a: "Predictions are probability estimates, not certainties. They help prioritize study plans and do not guarantee outcomes.",
  },
  {
    q: "Which exams are supported?",
    a: "CAT, JEE Main, JEE Advanced, NEET, GATE, UPSC, JAM, UGC NET, CUET and SSC / Banking placeholders are included in the demo catalog.",
  },
];
