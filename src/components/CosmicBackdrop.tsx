import { useEffect, useRef } from "react";
import {
  Geometry,
  Mesh,
  Program,
  Renderer,
  Transform,
  Triangle,
  Vec2,
} from "ogl";
import { seededRandom } from "../lib/seededRandom";

const atmosphereVertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;
  uniform float uEnergy;
  uniform float uWarmth;
  uniform float uStillness;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise21(p);
      p = rotation * p * 2.03 + 13.17;
      amplitude *= 0.5;
    }
    return value;
  }

  float particulateVeil(
    vec2 uv,
    vec2 origin,
    vec2 direction,
    float bend,
    float phase,
    float width
  ) {
    vec2 axis = normalize(direction);
    vec2 normal = vec2(-axis.y, axis.x);
    vec2 local = uv - origin;
    float along = dot(local, axis);
    float across = dot(local, normal);

    float broadWarp = fbm(vec2(along * 1.7 + phase * 0.07, across * 1.2 - phase * 0.04));
    float fold = sin(along * 4.1 + phase) * 0.045;
    fold += sin(along * 8.7 - phase * 0.54) * 0.018;
    fold += (broadWarp - 0.5) * 0.12 + bend * along * along;

    float distanceToFold = abs(across - fold);
    float envelope = exp(-distanceToFold * distanceToFold / max(width * width, 0.0001));
    float entry = smoothstep(-0.03, 0.12, along);
    float exit = 1.0 - smoothstep(0.42, 0.78, along);

    float particulate = fbm(vec2(along * 8.4 - phase * 0.12, (across - fold) * 26.0 + phase));
    float dust = smoothstep(0.48, 0.86, particulate);
    float threads = pow(
      0.5 + 0.5 * sin((across - fold) * 92.0 + broadWarp * 11.0 + phase),
      9.0
    );
    float translucentBody = envelope * (0.18 + dust * 0.54 + threads * 0.24);
    return translucentBody * entry * exit;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    p.x *= aspect;

    float motion = uTime * mix(1.0, 0.09, uStillness);
    p += uPointer * vec2(0.035, 0.022) * (1.0 - uStillness);

    float domainA = fbm(p * 1.18 + vec2(motion * 0.025, -motion * 0.014));
    float domainB = fbm(p * 2.6 + vec2(-motion * 0.017, motion * 0.021) + domainA * 1.7);
    vec2 veilUv = uv + uPointer * vec2(0.012, 0.008) * (1.0 - uStillness);
    veilUv += vec2(domainA - 0.5, domainB - 0.5) * mix(0.025, 0.009, uStillness);

    float roseVeil = particulateVeil(
      veilUv,
      vec2(-0.08, 0.02),
      vec2(0.84, 0.37),
      -0.09,
      motion * 0.055 + 1.1,
      0.17
    );
    float goldVeil = particulateVeil(
      veilUv,
      vec2(1.08, 1.04),
      vec2(-0.82, -0.31),
      0.08,
      -motion * 0.046 + 3.2,
      0.16
    );
    float lavenderVeil = particulateVeil(
      veilUv,
      vec2(1.08, -0.04),
      vec2(-0.86, 0.34),
      0.07,
      motion * 0.042 + 5.6,
      0.18
    );

    float readingZone = smoothstep(0.20, 0.53, length((uv - 0.5) * vec2(1.28, 1.0)));
    float poemQuiet = smoothstep(0.34, 0.47, uProgress) * (1.0 - smoothstep(0.81, 0.87, uProgress));
    float centerQuiet = mix(1.0, readingZone, poemQuiet * 0.96);
    float auroraPower = mix(0.64, 1.28, uEnergy) * mix(1.0, 0.72, uStillness);

    vec3 rose = mix(vec3(0.34, 0.055, 0.11), vec3(0.76, 0.22, 0.36), uWarmth);
    vec3 gold = mix(vec3(0.34, 0.20, 0.085), vec3(0.96, 0.61, 0.25), uWarmth);
    vec3 lavender = mix(vec3(0.18, 0.12, 0.28), vec3(0.55, 0.34, 0.77), uWarmth);

    vec3 aurora = rose * roseVeil * 1.86;
    aurora += gold * goldVeil * 1.72;
    aurora += lavender * lavenderVeil * 1.68;
    aurora *= auroraPower * centerQuiet;

    float nebula = smoothstep(0.32, 0.82, domainB) * (0.16 + uEnergy * 0.22);
    float halo = exp(-length(p * vec2(0.74, 1.0)) * 2.9) * mix(0.08, 0.20, uWarmth);
    vec3 nebulaColor = mix(vec3(0.08, 0.045, 0.11), vec3(0.25, 0.075, 0.12), uWarmth);

    float vignette = 1.0 - smoothstep(0.26, 0.93, length((uv - 0.5) * vec2(0.88, 1.0)));
    vec3 night = mix(vec3(0.008, 0.006, 0.012), vec3(0.026, 0.009, 0.017), uWarmth * 0.7);
    vec3 color = night + aurora + nebulaColor * nebula + vec3(0.32, 0.19, 0.13) * halo;
    color *= 0.60 + vignette * 0.58;
    color = 1.0 - exp(-color * 1.42);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const particleVertex = /* glsl */ `
  precision highp float;

  attribute vec2 position;
  attribute vec2 target;
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute float aColor;

  uniform float uTime;
  uniform float uProgress;
  uniform float uEnergy;
  uniform float uHeart;
  uniform float uClarity;
  uniform float uStillness;
  uniform float uDpr;
  uniform vec2 uResolution;
  uniform vec2 uPointer;

  varying float vAlpha;
  varying float vColor;
  varying float vTwinkle;

  void main() {
    float time = uTime * mix(1.0, 0.055, uStillness);
    vec2 scattered = position;
    float orbit = time * (0.012 + fract(aPhase * 8.31) * 0.014) + uProgress * 0.28;
    float c = cos(orbit);
    float s = sin(orbit);
    scattered = mat2(c, -s, s, c) * scattered;
    scattered += vec2(
      sin(time * 0.18 + aPhase * 15.0),
      cos(time * 0.14 + aPhase * 11.0)
    ) * (0.006 + uEnergy * 0.009) * (1.0 - uStillness);

    float aspectFix = min(uResolution.y / max(uResolution.x, 1.0), 1.0);
    float portrait = smoothstep(1.0, 1.45, uResolution.y / max(uResolution.x, 1.0));
    vec2 heartScale = mix(vec2(aspectFix, 1.0), vec2(1.05, 0.67), portrait);
    vec2 heart = target * heartScale;
    float heartBreath = 1.0 + sin(time * 0.82) * 0.018 * (1.0 - uStillness);
    heart *= heartBreath;

    vec2 pos = mix(scattered, heart, uHeart);
    pos += uPointer * 0.018 * (1.0 - uHeart) * (1.0 - uStillness);

    float centralDistance = length(pos * vec2(0.72, 1.0));
    float quietCenter = mix(1.0, smoothstep(0.17, 0.54, centralDistance), uClarity * (1.0 - uHeart));
    float heartGlow = mix(1.0, 1.72, uHeart);
    float twinkle = 0.68 + 0.32 * sin(time * (0.85 + fract(aPhase * 5.0)) + aPhase * 34.0);

    vAlpha = aAlpha * quietCenter * heartGlow * mix(0.54, 1.0, uEnergy);
    vColor = aColor;
    vTwinkle = twinkle;

    gl_PointSize = aSize * uDpr * mix(0.78, 1.34, uHeart) * mix(0.82, 1.08, twinkle);
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

const particleFragment = /* glsl */ `
  precision highp float;

  uniform float uWarmth;
  uniform float uHeart;
  varying float vAlpha;
  varying float vColor;
  varying float vTwinkle;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceToCenter = length(point);
    float core = 1.0 - smoothstep(0.025, 0.12, distanceToCenter);
    float glow = exp(-distanceToCenter * distanceToCenter * 13.5);
    float edge = 1.0 - smoothstep(0.18, 0.52, distanceToCenter);

    vec3 ivory = vec3(1.0, 0.89, 0.73);
    vec3 rose = vec3(0.95, 0.34, 0.48);
    vec3 lavender = vec3(0.63, 0.48, 0.88);
    vec3 color = mix(lavender, rose, smoothstep(0.18, 0.78, vColor));
    color = mix(color, ivory, 0.46 + uWarmth * 0.20 + uHeart * 0.18);
    float alpha = (glow * 0.58 + core * 0.92) * edge * vAlpha * vTwinkle;

    gl_FragColor = vec4(color * (1.0 + core * 0.72), alpha);
  }
`;

function smoothstep(min: number, max: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

function createParticleData(count: number) {
  const random = seededRandom(92741);
  const position = new Float32Array(count * 2);
  const target = new Float32Array(count * 2);
  const size = new Float32Array(count);
  const alpha = new Float32Array(count);
  const phase = new Float32Array(count);
  const color = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    position[index * 2] = (random() * 2 - 1) * 1.08;
    position[index * 2 + 1] = (random() * 2 - 1) * 1.04;

    const outlineParticle = index % 5 < 3;
    if (outlineParticle) {
      const angle = random() * Math.PI * 2;
      const heartX = 16 * Math.pow(Math.sin(angle), 3);
      const heartY =
        13 * Math.cos(angle) -
        5 * Math.cos(2 * angle) -
        2 * Math.cos(3 * angle) -
        Math.cos(4 * angle);
      const cloudJitter = (random() - 0.5) * 0.035;
      target[index * 2] = (heartX / 16) * 0.78 + cloudJitter;
      target[index * 2 + 1] = (heartY / 17) * 0.78 + cloudJitter * 0.65 + 0.08;
    } else {
      // The implicit curve fills the space behind the brighter outline.
      let heartX = 0;
      let heartY = 0;
      let insideHeart = false;
      while (!insideHeart) {
        heartX = random() * 2.4 - 1.2;
        heartY = random() * 2.35 - 1.15;
        const squared = heartX * heartX + heartY * heartY - 1;
        insideHeart =
          squared * squared * squared -
            heartX * heartX * heartY * heartY * heartY <=
          0;
      }
      target[index * 2] = heartX * 0.64;
      target[index * 2 + 1] = heartY * 0.66 + 0.04;
    }

    const bright = random() > 0.86;
    size[index] = bright
      ? 5.2 + random() * 4.6
      : 1.8 + random() * 3.1 + (outlineParticle ? 0.45 : 0);
    alpha[index] = bright
      ? 0.58 + random() * 0.38
      : 0.16 + random() * 0.42 + (outlineParticle ? 0.12 : 0);
    phase[index] = random();
    color[index] = random();
  }

  return { position, target, size, alpha, phase, color };
}

type Uniform = { value: number | Vec2 };
type Uniforms = Record<string, Uniform>;

export function CosmicBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = container.closest<HTMLElement>(".tribute-experience");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const lowPower =
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4 ||
      navigator.hardwareConcurrency <= 4;
    const particleCount = Math.round((mobile ? 620 : 1680) * (lowPower ? 0.72 : 1));

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        depth: false,
        dpr: Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6),
        powerPreference: "high-performance",
      });
    } catch {
      container.classList.add("cosmic-backdrop--fallback");
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.className = "cosmic-backdrop__canvas";
    container.appendChild(canvas);
    gl.clearColor(0.006, 0.004, 0.009, 1);

    const scene = new Transform();
    const sharedUniforms: Uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uEnergy: { value: 0.38 },
      uWarmth: { value: 0.12 },
      uStillness: { value: reducedMotion.matches ? 1 : 0 },
      uResolution: { value: new Vec2(1, 1) },
      uPointer: { value: new Vec2(0, 0) },
    };

    const atmosphereProgram = new Program(gl, {
      vertex: atmosphereVertex,
      fragment: atmosphereFragment,
      uniforms: sharedUniforms,
      depthTest: false,
      depthWrite: false,
      cullFace: false,
    });
    const atmosphere = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: atmosphereProgram,
      frustumCulled: false,
      renderOrder: 0,
    });
    atmosphere.setParent(scene);

    const particles = createParticleData(particleCount);
    const particleGeometry = new Geometry(gl, {
      position: { size: 2, data: particles.position },
      target: { size: 2, data: particles.target },
      aSize: { size: 1, data: particles.size },
      aAlpha: { size: 1, data: particles.alpha },
      aPhase: { size: 1, data: particles.phase },
      aColor: { size: 1, data: particles.color },
    });
    const particleUniforms: Uniforms = {
      ...sharedUniforms,
      uHeart: { value: 0 },
      uClarity: { value: 0 },
      uDpr: { value: renderer.dpr },
    };
    const particleProgram = new Program(gl, {
      vertex: particleVertex,
      fragment: particleFragment,
      uniforms: particleUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: false,
    });
    particleProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
    const particleMesh = new Mesh(gl, {
      geometry: particleGeometry,
      program: particleProgram,
      mode: gl.POINTS,
      frustumCulled: false,
      renderOrder: 1,
    });
    particleMesh.setParent(scene);

    const pointerTarget = new Vec2(0, 0);
    const pointerCurrent = sharedUniforms.uPointer.value as Vec2;
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.set(
        (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2,
        (0.5 - event.clientY / Math.max(window.innerHeight, 1)) * 2,
      );
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height));
      (sharedUniforms.uResolution.value as Vec2).set(
        Math.max(1, width),
        Math.max(1, height),
      );
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let frame = 0;
    let lastTime = performance.now();
    const render = (time: number) => {
      const delta = Math.min(40, time - lastTime);
      lastTime = time;
      const progress = Number(root?.style.getPropertyValue("--story-progress")) || 0;
      const universe = smoothstep(0.04, 0.22, progress);
      const organization = smoothstep(0.25, 0.42, progress);
      const convergenceIn = smoothstep(0.845, 0.92, progress);
      const convergenceOut = smoothstep(0.945, 0.985, progress);
      const finalStillness = smoothstep(0.945, 1.0, progress);

      const energy =
        0.38 + universe * 0.58 - organization * 0.16 + convergenceIn * 0.48 - convergenceOut * 0.62;
      sharedUniforms.uTime.value = (sharedUniforms.uTime.value as number) + delta * 0.001;
      sharedUniforms.uProgress.value = progress;
      sharedUniforms.uEnergy.value = Math.max(0.16, Math.min(1.22, energy));
      sharedUniforms.uWarmth.value = smoothstep(0.12, 0.94, progress);
      sharedUniforms.uStillness.value = reducedMotion.matches
        ? 1
        : Math.max(0, Math.min(1, finalStillness));
      particleUniforms.uHeart.value = Math.max(0, convergenceIn - convergenceOut * 0.88);
      particleUniforms.uClarity.value = smoothstep(0.34, 0.52, progress) * (1 - convergenceIn);

      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.035;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.035;
      renderer.render({ scene, sort: false, frustumCull: false });

      if (!reducedMotion.matches) frame = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else if (!reducedMotion.matches) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      atmosphereProgram.remove();
      particleProgram.remove();
      atmosphere.geometry.remove();
      particleGeometry.remove();
      canvas.remove();
    };
  }, []);

  return <div className="cosmic-backdrop" ref={containerRef} aria-hidden="true" />;
}
