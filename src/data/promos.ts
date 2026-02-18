export type PromoCategory =
  | "Models"
  | "Design"
  | "Hosting"
  | "Productivity"
  | "Developer Tools"
  | "Analytics"
  | "Education"
  | "Infrastructure"
  | "Data"
  | "Security"
  | "Open Source"
  | "Startup Programs";

export const promoCategoryOptions: PromoCategory[] = [
  "Models",
  "Design",
  "Hosting",
  "Productivity",
  "Developer Tools",
  "Analytics",
  "Education",
  "Infrastructure",
  "Data",
  "Security",
  "Open Source",
  "Startup Programs",
];

export const promoTagOptions = [
  "free-tier",
  "credits",
  "trial",
  "startup-only",
  "student",
  "open-source",
] as const;

export type PromoTag = (typeof promoTagOptions)[number];

export type PromoEntry = {
  id: string;
  title: string;
  description: string;
  category: PromoCategory;
  tags: PromoTag[];
  url: string;
  expiryDate: "Ongoing" | string;
  addedDate: string;
  source: string;
  sourceUrl?: string;
  submittedBy?: string;
  verifiedAt?: string;
};

export const promoEntries: PromoEntry[] = [
  {
    id: "gemini-api-free-tier",
    title: "Gemini API Free Tier",
    description:
      "Free input and output tokens plus Google AI Studio access for Gemini API experimentation.",
    category: "Models",
    tags: ["free-tier", "student"],
    url: "https://ai.google.dev/pricing",
    expiryDate: "Ongoing",
    addedDate: "2025-02-10",
    source: "Gemini Developer API pricing",
    sourceUrl: "https://ai.google.dev/pricing",
  },
  {
    id: "huggingface-inference-credits",
    title: "Hugging Face Inference Providers Credits",
    description:
      "Free users receive monthly credits to try serverless inference via Hugging Face Inference Providers.",
    category: "Models",
    tags: ["credits", "open-source"],
    url: "https://huggingface.co/docs/inference-providers/en/pricing",
    expiryDate: "Ongoing",
    addedDate: "2025-02-06",
    source: "Hugging Face Inference Providers pricing",
    sourceUrl: "https://huggingface.co/docs/inference-providers/en/pricing",
  },
  {
    id: "cloudflare-workers-ai-free",
    title: "Cloudflare Workers AI Free Allocation",
    description:
      "Workers AI includes 10,000 free neurons per day before paid usage applies.",
    category: "Hosting",
    tags: ["free-tier", "startup-only"],
    url: "https://developers.cloudflare.com/workers-ai/platform/pricing/",
    expiryDate: "Ongoing",
    addedDate: "2025-01-25",
    source: "Cloudflare Workers AI pricing",
    sourceUrl: "https://developers.cloudflare.com/workers-ai/platform/pricing/",
  },
  {
    id: "pinecone-starter",
    title: "Pinecone Starter Plan",
    description:
      "Start for free with Pinecone's Starter plan for vector database, inference, and assistant usage.",
    category: "Analytics",
    tags: ["free-tier", "startup-only"],
    url: "https://www.pinecone.io/pricing",
    expiryDate: "Ongoing",
    addedDate: "2025-01-20",
    source: "Pinecone pricing",
    sourceUrl: "https://www.pinecone.io/pricing",
  },
  {
    id: "assemblyai-free-tier",
    title: "AssemblyAI Free Tier",
    description:
      "Free tier includes up to 185 hours of pre-recorded transcription and 333 hours of streaming.",
    category: "Developer Tools",
    tags: ["free-tier"],
    url: "https://www.assemblyai.com/pricing",
    expiryDate: "Ongoing",
    addedDate: "2025-01-15",
    source: "AssemblyAI pricing",
    sourceUrl: "https://www.assemblyai.com/pricing",
  },
  {
    id: "deepgram-free-credits",
    title: "Deepgram $200 Free Credit",
    description:
      "Sign up free to get $200 in Deepgram credits with no credit card required.",
    category: "Developer Tools",
    tags: ["credits"],
    url: "https://deepgram.com/pricing",
    expiryDate: "Ongoing",
    addedDate: "2024-12-30",
    source: "Deepgram pricing",
    sourceUrl: "https://deepgram.com/pricing",
  },
  {
    id: "elevenlabs-free-plan",
    title: "ElevenLabs Free Plan",
    description:
      "Free plan includes 10k monthly credits for text-to-speech, speech-to-text, and more.",
    category: "Productivity",
    tags: ["free-tier", "student"],
    url: "https://elevenlabs.io/pricing",
    expiryDate: "Ongoing",
    addedDate: "2024-12-12",
    source: "ElevenLabs pricing",
    sourceUrl: "https://elevenlabs.io/pricing",
  },
  {
    id: "stability-ai-free-credits",
    title: "Stability AI API Free Credits",
    description:
      "Stability AI developer platform includes 25 free credits to start generating with the API.",
    category: "Design",
    tags: ["credits"],
    url: "https://platform.stability.ai/pricing",
    expiryDate: "Ongoing",
    addedDate: "2024-11-21",
    source: "Stability AI Developer Platform pricing",
    sourceUrl: "https://platform.stability.ai/pricing",
  },
  {
    id: "mistral-experiment-plan",
    title: "Mistral AI Studio Experiment Plan",
    description:
      "Try Mistral's API for free with the Experiment plan using a verified phone number.",
    category: "Models",
    tags: ["trial"],
    url: "https://help.mistral.ai/en/articles/455206-how-can-i-try-the-api-for-free-with-the-experiment-plan",
    expiryDate: "Ongoing",
    addedDate: "2024-10-05",
    source: "Mistral AI Help Center",
    sourceUrl:
      "https://help.mistral.ai/en/articles/455206-how-can-i-try-the-api-for-free-with-the-experiment-plan",
  },
  {
    id: "cohere-trial-key",
    title: "Cohere Trial API Key",
    description:
      "Cohere accounts receive a trial API key with free, rate-limited calls for evaluation.",
    category: "Models",
    tags: ["trial", "startup-only"],
    url: "https://cohere.com/pricing",
    expiryDate: "Ongoing",
    addedDate: "2024-09-18",
    source: "Cohere pricing FAQ",
    sourceUrl: "https://cohere.com/pricing",
  },
  {
    id: "antigravity-free-tier",
    title: "Antigravity Free Tier",
    description:
      "Free tier includes access to Gemini 3 Pro and Flash, Claude Sonnet and Opus 4.5, gpt-oss-120b, plus unlimited tab completions and command requests with generous weekly limits.",
    category: "Developer Tools",
    tags: ["free-tier"],
    url: "https://antigravity.google/pricing",
    expiryDate: "Ongoing",
    addedDate: "2026-02-17",
    source: "Antigravity pricing",
    sourceUrl: "https://github.com/zainfathoni/ai-promo/issues/30",
    submittedBy: "ivankristianto",
  },
  {
    id: "openrouter-starter-credits",
    title: "OpenRouter Starter Credits",
    description:
      "New accounts receive starter credits to test OpenRouter's hosted model catalog.",
    category: "Models",
    tags: ["credits"],
    url: "https://openrouter.ai/pricing",
    expiryDate: "Ongoing",
    addedDate: "2026-02-14",
    source: "OpenRouter pricing",
    sourceUrl: "https://openrouter.ai/pricing",
    submittedBy: "wheeljackz",
    verifiedAt: "2026-02-14",
  },
  {
    id: "pika-free-trial",
    title: "Pika Labs Free Trial",
    description:
      "Pika offers a limited free trial for new accounts to explore AI video generation.",
    category: "Design",
    tags: ["trial"],
    url: "https://pika.art/pricing",
    expiryDate: "Ongoing",
    addedDate: "2026-02-13",
    source: "Pika pricing",
    sourceUrl: "https://pika.art/pricing",
    submittedBy: "octocat",
    verifiedAt: "2026-02-12",
  },
  {
    id: "loom-ai-starter",
    title: "Loom AI Starter Plan",
    description:
      "Loom's starter tier includes AI-powered summaries and transcription credits.",
    category: "Productivity",
    tags: ["free-tier"],
    url: "https://www.loom.com/pricing",
    expiryDate: "Ongoing",
    addedDate: "2026-02-11",
    source: "Loom pricing",
    sourceUrl: "https://www.loom.com/pricing",
    submittedBy: "ai-promo-bot",
    verifiedAt: "2026-02-11",
  },
  {
    id: "azure-for-students-credit",
    title: "Azure for Students $100 Credit",
    description:
      "Students receive $100 in Azure credit plus select free services without a credit card.",
    category: "Education",
    tags: ["credits", "student"],
    url: "https://azure.microsoft.com/free/students/",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Azure for Students",
    sourceUrl: "https://azure.microsoft.com/free/students/",
  },
  {
    id: "github-student-developer-pack",
    title: "GitHub Student Developer Pack",
    description:
      "Verified students get free tools, cloud credits, and learning resources via the GitHub Student Pack.",
    category: "Education",
    tags: ["free-tier", "student"],
    url: "https://education.github.com/pack",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "GitHub Education",
    sourceUrl: "https://education.github.com/pack",
  },
  {
    id: "aws-free-tier",
    title: "AWS Free Tier",
    description:
      "AWS Free Tier includes 12 months of free services plus always-free infrastructure offerings.",
    category: "Infrastructure",
    tags: ["free-tier"],
    url: "https://aws.amazon.com/free/",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "AWS Free Tier",
    sourceUrl: "https://aws.amazon.com/free/",
  },
  {
    id: "google-cloud-free-tier",
    title: "Google Cloud Free Tier",
    description:
      "Google Cloud offers $300 in credits for new accounts plus always-free products to get started.",
    category: "Infrastructure",
    tags: ["credits", "free-tier"],
    url: "https://cloud.google.com/free",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Google Cloud Free Tier",
    sourceUrl: "https://cloud.google.com/free",
  },
  {
    id: "mongodb-atlas-free-tier",
    title: "MongoDB Atlas Free Tier",
    description:
      "MongoDB Atlas includes a free M0 sandbox cluster for development and evaluation.",
    category: "Data",
    tags: ["free-tier"],
    url: "https://www.mongodb.com/pricing",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "MongoDB Atlas pricing",
    sourceUrl: "https://www.mongodb.com/pricing",
  },
  {
    id: "supabase-free-plan",
    title: "Supabase Free Plan",
    description:
      "Supabase Free plan includes a Postgres database, storage, and auth with generous limits.",
    category: "Data",
    tags: ["free-tier"],
    url: "https://supabase.com/pricing",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Supabase pricing",
    sourceUrl: "https://supabase.com/pricing",
  },
  {
    id: "snyk-free-plan",
    title: "Snyk Free Plan",
    description:
      "Snyk's free plan offers vulnerability scanning for open source dependencies and containers.",
    category: "Security",
    tags: ["free-tier"],
    url: "https://snyk.io/plans/",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Snyk plans",
    sourceUrl: "https://snyk.io/plans/",
  },
  {
    id: "cloudflare-zero-trust-free",
    title: "Cloudflare Zero Trust Free Plan",
    description:
      "Cloudflare Zero Trust includes a free tier for secure access, DNS filtering, and device posture.",
    category: "Security",
    tags: ["free-tier"],
    url: "https://www.cloudflare.com/zero-trust/",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Cloudflare Zero Trust",
    sourceUrl: "https://www.cloudflare.com/zero-trust/",
  },
  {
    id: "github-copilot-open-source",
    title: "GitHub Copilot for Open Source Maintainers",
    description:
      "GitHub Copilot is free for verified maintainers of popular open source projects.",
    category: "Open Source",
    tags: ["free-tier", "open-source"],
    url: "https://github.com/features/copilot",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "GitHub Copilot pricing",
    sourceUrl: "https://github.com/features/copilot#pricing",
  },
  {
    id: "jetbrains-open-source-license",
    title: "JetBrains Open Source License",
    description:
      "JetBrains provides free IDE licenses for qualifying open source projects and teams.",
    category: "Open Source",
    tags: ["free-tier", "open-source"],
    url: "https://www.jetbrains.com/community/opensource/",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "JetBrains Open Source Support",
    sourceUrl: "https://www.jetbrains.com/community/opensource/",
  },
  {
    id: "google-for-startups-cloud",
    title: "Google for Startups Cloud Program",
    description:
      "Eligible startups receive Google Cloud credits plus access to mentors and community programs.",
    category: "Startup Programs",
    tags: ["startup-only", "credits"],
    url: "https://cloud.google.com/startup",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Google for Startups Cloud Program",
    sourceUrl: "https://cloud.google.com/startup",
  },
  {
    id: "aws-activate-credits",
    title: "AWS Activate Credits",
    description:
      "AWS Activate provides credits, technical support, and training for qualifying startups.",
    category: "Startup Programs",
    tags: ["startup-only", "credits"],
    url: "https://aws.amazon.com/activate/",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "AWS Activate",
    sourceUrl: "https://aws.amazon.com/activate/",
  },
  {
    id: "ollama-free-tier",
    title: "Ollama Free Tier",
    description:
      "Free tier includes light usage for chat, quick questions, and trying out models. Currently minimax-m2.5:cloud and glm5:cloud are free to use with rate limit. Ollama can integrate with coding apps.",
    category: "Models",
    tags: ["free-tier"],
    url: "https://ollama.com/pricing",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Ollama",
    sourceUrl: "https://ollama.com/pricing",
    submittedBy: "ivankristianto",
  },
  {
    id: "microsoft-for-startups-founders-hub",
    title: "Microsoft for Startups Founders Hub",
    description:
      "Founders Hub offers Azure credits, GitHub benefits, and startup support across stages.",
    category: "Startup Programs",
    tags: ["startup-only", "credits"],
    url: "https://startups.microsoft.com/",
    expiryDate: "Ongoing",
    addedDate: "2026-02-18",
    source: "Microsoft for Startups Founders Hub",
    sourceUrl: "https://startups.microsoft.com/",
  },
];
