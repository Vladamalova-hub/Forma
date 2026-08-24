import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { FigureId, ZoneId } from "../data/program";
import { ZONE_META } from "../data/program";

/* ------------------------------------------------------------------ */
/* pose system                                                         */
/* ------------------------------------------------------------------ */

export interface Joints {
  hipL: number; kneeL: number; hipR: number; kneeR: number;
  shL: number; elL: number; shR: number; elR: number;
  shLz: number; shRz: number;
  torso: number; twist: number; head: number; belly: number;
}

export interface PoseData {
  j: Joints;
  pos: [number, number, number];
  rot: [number, number, number];
}

export type PoseFn = (t: number) => PoseData;

const J0: Joints = {
  hipL: 0, kneeL: 0, hipR: 0, kneeR: 0,
  shL: 0, elL: 0, shR: 0, elR: 0, shLz: 0, shRz: 0,
  torso: 0, twist: 0, head: 0, belly: 1,
};

const P = (j: Partial<Joints>, pos: [number, number, number] = [0, 0.94, 0], rot: [number, number, number] = [0, 0, 0]): PoseData => ({
  j: { ...J0, ...j },
  pos,
  rot,
});

/** 0..1..0 oscillator */
const osc = (t: number, speed = 2.4) => (Math.sin(t * speed) + 1) / 2;
const wave = (t: number, speed = 2.4) => Math.sin(t * speed);

const SUPINE: [number, number, number] = [-Math.PI / 2, 0, 0]; // лёжа на спине
const PRONE: [number, number, number] = [Math.PI / 2, Math.PI, 0]; // лёжа лицом вниз
const SIDE: [number, number, number] = [-Math.PI / 2, Math.PI / 2, 0]; // лёжа на боку

export const FIGURES: Record<FigureId, PoseFn> = {
  squat: (t) => {
    const s = osc(t);
    return P(
      {
        hipL: -(1.05 + 0.85 * s), hipR: -(1.05 + 0.85 * s),
        kneeL: 1.15 + 0.95 * s, kneeR: 1.15 + 0.95 * s,
        torso: 0.3 + 0.2 * s,
        shL: -1.5, shR: -1.5, elL: -0.25, elR: -0.25,
      },
      [0, 0.94 - 0.36 * s, 0]
    );
  },
  bridge: (t) => {
    const s = osc(t, 2.1);
    return P(
      {
        hipL: -(1.7 + 0.4 * s), hipR: -(1.7 + 0.4 * s),
        kneeL: 2.2 - 0.25 * s, kneeR: 2.2 - 0.25 * s,
        shL: 0.15, shR: 0.15, shLz: -0.18, shRz: 0.18,
      },
      [0, 0.17 + 0.13 * s, 0],
      SUPINE
    );
  },
  donkey: (t) => {
    const s = osc(t, 2.2);
    return P(
      {
        torso: 1.3, head: -1.05,
        hipL: 0.12, kneeL: 1.5,
        hipR: 0.55 + 1.35 * s, kneeR: 1.5 - 0.35 * s,
        shL: -0.1, shR: -0.1, elL: -0.15, elR: -0.15,
      },
      [0, 0.46, 0]
    );
  },
  sideleg: (t) => {
    const s = osc(t, 2.2);
    return P(
      {
        hipL: 0.08, kneeL: 0.45,
        hipR: -(0.2 + 0.7 * s), kneeR: 0.12,
        shL: -0.3, shR: 0.35,
      },
      [0, 0.17, 0],
      SIDE
    );
  },
  pushup: (t) => {
    const s = osc(t, 2.0);
    return P(
      {
        shL: 1.42 + 0.22 * s, shR: 1.42 + 0.22 * s,
        elL: -(0.2 + 1.35 * s), elR: -(0.2 + 1.35 * s),
        hipL: 0.05, hipR: 0.05, head: -0.4,
      },
      [0, 0.36 - 0.14 * s, 0],
      PRONE
    );
  },
  fly: (t) => {
    const s = osc(t, 2.0);
    return P(
      {
        hipL: -1.1, hipR: -1.1, kneeL: 1.75, kneeR: 1.75,
        shL: -1.57, shR: -1.57, elL: -0.12, elR: -0.12,
        shLz: -(0.15 + 0.85 * s), shRz: 0.15 + 0.85 * s,
      },
      [0, 0.17, 0],
      SUPINE
    );
  },
  press: (t) => {
    const s = osc(t, 2.2);
    return P(
      {
        hipL: -0.06, hipR: -0.06, kneeL: 0.12, kneeR: 0.12,
        shL: -(0.55 + 2.15 * s), shR: -(0.55 + 2.15 * s),
        elL: -(2.05 - 1.85 * s), elR: -(2.05 - 1.85 * s),
        shLz: -(0.45 - 0.3 * s), shRz: 0.45 - 0.3 * s,
        torso: 0.05,
      },
      [0, 0.94, 0]
    );
  },
  planktap: (t) => {
    const ph = osc(t, 2.2);
    return P(
      {
        shL: 1.45, elL: -0.15,
        shR: 1.45 + 1.15 * ph, elR: -(0.15 + 2.0 * ph),
        hipL: 0.02, hipR: 0.02, kneeL: 0.05, kneeR: 0.05, head: -0.35,
      },
      [0, 0.3, 0],
      PRONE
    );
  },
  vacuum: (t) => {
    const s = osc(t, 1.5);
    return P(
      {
        belly: 1 - 0.42 * s,
        torso: 0.22 + 0.08 * s,
        hipL: -0.04, hipR: -0.04, kneeL: 0.1, kneeR: 0.1,
        shL: -0.35, shR: -0.35, elL: -2.0, elR: -2.0,
        shLz: -0.55, shRz: 0.55,
      },
      [0, 0.94, 0]
    );
  },
  sideplank: (t) => {
    const s = osc(t, 2.0);
    return P(
      {
        shL: 1.57, elL: -0.25, shR: -1.6,
        hipL: 0.02, hipR: -0.06, kneeL: 0.05, kneeR: 0.02,
      },
      [0, 0.3 + 0.05 * s, 0],
      SIDE
    );
  },
  crunch: (t) => {
    const s = osc(t, 2.2);
    return P(
      {
        torso: 0.15 + 0.75 * s, head: 0.35,
        shL: -2.55, shR: -2.55, elL: -1.7, elR: -1.7,
        hipL: -1.15, hipR: -1.15, kneeL: 1.8, kneeR: 1.8,
      },
      [0, 0.17, 0],
      SUPINE
    );
  },
  twist: (t) => {
    const w = wave(t, 2.2);
    return P(
      {
        torso: -0.45, twist: w * 0.75, head: 0.1,
        shL: -1.25, shR: -1.25, elL: -0.7, elR: -0.7,
        shLz: -0.15, shRz: 0.15,
        hipL: -1.75, hipR: -1.75, kneeL: 1.15, kneeR: 1.15,
      },
      [0, 0.18, 0]
    );
  },
};

export const RELAXED: PoseFn = (t) =>
  P({
    shLz: -0.1, shRz: 0.1,
    elL: -0.3, elR: -0.3,
    kneeL: 0.06, kneeR: 0.06,
    head: 0.04 * wave(t, 0.8),
    torso: 0.02 * wave(t, 0.8),
  });

/* ------------------------------------------------------------------ */
/* rig                                                                 */
/* ------------------------------------------------------------------ */

export interface BodyScale {
  chest: number;
  waist: number;
  hips: number;
  thigh: number;
  arm: number;
}

export const DEFAULT_BODY: BodyScale = { chest: 1, waist: 1, hips: 1, thigh: 1, arm: 1 };

const clampS = (v: number, lo = 0.62, hi = 1.5) => Math.min(hi, Math.max(lo, v));

function Mat({ color, ghost, rough = 0.55, emissive }: { color: string; ghost?: boolean; rough?: number; emissive?: string }) {
  if (ghost) {
    return <meshStandardMaterial color="#C7A6F0" transparent opacity={0.22} roughness={0.9} depthWrite={false} />;
  }
  return <meshStandardMaterial color={color} roughness={rough} metalness={0.05} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 0.35 : 0} />;
}

function Glow({ color, args, position, scale }: { color: string; args: [number, number]; position: [number, number, number]; scale?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const s = 1 + 0.16 * Math.sin(clock.getElapsedTime() * 3.2);
    if (ref.current) ref.current.scale.setScalar(s);
  });
  return (
    <group ref={ref} position={position}>
      <mesh scale={scale}>
        <sphereGeometry args={[args[0], 20, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh scale={scale}>
        <sphereGeometry args={[args[1], 20, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.38} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Rig({
  poseFn,
  body = DEFAULT_BODY,
  glows = [],
  ghost = false,
}: {
  poseFn: PoseFn;
  body?: BodyScale;
  glows?: ZoneId[];
  ghost?: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const shL = useRef<THREE.Group>(null);
  const shR = useRef<THREE.Group>(null);
  const elL = useRef<THREE.Group>(null);
  const elR = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const bellyRef = useRef<THREE.Mesh>(null);

  const skin = "#E9B68F";
  const top = "#FF6D5A";
  const leggings = "#3C2B47";
  const hair = "#4A2E28";
  const shoe = "#F2E8DC";

  const b = useMemo(
    () => ({
      chest: clampS(body.chest),
      waist: clampS(body.waist),
      hips: clampS(body.hips),
      thigh: clampS(body.thigh),
      arm: clampS(body.arm),
    }),
    [body]
  );

  useFrame(({ clock }) => {
    const p = poseFn(clock.getElapsedTime());
    if (root.current) {
      root.current.position.set(p.pos[0], p.pos[1], p.pos[2]);
      root.current.rotation.order = "YXZ";
      root.current.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
    }
    const set = (r: React.RefObject<THREE.Group>, x: number, z = 0) => {
      if (r.current) {
        r.current.rotation.x = x;
        if (z) r.current.rotation.z = z;
      }
    };
    set(hipL, p.j.hipL);
    set(hipR, p.j.hipR);
    set(kneeL, p.j.kneeL);
    set(kneeR, p.j.kneeR);
    set(shL, p.j.shL, p.j.shLz);
    set(shR, p.j.shR, p.j.shRz);
    set(elL, p.j.elL);
    set(elR, p.j.elR);
    if (torso.current) {
      torso.current.rotation.x = p.j.torso;
      torso.current.rotation.y = p.j.twist;
    }
    if (head.current) head.current.rotation.x = p.j.head;
    if (bellyRef.current) {
      bellyRef.current.scale.x = p.j.belly;
      bellyRef.current.scale.z = 0.6 + 0.4 * p.j.belly;
    }
  });

  const glowSet = new Set(glows);

  return (
    <group ref={root}>
      {/* pelvis */}
      <mesh position={[0, 0.02, 0]} scale={[1.12 * b.hips, 0.82, 0.98]}>
        <sphereGeometry args={[0.16, 24, 18]} />
        <Mat color={leggings} ghost={ghost} rough={0.7} />
      </mesh>
      {/* glute shape */}
      <mesh position={[-0.078, -0.02, -0.095]} scale={[b.hips, 0.92, 0.92]}>
        <sphereGeometry args={[0.1, 20, 16]} />
        <Mat color={leggings} ghost={ghost} rough={0.7} />
      </mesh>
      <mesh position={[0.078, -0.02, -0.095]} scale={[b.hips, 0.92, 0.92]}>
        <sphereGeometry args={[0.1, 20, 16]} />
        <Mat color={leggings} ghost={ghost} rough={0.7} />
      </mesh>
      {glowSet.has("glutes") && (
        <>
          <Glow color={ZONE_META.glutes.color} args={[0.15, 0.09]} position={[-0.08, -0.01, -0.12]} />
          <Glow color={ZONE_META.glutes.color} args={[0.15, 0.09]} position={[0.08, -0.01, -0.12]} />
        </>
      )}
      {glowSet.has("belly") && <Glow color={ZONE_META.belly.color} args={[0.17, 0.1]} position={[0, -0.02, 0.13]} />}

      {/* legs */}
      {([
        [-0.1, hipL, kneeL, glowSet.has("legs"), -1],
        [0.1, hipR, kneeR, glowSet.has("legs"), 1],
      ] as [number, React.RefObject<THREE.Group>, React.RefObject<THREE.Group>, boolean, number][]).map(
        ([x, hRef, kRef, legGlow, side]) => (
          <group key={side} position={[x, 0, 0]} ref={hRef}>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.075 * b.thigh, 0.26, 6, 14]} />
              <Mat color={leggings} ghost={ghost} rough={0.7} />
            </mesh>
            {legGlow && <Glow color={ZONE_META.legs.color} args={[0.13, 0.08]} position={[0, -0.2, 0]} />}
            <group position={[0, -0.42, 0]} ref={kRef}>
              <mesh position={[0, -0.18, 0]}>
                <capsuleGeometry args={[0.055 * b.thigh, 0.24, 6, 14]} />
                <Mat color={leggings} ghost={ghost} rough={0.7} />
              </mesh>
              <mesh position={[0, -0.37, 0.06]}>
                <boxGeometry args={[0.09, 0.07, 0.21]} />
                <Mat color={shoe} ghost={ghost} rough={0.4} />
              </mesh>
            </group>
          </group>
        )
      )}

      {/* torso */}
      <group position={[0, 0.12, 0]} ref={torso}>
        {/* waist (skin) */}
        <mesh position={[0, 0.1, 0]} ref={bellyRef} scale={[b.waist, 1, b.waist]}>
          <capsuleGeometry args={[0.125, 0.14, 6, 16]} />
          <Mat color={skin} ghost={ghost} />
        </mesh>
        {glowSet.has("waist") && (
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.175 * b.waist, 0.028, 10, 32]} />
            <meshBasicMaterial color={ZONE_META.waist.color} transparent opacity={0.5} depthWrite={false} />
          </mesh>
        )}
        {/* chest (top) */}
        <mesh position={[0, 0.34, 0]} scale={[1.12 * b.chest, 1.05, 0.95]}>
          <sphereGeometry args={[0.155, 24, 18]} />
          <Mat color={top} ghost={ghost} rough={0.6} />
        </mesh>
        {/* bust */}
        <mesh position={[-0.068 * b.chest, 0.31, 0.125]}>
          <sphereGeometry args={[0.056 * b.chest, 18, 14]} />
          <Mat color={top} ghost={ghost} rough={0.6} />
        </mesh>
        <mesh position={[0.068 * b.chest, 0.31, 0.125]}>
          <sphereGeometry args={[0.056 * b.chest, 18, 14]} />
          <Mat color={top} ghost={ghost} rough={0.6} />
        </mesh>
        {glowSet.has("chest") && (
          <>
            <Glow color={ZONE_META.chest.color} args={[0.13, 0.08]} position={[-0.07, 0.32, 0.14]} />
            <Glow color={ZONE_META.chest.color} args={[0.13, 0.08]} position={[0.07, 0.32, 0.14]} />
          </>
        )}
        {/* neck */}
        <mesh position={[0, 0.545, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.1, 12]} />
          <Mat color={skin} ghost={ghost} />
        </mesh>

        {/* head */}
        <group position={[0, 0.66, 0]} ref={head}>
          <mesh>
            <sphereGeometry args={[0.105, 24, 18]} />
            <Mat color={skin} ghost={ghost} />
          </mesh>
          <mesh position={[0, 0.035, -0.02]} scale={[1.04, 0.92, 1.04]}>
            <sphereGeometry args={[0.108, 24, 18]} />
            <Mat color={hair} ghost={ghost} rough={0.8} />
          </mesh>
          {/* ponytail */}
          <mesh position={[0, -0.02, -0.13]} rotation={[0.55, 0, 0]}>
            <capsuleGeometry args={[0.036, 0.16, 6, 10]} />
            <Mat color={hair} ghost={ghost} rough={0.8} />
          </mesh>
        </group>

        {/* arms */}
        {([
          [-0.215, shL, elL, -1, glowSet.has("arms")],
          [0.215, shR, elR, 1, glowSet.has("arms")],
        ] as [number, React.RefObject<THREE.Group>, React.RefObject<THREE.Group>, number, boolean][]).map(
          ([x, sRef, eRef, side, armGlow]) => (
            <group key={side} position={[x, 0.5, 0]} ref={sRef}>
              <mesh position={[0, -0.14, 0]}>
                <capsuleGeometry args={[0.05 * b.arm, 0.2, 6, 12]} />
                <Mat color={top} ghost={ghost} rough={0.6} />
              </mesh>
              <group position={[0, -0.27, 0]} ref={eRef}>
                <mesh position={[0, -0.12, 0]}>
                  <capsuleGeometry args={[0.043 * b.arm, 0.18, 6, 12]} />
                  <Mat color={skin} ghost={ghost} />
                </mesh>
                {armGlow && <Glow color={ZONE_META.arms.color} args={[0.11, 0.065]} position={[0, -0.12, 0]} />}
                <mesh position={[0, -0.25, 0]}>
                  <sphereGeometry args={[0.048 * b.arm, 14, 10]} />
                  <Mat color={skin} ghost={ghost} />
                </mesh>
              </group>
            </group>
          )
        )}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* scenes                                                              */
/* ------------------------------------------------------------------ */

function Floor({ radius = 1.15 }: { radius?: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <circleGeometry args={[radius, 48]} />
        <meshStandardMaterial color="#241A2B" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <ringGeometry args={[radius - 0.03, radius, 48]} />
        <meshBasicMaterial color="#FF6D5A" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 2.5]} intensity={1.25} />
      <pointLight position={[-3, 2.5, -2]} intensity={22} color="#FF6D5A" />
      <pointLight position={[3, 1.5, -3]} intensity={14} color="#7FD8B0" />
    </>
  );
}

export function ExerciseScene({
  figure,
  glows,
  body,
  className = "",
  spin = false,
}: {
  figure: FigureId;
  glows: ZoneId[];
  body?: BodyScale;
  className?: string;
  spin?: boolean;
}) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [1.7, 1.4, 3.0], fov: 36 }} gl={{ antialias: true, alpha: true }}>
        <Lights />
        <group position={[0, -0.82, 0]}>
          <Rig poseFn={FIGURES[figure]} glows={glows} body={body} />
          <Floor />
          <ContactShadows opacity={0.55} scale={4} blur={2.5} far={2.2} resolution={256} color="#000000" />
        </group>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={spin}
          autoRotateSpeed={1.4}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI / 1.85}
        />
      </Canvas>
    </div>
  );
}

export function ProfileScene({
  body,
  ghost,
  className = "",
}: {
  body: BodyScale;
  ghost?: BodyScale | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0.4, 0.35, 2.6], fov: 34 }} gl={{ antialias: true, alpha: true }}>
        <Lights />
        <group position={[0, -0.85, 0]}>
          {ghost && <Rig poseFn={RELAXED} body={ghost} ghost />}
          <Rig poseFn={RELAXED} body={body} />
          <Floor radius={0.95} />
          <ContactShadows opacity={0.5} scale={3.4} blur={2.4} far={2} resolution={256} color="#000000" />
        </group>
        <OrbitControls
          enablePan={false}
          minDistance={1.6}
          maxDistance={4.5}
          autoRotate
          autoRotateSpeed={1.6}
          minPolarAngle={0.45}
          maxPolarAngle={Math.PI / 1.9}
          target={[0, -0.05, 0]}
        />
      </Canvas>
    </div>
  );
}
