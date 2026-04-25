"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial } from "three";
import { useMemo, useRef } from "react";

function seededNoise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function FiberPoints() {
  const pointsRef = useRef<Points | null>(null);
  const matRef = useRef<ShaderMaterial | null>(null);

  const { positions, speeds } = useMemo(() => {
    const count = 1600;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const n1 = seededNoise(i * 3 + 1);
      const n2 = seededNoise(i * 3 + 2);
      const n3 = seededNoise(i * 3 + 3);
      const n4 = seededNoise(i * 3 + 4);
      pos[i * 3 + 0] = (n1 - 0.5) * 18;
      pos[i * 3 + 1] = (n2 - 0.5) * 10;
      pos[i * 3 + 2] = (n3 - 0.5) * 14;
      spd[i] = 0.4 + n4 * 1.2;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame((state, delta) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const pos = (geom.getAttribute("position") as BufferAttribute).array as Float32Array;
    for (let i = 0; i < speeds.length; i++) {
      const idx = i * 3;
      pos[idx + 2] += delta * speeds[i] * 1.8;
      if (pos[idx + 2] > 8) pos[idx + 2] = -8;
    }
    (geom.getAttribute("position") as BufferAttribute).needsUpdate = true;
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points geometry={geometry} ref={pointsRef}>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uGold: { value: new Color("#D4AF37") },
          uBlue: { value: new Color("#33B8FF") },
        }}
        vertexShader={`
          uniform float uTime;
          varying float vFade;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            float pulse = 0.65 + 0.35 * sin(uTime * 1.2 + position.x * 0.6);
            vFade = pulse;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = 2.0 + 2.0 * pulse;
          }
        `}
        fragmentShader={`
          uniform vec3 uGold;
          uniform vec3 uBlue;
          varying float vFade;
          void main() {
            vec2 uv = gl_PointCoord.xy - 0.5;
            float d = length(uv);
            float a = smoothstep(0.5, 0.0, d);
            vec3 c = mix(uBlue, uGold, vFade);
            gl_FragColor = vec4(c, a * 0.55);
          }
        `}
      />
    </points>
  );
}

export function FiberNetworkBackground() {
  return (
    <div className="fiber-bg" aria-hidden>
      <Canvas
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 9], fov: 55 }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.2} />
        <FiberPoints />
      </Canvas>
      <div className="fiber-bg-overlay" />
    </div>
  );
}

