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
  expiryDate: "Ongoing" | string;
  source: string;
  sourceUrl: string;
};

export const promoEntries: PromoEntry[] = [
  {
    id: "gemini-api-free-tier",
    title: "Gemini API Free Tier",
    description:
      "Free input and output tokens plus Google AI Studio access for Gemini API experimentation.",
    category: "Models",
    url: "https://ai.google.dev/pricing",
    expiryDate: "Ongoing",
    source: "Gemini Developer API pricing",
    sourceUrl: "https://ai.google.dev/pricing",
  },
  {
    id: "huggingface-inference-credits",
    title: "Hugging Face Inference Providers Credits",
    description:
      "Free users receive monthly credits to try serverless inference via Hugging Face Inference Providers.",
    category: "Models",
    url: "https://huggingface.co/docs/inference-providers/en/pricing",
    expiryDate: "Ongoing",
    source: "Hugging Face Inference Providers pricing",
    sourceUrl: "https://huggingface.co/docs/inference-providers/en/pricing",
  },
  {
    id: "cloudflare-workers-ai-free",
    title: "Cloudflare Workers AI Free Allocation",
    description:
      "Workers AI includes 10,000 free neurons per day before paid usage applies.",
    category: "Hosting",
    url: "https://developers.cloudflare.com/workers-ai/platform/pricing/",
    expiryDate: "Ongoing",
    source: "Cloudflare Workers AI pricing",
    sourceUrl: "https://developers.cloudflare.com/workers-ai/platform/pricing/",
  },
  {
    id: "pinecone-starter",
    title: "Pinecone Starter Plan",
    description:
      "Start for free with Pinecone's Starter plan for vector database, inference, and assistant usage.",
    category: "Analytics",
    url: "https://www.pinecone.io/pricing",
    expiryDate: "Ongoing",
    source: "Pinecone pricing",
    sourceUrl: "https://www.pinecone.io/pricing",
  },
  {
    id: "assemblyai-free-tier",
    title: "AssemblyAI Free Tier",
    description:
      "Free tier includes up to 185 hours of pre-recorded transcription and 333 hours of streaming.",
    category: "Developer Tools",
    url: "https://www.assemblyai.com/pricing",
    expiryDate: "Ongoing",
    source: "AssemblyAI pricing",
    sourceUrl: "https://www.assemblyai.com/pricing",
  },
  {
    id: "deepgram-free-credits",
    title: "Deepgram $200 Free Credit",
    description:
      "Sign up free to get $200 in Deepgram credits with no credit card required.",
    category: "Developer Tools",
    url: "https://deepgram.com/pricing",
    expiryDate: "Ongoing",
    source: "Deepgram pricing",
    sourceUrl: "https://deepgram.com/pricing",
  },
  {
    id: "elevenlabs-free-plan",
    title: "ElevenLabs Free Plan",
    description:
      "Free plan includes 10k monthly credits for text-to-speech, speech-to-text, and more.",
    category: "Productivity",
    url: "https://elevenlabs.io/pricing",
    expiryDate: "Ongoing",
    source: "ElevenLabs pricing",
    sourceUrl: "https://elevenlabs.io/pricing",
  },
  {
    id: "stability-ai-free-credits",
    title: "Stability AI API Free Credits",
    description:
      "Stability AI developer platform includes 25 free credits to start generating with the API.",
    category: "Design",
    url: "https://platform.stability.ai/pricing",
    expiryDate: "Ongoing",
    source: "Stability AI Developer Platform pricing",
    sourceUrl: "https://platform.stability.ai/pricing",
  },
  {
    id: "mistral-experiment-plan",
    title: "Mistral AI Studio Experiment Plan",
    description:
      "Try Mistral's API for free with the Experiment plan using a verified phone number.",
    category: "Models",
    url: "https://help.mistral.ai/en/articles/455206-how-can-i-try-the-api-for-free-with-the-experiment-plan",
    expiryDate: "Ongoing",
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
    url: "https://cohere.com/pricing",
    expiryDate: "Ongoing",
    source: "Cohere pricing FAQ",
    sourceUrl: "https://cohere.com/pricing",
  },
];
