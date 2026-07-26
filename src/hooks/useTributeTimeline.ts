import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, SplitText);

const firstReveal = new Set([
  "beautiful",
  "brilliant",
  "fierce",
  "kind",
  "magnetic",
]);

type TimelineOptions = {
  scope: React.RefObject<HTMLElement | null>;
};

function getVisibleWords(scope: HTMLElement) {
  return gsap.utils
    .toArray<HTMLElement>(".floating-word", scope)
    .filter((word) => getComputedStyle(word).display !== "none");
}

export function useTributeTimeline({ scope }: TimelineOptions) {
  const progressRef = useRef(0);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const stage = root.querySelector<HTMLElement>(".visual-stage");
      const universe = root.querySelector<HTMLElement>(".word-field");
      const intro = root.querySelector<HTMLElement>(".opening-message");
      const instruction = root.querySelector<HTMLElement>(".scroll-instruction");
      const poem = root.querySelector<HTMLElement>(".poem-stage");
      const final = root.querySelector<HTMLElement>(".final-dedication");
      const cloud = root.querySelector<HTMLElement>(".convergence-cloud");
      if (!stage || !universe || !intro || !instruction || !poem || !final || !cloud) {
        return;
      }

      const words = getVisibleWords(root);
      const lines = gsap.utils.toArray<HTMLElement>(".poem-line", root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          animated: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 640px)",
        },
        (context) => {
          const { animated, reduced, mobile } = context.conditions as {
            animated: boolean;
            reduced: boolean;
            mobile: boolean;
          };

          if (reduced || !animated) {
            gsap.set([intro, instruction, universe, poem, final], {
              clearProps: "all",
              opacity: 1,
              visibility: "visible",
            });
            gsap.set(words, {
              opacity: 0.18,
              filter: "blur(0px)",
              rotation: 0,
            });
            gsap.set(lines, { opacity: 1, y: 0, filter: "blur(0px)" });
            return;
          }

          const openingSplit = new SplitText(intro, {
            type: "words",
            wordsClass: "opening-word",
          });

          gsap.set(openingSplit.words, { opacity: 0.88, yPercent: 0 });
          gsap.set(instruction, { opacity: 0.68, y: 0 });
          gsap.set(poem, { opacity: 1 });
          gsap.set(lines, { opacity: 0, y: 16, filter: "blur(5px)" });
          gsap.set(final, { opacity: 1, visibility: "visible" });
          gsap.set(".final-dedication__copy > *", { opacity: 0, y: 18 });
          gsap.set(".replay", { opacity: 0, pointerEvents: "none" });
          gsap.set(words, { opacity: 0 });
          gsap.set(
            words.filter((word) =>
              firstReveal.has(word.dataset.floatingWord ?? ""),
            ),
            { opacity: 0.14 },
          );
          gsap.set(cloud, { opacity: 0, scale: 0.35 });

          const scrollDistance = mobile ? 9800 : 12600;
          const timeline = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: `+=${scrollDistance}`,
              pin: stage,
              scrub: 1.15,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                progressRef.current = self.progress;
                root.style.setProperty("--story-progress", String(self.progress));
              },
            },
          });

          timeline
            .to(openingSplit.words, {
              opacity: 1,
              yPercent: 0,
              stagger: 0.11,
              duration: 2.2,
              ease: "power2.out",
            }, 0.6)
            .to(instruction, { opacity: 0.7, y: 0, duration: 1.1 }, 3.2);

          words.forEach((word, index) => {
            const name = word.dataset.floatingWord ?? "";
            const early = firstReveal.has(name);
            timeline.to(
              word,
              {
                opacity: Number(
                  getComputedStyle(word).getPropertyValue("--word-opacity"),
                ) || 0.55,
                duration: early ? 2.4 : 2,
                ease: "power2.out",
              },
              early ? 1.1 + index * 0.025 : 5.8 + (index % 19) * 0.11,
            );
          });

          timeline
            .to(instruction, { opacity: 0, duration: 1.2 }, 8.5)
            .to(intro, { opacity: 0, y: -18, duration: 2 }, 12)
            .to(".aurora__veil--rose", { opacity: 0.8, scale: 1.12, duration: 13 }, 18)
            .to(".aurora__veil--gold", { opacity: 0.66, scale: 1.08, duration: 13 }, 21);

          words.forEach((word, index) => {
            const phase = Number(
              getComputedStyle(word).getPropertyValue("--phase"),
            );
            const radius = mobile ? 8 + (index % 5) * 2 : 14 + (index % 8) * 3;
            timeline.to(
              word,
              {
                x: Math.cos(phase) * radius,
                y: Math.sin(phase) * radius * 0.55,
                rotation: 0,
                filter: "blur(0px)",
                opacity: Math.min(
                  0.78,
                  (Number(
                    getComputedStyle(word).getPropertyValue("--word-opacity"),
                  ) || 0.5) + 0.14,
                ),
                duration: 11,
              },
              27 + (index % 7) * 0.16,
            );
          });

          const sourceWords = new Map<string, HTMLElement>();
          words.forEach((word) => {
            const key = word.dataset.floatingWord;
            if (key && !sourceWords.has(key)) sourceWords.set(key, word);
          });

          const simpleLines = lines.filter(
            (_, index) => index < 6,
          );
          simpleLines.forEach((line, index) => {
            const start = 40 + index * 4.25;
            const keyTarget = line.querySelector<HTMLElement>(".poem-line__key");
            const key = keyTarget?.dataset.poemKey;
            const source = key ? sourceWords.get(key) : undefined;

            timeline.to(
              words,
              {
                opacity: (_i, element: HTMLElement) =>
                  element === source ? 0.94 : Math.max(0.1, 0.42 - index * 0.04),
                duration: 1.15,
                stagger: { each: 0.006, from: "center" },
              },
              start,
            );
            timeline.to(
              line,
              { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.35 },
              start + 1.15,
            );

            if (source && keyTarget) {
              const sourceRect = source.getBoundingClientRect();
              const targetRect = keyTarget.getBoundingClientRect();
              const dx =
                targetRect.left +
                targetRect.width / 2 -
                (sourceRect.left + sourceRect.width / 2);
              const dy =
                targetRect.top +
                targetRect.height / 2 -
                (sourceRect.top + sourceRect.height / 2);
              const scale = Math.max(
                0.72,
                Math.min(1.45, targetRect.height / Math.max(sourceRect.height, 1)),
              );
              gsap.set(keyTarget, { opacity: 0 });
              timeline
                .to(
                  source,
                  {
                    x: `+=${dx}`,
                    y: `+=${dy}`,
                    scale,
                    rotation: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 2.1,
                    ease: "power3.inOut",
                  },
                  start + 0.2,
                )
                .set(keyTarget, { opacity: 1 }, start + 2.22)
                .set(source, { opacity: 0 }, start + 2.22);
            }
          });

          const personalLines = lines.slice(6);
          personalLines.forEach((line, index) => {
            const start = 68 + index * 2.2;
            const reveal = line.dataset.reveal;
            const fromVars: gsap.TweenVars = {
              opacity: 0,
              y: reveal === "depth" ? 8 : 14,
              x:
                reveal === "opposites"
                  ? index % 2
                    ? -24
                    : 24
                  : 0,
              filter: reveal === "depth" ? "blur(9px)" : "blur(3px)",
              letterSpacing: reveal === "tighten" ? "0.13em" : "0em",
            };
            timeline.fromTo(
              line,
              fromVars,
              {
                opacity: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
                letterSpacing: "0em",
                duration: 1.8,
                ease: "power3.out",
              },
              start,
            );
          });

          timeline.to(words, {
            opacity: (_i, element: HTMLElement) =>
              Number(gsap.getProperty(element, "opacity")) > 0 ? 0.2 : 0,
            x: (_i, element: HTMLElement) => {
              const rect = element.getBoundingClientRect();
              return `+=${window.innerWidth / 2 - (rect.left + rect.width / 2)}`;
            },
            y: (_i, element: HTMLElement) => {
              const rect = element.getBoundingClientRect();
              return `+=${window.innerHeight / 2 - (rect.top + rect.height / 2)}`;
            },
            scale: 0.72,
            duration: 5.4,
            stagger: { each: 0.025, from: "edges" },
            ease: "power2.in",
          }, 86);

          timeline
            .to(poem, { opacity: 0.14, filter: "blur(2px)", duration: 3.3 }, 86)
            .to(cloud, { opacity: 0.8, scale: 1, duration: 3.8, ease: "power2.out" }, 89)
            .to(".aurora__veil", { opacity: 0.9, duration: 3.5 }, 89)
            .to(cloud, { opacity: 0, scale: 1.16, duration: 2.4 }, 94)
            .to(words, { opacity: 0, duration: 1.8 }, 94)
            .to(poem, { opacity: 0, duration: 1.8 }, 94)
            .to(".final-dedication__line", { opacity: 1, y: 0, duration: 2.2 }, 95)
            .to(".final-dedication__for", { opacity: 1, y: 0, duration: 2 }, 97.1)
            .to(".final-dedication__signature", { opacity: 1, y: 0, duration: 1.6 }, 98.4)
            .to(".replay", { opacity: 0.58, pointerEvents: "auto", duration: 1.2 }, 99.4);

          return () => {
            openingSplit.revert();
          };
        },
      );

      return () => mm.revert();
    },
    { scope, dependencies: [] },
  );

  useEffect(() => {
    const root = scope.current;
    if (!root || window.matchMedia("(pointer: coarse)").matches) return;

    const words = Array.from(
      root.querySelectorAll<HTMLElement>(".floating-word__inner"),
    );
    const setters = words.map((word) => ({
      x: gsap.quickSetter(word, "x", "px"),
      y: gsap.quickSetter(word, "y", "px"),
      node: word,
    }));
    const pointer = { x: -1000, y: -1000 };
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const tick = (time: number) => {
      if (!document.hidden && progressRef.current < 0.82) {
        const interaction = Math.max(0, 1 - progressRef.current / 0.72);
        setters.forEach((setter, index) => {
          const rect = setter.node.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const force = Math.max(0, 1 - distance / 150) * interaction;
          const driftX = Math.sin(time * 0.00025 + index * 1.73) * (4 + index % 5);
          const driftY = Math.cos(time * 0.0002 + index * 1.11) * (3 + index % 4);
          setter.x(driftX + (dx / distance) * force * 18);
          setter.y(driftY + (dy / distance) * force * 14);
        });
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, [scope]);

  useEffect(() => {
    let resizeTimer = 0;
    const refresh = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    };
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("resize", refresh, { passive: true });
    return () => {
      window.removeEventListener("resize", refresh);
      window.clearTimeout(resizeTimer);
    };
  }, []);
}
