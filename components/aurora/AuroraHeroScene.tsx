"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AuroraHeroSceneFallback } from "@/components/aurora/AuroraHeroSceneFallback";

/**
 * AuroraHeroScene — the Statstrive "Aurora AI Prediction Field".
 *
 * A cinematic three.js background layer for the homepage hero: a luminous
 * glass intelligence core, slow gyroscope rings with orbiting module nodes,
 * a faint neural lattice, soft aurora ribbons and a sparse particle field.
 * Light-theme tuned, slow by design, pointer parallax only on fine pointers.
 *
 * Behaviour contract:
 * - renders inside its container (no document-level takeover)
 * - sizes from the container, observes container resizes
 * - pauses when the tab is hidden or the hero is scrolled off-screen
 * - honours prefers-reduced-motion and WebGL failure via a static fallback
 * - disposes renderer, geometries, materials and textures on unmount
 */

const INDIGO = 0x4f46e5;
const INDIGO_BRIGHT = 0x6366f1;
const CYAN = 0x06b6d4;
const VIOLET = 0x8b5cf6;

function makeRadialTexture(rgb: string): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, `rgba(${rgb}, 0.55)`);
  grad.addColorStop(0.45, `rgba(${rgb}, 0.18)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function makeRibbonTexture(rgb: string): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, `rgba(${rgb}, 0)`);
  grad.addColorStop(0.5, `rgba(${rgb}, 0.32)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);
  return new THREE.CanvasTexture(canvas);
}

export function AuroraHeroScene({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFallback(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      if (!renderer.getContext()) throw new Error("no webgl context");
    } catch {
      setFallback(true);
      return;
    }

    const isMobile =
      window.matchMedia("(pointer: coarse)").matches || container.clientWidth < 768;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      (container.clientWidth || 1) / (container.clientHeight || 1),
      0.1,
      100,
    );
    camera.position.set(0, 0.4, 15);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(d: T): T => {
      disposables.push(d);
      return d;
    };

    // ── field group (offset right on desktop so hero copy stays calm) ──
    const field = new THREE.Group();
    field.position.x = isMobile ? 0 : 2.8;
    field.position.y = 0.2;
    scene.add(field);

    // core
    const coreGeo = track(new THREE.SphereGeometry(2.05, 48, 48));
    const coreMat = track(
      new THREE.MeshPhysicalMaterial({
        color: INDIGO,
        roughness: 0.32,
        metalness: 0.05,
        emissive: new THREE.Color(0x3730a3),
        emissiveIntensity: 0.32,
        transparent: true,
        opacity: 0.94,
      }),
    );
    field.add(new THREE.Mesh(coreGeo, coreMat));

    // glass shell
    const shellGeo = track(new THREE.SphereGeometry(2.42, 48, 48));
    const shellMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.08,
        metalness: 0,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      }),
    );
    field.add(new THREE.Mesh(shellGeo, shellMat));

    // core glow sprite
    const glowTex = makeRadialTexture("99, 102, 241");
    let glowSprite: THREE.Sprite | null = null;
    if (glowTex) {
      track(glowTex);
      const glowMat = track(
        new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }),
      );
      glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.setScalar(9.5);
      field.add(glowSprite);
    }

    // gyroscope rings + orbiting module nodes
    const ringDefs = [
      { radius: 3.35, color: CYAN, tilt: [1.05, 0, 0.35] as const, speed: 0.085, nodes: 4 },
      { radius: 4.25, color: INDIGO_BRIGHT, tilt: [1.4, 0.35, -0.2] as const, speed: -0.06, nodes: 5 },
      { radius: 5.15, color: VIOLET, tilt: [0.72, -0.45, 0.18] as const, speed: 0.04, nodes: 3 },
    ];
    const rings: Array<{ group: THREE.Group; speed: number }> = [];
    for (const def of ringDefs) {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
      const torusGeo = track(new THREE.TorusGeometry(def.radius, 0.012, 8, 180));
      const torusMat = track(
        new THREE.MeshBasicMaterial({
          color: def.color,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        }),
      );
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      ringGroup.add(torus);

      const nodeGeo = track(new THREE.SphereGeometry(0.07, 14, 14));
      const nodeMat = track(new THREE.MeshBasicMaterial({ color: def.color }));
      for (let i = 0; i < def.nodes; i += 1) {
        const angle = (i / def.nodes) * Math.PI * 2;
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(Math.cos(angle) * def.radius, 0, Math.sin(angle) * def.radius);
        ringGroup.add(node);
      }
      field.add(ringGroup);
      rings.push({ group: ringGroup, speed: def.speed });
    }

    // faint neural lattice
    const latticePoints: THREE.Vector3[] = [];
    for (let i = 0; i < 34; i += 1) {
      const v = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      )
        .normalize()
        .multiplyScalar(5.8 + Math.random() * 1.6);
      latticePoints.push(v);
    }
    const latticeVerts: number[] = [];
    for (const p of latticePoints) {
      const nearest = [...latticePoints]
        .filter((q) => q !== p)
        .sort((a, b) => a.distanceTo(p) - b.distanceTo(p))
        .slice(0, 2);
      for (const q of nearest) latticeVerts.push(p.x, p.y, p.z, q.x, q.y, q.z);
    }
    const latticeGeo = track(new THREE.BufferGeometry());
    latticeGeo.setAttribute("position", new THREE.Float32BufferAttribute(latticeVerts, 3));
    const latticeMat = track(
      new THREE.LineBasicMaterial({
        color: INDIGO_BRIGHT,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    );
    const lattice = new THREE.LineSegments(latticeGeo, latticeMat);
    field.add(lattice);

    // aurora ribbons drifting behind the core
    const ribbonDefs = [
      { rgb: "6, 182, 212", y: 2.2, z: -5, rot: -0.18 },
      { rgb: "139, 92, 246", y: -1.6, z: -6.5, rot: 0.14 },
      { rgb: "99, 102, 241", y: 0.4, z: -8, rot: -0.05 },
    ];
    const ribbons: THREE.Mesh[] = [];
    for (const def of ribbonDefs) {
      const tex = makeRibbonTexture(def.rgb);
      if (!tex) continue;
      track(tex);
      const geo = track(new THREE.PlaneGeometry(16, 4.6));
      const mat = track(
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
      );
      const plane = new THREE.Mesh(geo, mat);
      plane.position.set(0, def.y, def.z);
      plane.rotation.z = def.rot;
      field.add(plane);
      ribbons.push(plane);
    }

    // sparse particle field
    const particleCount = isMobile ? 80 : 200;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 2] = -7 + Math.random() * 9;
    }
    const particleGeo = track(new THREE.BufferGeometry());
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = track(
      new THREE.PointsMaterial({
        color: CYAN,
        size: 0.055,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // lighting (bright, icy — light-theme compatible)
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const keyLight = new THREE.DirectionalLight(0xeef2ff, 1.6);
    keyLight.position.set(5, 7, 9);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(VIOLET, 14, 40);
    rimLight.position.set(-4, -3, 5);
    scene.add(rimLight);

    // pointer parallax (fine pointers only)
    const pointerTarget = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.x = event.clientX / window.innerWidth - 0.5;
      pointerTarget.y = event.clientY / window.innerHeight - 0.5;
    };
    if (!isMobile) window.addEventListener("pointermove", onPointerMove, { passive: true });

    // pause control: tab hidden or hero off-screen
    let rafId = 0;
    let hidden = document.hidden;
    let onScreen = true;
    let stopped = false;
    const clock = new THREE.Clock();
    const lookTarget = new THREE.Vector3(isMobile ? 0 : 2.2, 0.2, 0);

    const tick = () => {
      if (stopped || hidden || !onScreen) return;
      const t = clock.getElapsedTime();

      field.rotation.y = t * 0.035;
      for (const ring of rings) ring.group.rotation.y = t * ring.speed;
      lattice.rotation.y = -t * 0.012;
      particles.rotation.y = t * 0.006;

      const pulse = 1 + Math.sin(t * 0.45) * 0.015;
      field.children[0]?.scale.setScalar(pulse);
      if (glowSprite) glowSprite.material.opacity = 0.8 + Math.sin(t * 0.35) * 0.12;
      ribbons.forEach((ribbon, i) => {
        ribbon.position.x = Math.sin(t * 0.05 + i * 2.1) * 1.4;
      });

      camera.position.x += (pointerTarget.x * 0.9 - camera.position.x) * 0.025;
      camera.position.y += (0.4 - pointerTarget.y * 0.7 - camera.position.y) * 0.025;
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    const resume = () => {
      if (stopped || hidden || !onScreen) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      hidden = document.hidden;
      resume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const intersection = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        resume();
      },
      { threshold: 0.02 },
    );
    intersection.observe(container);

    const resize = new ResizeObserver(() => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resize.observe(container);

    rafId = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
      if (!isMobile) window.removeEventListener("pointermove", onPointerMove);
      intersection.disconnect();
      resize.disconnect();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none relative overflow-hidden ${className}`}
    >
      {fallback && <AuroraHeroSceneFallback />}
    </div>
  );
}
