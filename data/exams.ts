import type { Exam } from "@/types/examiq";

export const exams: Exam[] = [
  {
    slug: "cat",
    name: "CAT",
    fullName: "Common Admission Test",
    category: "Management",
    accent: "#22d3ee",
    description:
      "Topic probability and pattern intelligence for QA, VARC and DILR built from years of question-pattern analysis.",
    yearsCovered: "2015-2024",
    pyqCount: 2840,
    topicCount: 96,
    lastUpdated: "Demo refreshed today",
    sections: [
      { name: "Quantitative Ability", code: "QA" },
      { name: "Verbal Ability and Reading Comprehension", code: "VARC" },
      { name: "Data Interpretation and Logical Reasoning", code: "DILR" },
    ],
    highlights: ["PYQ analysis", "Predicted QA paper", "Topic likelihood"],
    topTopics: [
      { name: "Arithmetic", weight: 92, trend: "up" },
      { name: "Algebra", weight: 84, trend: "up" },
      { name: "Reading Comprehension", weight: 88, trend: "flat" },
      { name: "Para Jumbles", weight: 61, trend: "down" },
      { name: "Bar and Pie DI", weight: 73, trend: "up" },
    ],
  },
  {
    slug: "jee-main",
    name: "JEE Main",
    fullName: "Joint Entrance Examination Main",
    category: "Engineering",
    accent: "#3b82f6",
    description:
      "Chapter-wise PYQ mapping and high-weightage topic detection across Physics, Chemistry and Mathematics.",
    yearsCovered: "2014-2024",
    pyqCount: 5120,
    topicCount: 148,
    lastUpdated: "Demo refreshed yesterday",
    sections: [
      { name: "Physics", code: "PHY" },
      { name: "Chemistry", code: "CHE" },
      { name: "Mathematics", code: "MAT" },
    ],
    highlights: ["Chapter-wise PYQs", "High-weightage topics", "Topic probability"],
    topTopics: [
      { name: "Rotational Motion", weight: 81, trend: "up" },
      { name: "Coordination Chemistry", weight: 77, trend: "up" },
      { name: "Calculus", weight: 90, trend: "flat" },
      { name: "Electrostatics", weight: 74, trend: "down" },
      { name: "Organic Reaction Mechanisms", weight: 83, trend: "up" },
    ],
  },
  {
    slug: "jee-advanced",
    name: "JEE Advanced",
    fullName: "Joint Entrance Examination Advanced",
    category: "Engineering",
    accent: "#6366f1",
    description:
      "Advanced archetype clustering and difficulty-aware prediction for multi-concept engineering problems.",
    yearsCovered: "2013-2024",
    pyqCount: 2360,
    topicCount: 132,
    lastUpdated: "Demo refreshed 3 days ago",
    sections: [
      { name: "Physics", code: "PHY" },
      { name: "Chemistry", code: "CHE" },
      { name: "Mathematics", code: "MAT" },
    ],
    highlights: ["Archetype clusters", "Difficulty modelling", "Multi-concept linkage"],
    topTopics: [
      { name: "Thermodynamics", weight: 79, trend: "up" },
      { name: "Vectors and 3D Geometry", weight: 72, trend: "flat" },
      { name: "Chemical Equilibrium", weight: 68, trend: "up" },
    ],
  },
  {
    slug: "neet",
    name: "NEET",
    fullName: "National Eligibility cum Entrance Test",
    category: "Medical",
    accent: "#34d399",
    description:
      "NCERT-linked PYQ mapping and topic probability for Physics, Chemistry and Biology.",
    yearsCovered: "2013-2024",
    pyqCount: 4480,
    topicCount: 121,
    lastUpdated: "Demo refreshed today",
    sections: [
      { name: "Physics", code: "PHY" },
      { name: "Chemistry", code: "CHE" },
      { name: "Biology", code: "BIO" },
    ],
    highlights: ["NCERT-linked PYQs", "Topic probability", "Weightage maps"],
    topTopics: [
      { name: "Human Physiology", weight: 94, trend: "up" },
      { name: "Genetics and Evolution", weight: 87, trend: "flat" },
      { name: "Organic Chemistry", weight: 80, trend: "up" },
      { name: "Mechanics", weight: 70, trend: "down" },
    ],
  },
  {
    slug: "gate",
    name: "GATE",
    fullName: "Graduate Aptitude Test in Engineering",
    category: "Engineering",
    accent: "#a855f7",
    description:
      "Branch-wise and topic-wise previous-year weightage with engineering mathematics emphasis.",
    yearsCovered: "2012-2024",
    pyqCount: 3100,
    topicCount: 160,
    lastUpdated: "Demo refreshed 4 days ago",
    sections: [
      { name: "Engineering Mathematics", code: "MA" },
      { name: "Core Subject", code: "CORE" },
      { name: "General Aptitude", code: "GA" },
    ],
    highlights: ["Branch-wise", "Previous-year weightage", "Engineering mathematics"],
    topTopics: [
      { name: "Linear Algebra", weight: 85, trend: "up" },
      { name: "Probability", weight: 78, trend: "flat" },
      { name: "Digital Logic", weight: 71, trend: "up" },
    ],
  },
  {
    slug: "upsc",
    name: "UPSC",
    fullName: "Union Public Service Commission CSE",
    category: "Civil Services",
    accent: "#f59e0b",
    description:
      "PYQ theme clustering across GS papers with current-affairs linkage and optional-subject pattern previews.",
    yearsCovered: "2011-2024",
    pyqCount: 2680,
    topicCount: 110,
    lastUpdated: "Demo refreshed yesterday",
    sections: [
      { name: "GS Paper I", code: "GS1" },
      { name: "GS Paper II", code: "GS2" },
      { name: "GS Paper III", code: "GS3" },
      { name: "GS Paper IV", code: "GS4" },
    ],
    highlights: ["PYQ themes", "Current-affairs linkage", "Optional patterns"],
    topTopics: [
      { name: "Polity and Governance", weight: 89, trend: "up" },
      { name: "Modern History", weight: 76, trend: "flat" },
      { name: "Environment and Ecology", weight: 82, trend: "up" },
    ],
  },
  {
    slug: "jam",
    name: "JAM",
    fullName: "Joint Admission Test for Masters",
    category: "Science",
    accent: "#ec4899",
    description:
      "Subject-wise concept clusters and PYQ trend detection for science postgraduate admissions.",
    yearsCovered: "2014-2024",
    pyqCount: 1560,
    topicCount: 88,
    lastUpdated: "Demo refreshed 5 days ago",
    sections: [
      { name: "Mathematics", code: "MA" },
      { name: "Physics", code: "PH" },
      { name: "Chemistry", code: "CY" },
    ],
    highlights: ["Subject-wise", "Concept clusters", "PYQ trends"],
    topTopics: [
      { name: "Real Analysis", weight: 80, trend: "up" },
      { name: "Quantum Mechanics", weight: 73, trend: "flat" },
    ],
  },
  {
    slug: "ugc-net",
    name: "UGC NET",
    fullName: "University Grants Commission National Eligibility Test",
    category: "Academia",
    accent: "#14b8a6",
    description:
      "Paper I aptitude patterns and subject-specific topic frequency for lectureship eligibility.",
    yearsCovered: "2015-2024",
    pyqCount: 1980,
    topicCount: 94,
    lastUpdated: "Demo refreshed 6 days ago",
    sections: [
      { name: "Paper I Teaching Aptitude", code: "P1" },
      { name: "Paper II Subject", code: "P2" },
    ],
    highlights: ["Aptitude patterns", "Subject frequency", "Topic likelihood"],
    topTopics: [
      { name: "Research Aptitude", weight: 84, trend: "up" },
      { name: "Data Interpretation", weight: 70, trend: "flat" },
    ],
  },
  {
    slug: "cuet",
    name: "CUET",
    fullName: "Common University Entrance Test",
    category: "Undergraduate",
    accent: "#0ea5e9",
    description:
      "Domain-subject and general-test pattern analysis for central university admissions.",
    yearsCovered: "2022-2024",
    pyqCount: 1240,
    topicCount: 70,
    lastUpdated: "Demo refreshed 2 days ago",
    sections: [
      { name: "General Test", code: "GT" },
      { name: "Domain Subjects", code: "DOM" },
      { name: "Language", code: "LANG" },
    ],
    highlights: ["Domain patterns", "General-test trends", "Topic likelihood"],
    topTopics: [
      { name: "Quantitative Aptitude", weight: 75, trend: "up" },
      { name: "General Knowledge", weight: 68, trend: "flat" },
    ],
  },
  {
    slug: "ssc-banking",
    name: "SSC / Banking",
    fullName: "Staff Selection and Banking Examinations",
    category: "Government",
    accent: "#f43f5e",
    description:
      "Quant, reasoning and English pattern intelligence across SSC and banking recruitment tests.",
    yearsCovered: "2016-2024",
    pyqCount: 3620,
    topicCount: 102,
    lastUpdated: "Demo refreshed today",
    sections: [
      { name: "Quantitative Aptitude", code: "QA" },
      { name: "Reasoning", code: "REA" },
      { name: "English", code: "ENG" },
      { name: "General Awareness", code: "GA" },
    ],
    highlights: ["Quant patterns", "Reasoning trends", "High-frequency sets"],
    topTopics: [
      { name: "Simplification", weight: 88, trend: "up" },
      { name: "Seating Arrangement", weight: 79, trend: "flat" },
      { name: "Number Series", weight: 72, trend: "down" },
    ],
  },
];

export const examCategories = ["All", ...Array.from(new Set(exams.map((exam) => exam.category)))];

export function getExamBySlug(slug: string) {
  return exams.find((exam) => exam.slug === slug) ?? null;
}
