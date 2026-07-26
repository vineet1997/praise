export type RevealStyle =
  | "gather"
  | "opposites"
  | "depth"
  | "orbit"
  | "tighten"
  | "mask";

export type TributeLine = {
  text: string;
  keyWord?: string;
  emphasis?: "quiet" | "medium" | "strong";
  reveal: RevealStyle;
  section: "simple" | "personal";
};

export type TributeContent = {
  recipient: string;
  sender: string;
  openingMessage: string;
  scrollInstruction: string;
  floatingWords: string[];
  poemLines: TributeLine[];
  finalLine: string;
  dedication: string;
  signature: string;
};

/**
 * Edit this object to rewrite the entire tribute. Animation code derives its
 * floating words, line order and highlighted words from this single source.
 */
export const tribute: TributeContent = {
  recipient: "Priya",
  sender: "Vineet",
  openingMessage: "There are too many ways to describe you.",
  scrollInstruction: "Scroll slowly.",
  floatingWords: [
    "beautiful",
    "brilliant",
    "intelligent",
    "thoughtful",
    "strong",
    "fierce",
    "compassionate",
    "magnetic",
    "fearless",
    "graceful",
    "curious",
    "radiant",
    "resilient",
    "warm",
    "extraordinary",
    "perceptive",
    "courageous",
    "gentle",
    "powerful",
    "unforgettable",
    "honest",
    "playful",
    "patient",
    "ambitious",
    "creative",
    "elegant",
    "witty",
    "generous",
    "determined",
    "dazzling",
    "caring",
    "inspiring",
    "authentic",
    "remarkable",
    "enchanting",
    "dependable",
    "bold",
    "luminous",
    "wise",
    "passionate",
    "calm",
    "unstoppable",
    "empathetic",
    "captivating",
    "grounded",
    "vibrant",
    "protective",
    "independent",
    "irreplaceable",
    "phenomenal",
    "alive",
    "home",
    "quiet courage",
    "soft strength",
    "full of wonder",
    "deeply kind",
    "always becoming",
    "the calm",
    "the fire",
    "worth remembering",
  ],
  poemLines: [
    {
      text: "You are beautiful.",
      keyWord: "beautiful",
      emphasis: "strong",
      reveal: "gather",
      section: "simple",
    },
    {
      text: "You are brilliant.",
      keyWord: "brilliant",
      emphasis: "strong",
      reveal: "opposites",
      section: "simple",
    },
    {
      text: "You are thoughtful.",
      keyWord: "thoughtful",
      emphasis: "medium",
      reveal: "depth",
      section: "simple",
    },
    {
      text: "You are strong.",
      keyWord: "strong",
      emphasis: "strong",
      reveal: "gather",
      section: "simple",
    },
    {
      text: "You are fierce.",
      keyWord: "fierce",
      emphasis: "strong",
      reveal: "orbit",
      section: "simple",
    },
    {
      text: "You are intelligent in ways that keep surprising me.",
      keyWord: "intelligent",
      emphasis: "strong",
      reveal: "tighten",
      section: "simple",
    },
    {
      text: "You make intelligence look effortless.",
      keyWord: "intelligence",
      emphasis: "medium",
      reveal: "mask",
      section: "personal",
    },
    {
      text: "You carry strength without needing to display it.",
      keyWord: "strength",
      emphasis: "medium",
      reveal: "opposites",
      section: "personal",
    },
    {
      text: "You are gentle without ever being fragile.",
      keyWord: "gentle",
      emphasis: "medium",
      reveal: "depth",
      section: "personal",
    },
    {
      text: "You are fierce without losing your kindness.",
      keyWord: "fierce",
      emphasis: "strong",
      reveal: "orbit",
      section: "personal",
    },
    {
      text: "You carry courage quietly.",
      keyWord: "courage",
      emphasis: "medium",
      reveal: "tighten",
      section: "personal",
    },
    {
      text: "You make ordinary days feel worth remembering.",
      keyWord: "remembering",
      emphasis: "medium",
      reveal: "mask",
      section: "personal",
    },
    {
      text: "You are the calm and the fire.",
      keyWord: "calm",
      emphasis: "strong",
      reveal: "opposites",
      section: "personal",
    },
    {
      text: "You make the world around you feel more alive.",
      keyWord: "alive",
      emphasis: "strong",
      reveal: "gather",
      section: "personal",
    },
  ],
  finalLine: "And even all these words are not enough.",
  dedication: "For Priya, with all my love.",
  signature: "— Vineet",
};
