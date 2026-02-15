export type PromoCategory =
  | "Models"
  | "Design"
  | "Hosting"
  | "Productivity"
  | "Developer Tools"
  | "Analytics";

export type PromoEntry = {
  id: string;
  title: string;
  description: string;
  category: PromoCategory;
  url: string;
  expiryDate: string;
};

export const promoEntries: PromoEntry[] = [
  {
    id: "openai-credits",
    title: "OpenAI Startup Credits",
    description: "Apply for up to $2,500 in API credits for new AI startups.",
    category: "Models",
    url: "https://openai.com/startups",
    expiryDate: "2026-04-30",
  },
  {
    id: "anthropic-bundled",
    title: "Claude Pro 2-Month Trial",
    description: "Two free months of Claude Pro for new teams in beta access.",
    category: "Productivity",
    url: "https://www.anthropic.com/claude",
    expiryDate: "2026-02-28",
  },
  {
    id: "vercel-ai-deploy",
    title: "Vercel AI Launch Bundle",
    description: "$200 Vercel credit and priority onboarding for AI demos.",
    category: "Hosting",
    url: "https://vercel.com/ai",
    expiryDate: "2026-06-01",
  },
  {
    id: "figma-ai-kit",
    title: "Figma AI UI Kit",
    description: "Free AI-focused UI kit with prompt templates and components.",
    category: "Design",
    url: "https://www.figma.com/community",
    expiryDate: "2026-03-10",
  },
  {
    id: "langsmith-trial",
    title: "LangSmith Team Trial",
    description: "45-day LangSmith team trial plus evaluation dashboard export.",
    category: "Developer Tools",
    url: "https://www.langchain.com/langsmith",
    expiryDate: "2026-05-15",
  },
  {
    id: "weights-biases",
    title: "Weights & Biases AI Grant",
    description: "Early-stage teams get free experiment tracking for 6 months.",
    category: "Analytics",
    url: "https://wandb.ai/site",
    expiryDate: "2025-12-31",
  },
  {
    id: "replicate-credits",
    title: "Replicate Credits Pack",
    description: "$100 of inference credits for shipping your first model demo.",
    category: "Models",
    url: "https://replicate.com",
    expiryDate: "2026-01-20",
  },
  {
    id: "notion-ai",
    title: "Notion AI for Startups",
    description: "Free Notion AI seats for 3 months plus onboarding templates.",
    category: "Productivity",
    url: "https://www.notion.so/product/ai",
    expiryDate: "2026-07-01",
  },
];
