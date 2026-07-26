import { tribute } from "../content/tribute";
import { range, seededRandom } from "../lib/seededRandom";

type WordLayout = {
  word: string;
  x: number;
  y: number;
  depth: number;
  rotation: number;
  scale: number;
  opacity: number;
  blur: number;
  driftX: number;
  driftY: number;
  phase: number;
  featured: boolean;
};

const featuredWords = new Set([
  "beautiful",
  "brilliant",
  "fierce",
  "kind",
  "magnetic",
  "strong",
  "thoughtful",
  "intelligent",
]);

const safeZones = [
  [12, 16],
  [28, 10],
  [46, 18],
  [67, 11],
  [84, 20],
  [8, 38],
  [22, 31],
  [75, 35],
  [91, 42],
  [14, 61],
  [31, 72],
  [70, 65],
  [87, 73],
  [9, 88],
  [43, 85],
  [63, 91],
  [90, 89],
];

function createLayout(): WordLayout[] {
  const random = seededRandom(87421);
  return tribute.floatingWords.map((word, index) => {
    const anchor = safeZones[index % safeZones.length];
    const ring = Math.floor(index / safeZones.length);
    const x = anchor[0] + range(random, -5.5, 5.5) + (ring % 2 ? 1.8 : -1.2);
    const y = anchor[1] + range(random, -4.5, 4.5);
    const depth = range(random, 0.15, 1);
    return {
      word,
      x: Math.max(3, Math.min(97, x)),
      y: Math.max(4, Math.min(96, y)),
      depth,
      rotation: range(random, -17, 17),
      scale: featuredWords.has(word)
        ? range(random, 1.15, 1.72)
        : range(random, 0.72, 1.15),
      opacity: range(random, 0.22, 0.72) * (0.62 + depth * 0.38),
      blur: range(random, 0, 3.2) * (1.1 - depth),
      driftX: range(random, -28, 28),
      driftY: range(random, -20, 20),
      phase: range(random, 0, Math.PI * 2),
      featured: featuredWords.has(word),
    };
  });
}

const wordLayout = createLayout();

export function FloatingWordField() {
  return (
    <div className="word-field" aria-hidden="true">
      {wordLayout.map((item, index) => (
        <span
          className={`floating-word ${item.featured ? "floating-word--featured" : ""}`}
          data-floating-word={item.word}
          data-word-index={index}
          key={`${item.word}-${index}`}
          style={
            {
              "--x": `${item.x}%`,
              "--y": `${item.y}%`,
              "--depth": item.depth,
              "--rotation": `${item.rotation}deg`,
              "--word-scale": item.scale,
              "--word-opacity": item.opacity,
              "--word-blur": `${item.blur}px`,
              "--drift-x": `${item.driftX}px`,
              "--drift-y": `${item.driftY}px`,
              "--phase": item.phase,
            } as React.CSSProperties
          }
        >
          <span className="floating-word__inner">{item.word}</span>
        </span>
      ))}
    </div>
  );
}
