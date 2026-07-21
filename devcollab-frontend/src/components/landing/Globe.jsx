import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { feature } from 'topojson-client';

const Globe = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationFrameId;
    const canvas = canvasRef.current;

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.z = 290; // Camera distance for split-view layout

    function setSize() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    setSize();
    const resizeObserver = new ResizeObserver(() => {
      setSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // ---- Globe radius ----
    const GLOBE_R = 100;

    // Shared lat/lon <-> vector convention
    function latLonToVec3(lat, lon, r) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    function vec3ToLatLon(v) {
      const r = v.length();
      const lat = THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(v.y / r, -1, 1)));
      const theta = Math.atan2(v.z, -v.x);
      let lon = THREE.MathUtils.radToDeg(theta) - 180;
      if (lon < -180) lon += 360;
      if (lon > 180) lon -= 360;
      return { lat, lon };
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // ============================================================
    // LAYER 1 — Ocean sphere (frosted white glass base for light UI)
    // ============================================================
    const coreGeo = new THREE.SphereGeometry(GLOBE_R - 0.5, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Solid white core to block back-facing dots
      depthWrite: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    const oceanGeo = new THREE.SphereGeometry(GLOBE_R, 64, 64);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0xe0e7ff, // Soft indigo-tinted ocean
      transparent: true,
      opacity: 0.15,
      shininess: 90, // Nice glossy reflections
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    globeGroup.add(oceanMesh);

    const gridGeo = new THREE.SphereGeometry(GLOBE_R + 0.3, 24, 16);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8, // Subtle indigo grid lines
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // ============================================================
    // LAYER 2 — Real-geography land dot cloud
    // ============================================================
    const CITY_COORDS = [
      [40.7, -74], [51.5, -0.1], [35.6, 139.6], [28.6, 77.2],
      [-33.8, 151], [55.7, 37.6], [-23.5, -46.6], [1.3, 103.8],
      [48.8, 2.3], [-1.2, 36.8], [19.4, -99.1], [37.7, -122.4],
      [30.0, 31.2], [22.3, 114.1], [6.5, 3.3], [34.0, -6.8],
      [43.6, -79.3], [39.9, 116.4], [-34.6, -58.4], [60.1, 24.9],
      [25.2, 55.3], [-26.2, 28.0], [59.9, 10.7], [21.3, -157.8], [9.9, 78.1],
      [-31.9, 115.8], [-41.2, 174.7], [41.9, 12.5], [-18.8, 47.5], [-12.0, -77.0],
      [23.1, -82.4],
    ];

    let dots = null;
    let dotMat = null;

    async function buildLandDots() {
      try {
        const topoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json";
        const res = await fetch(topoUrl);
        if (!res.ok) throw new Error("Network response not ok");
        const topology = await res.json();
        const landGeo = feature(topology, topology.objects.land);

        const polygons = [];
        const feats = landGeo.type === "FeatureCollection" ? landGeo.features : [landGeo];
        feats.forEach((f) => {
          const g = f && f.geometry;
          if (!g) return;
          if (g.type === "Polygon") polygons.push(g.coordinates);
          else if (g.type === "MultiPolygon") g.coordinates.forEach((p) => polygons.push(p));
        });

        const W = 2048, H = 1024;
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = W; maskCanvas.height = H;
        const ctx = maskCanvas.getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        polygons.forEach((rings) => {
          const path = new Path2D();
          rings.forEach((ring) => {
            let prevLon = null;
            ring.forEach(([lon, lat], i) => {
              const x = (lon + 180) / 360 * W;
              const y = (90 - lat) / 180 * H;
              if (i === 0) {
                path.moveTo(x, y);
              } else {
                if (prevLon !== null && Math.abs(lon - prevLon) > 180) {
                  path.moveTo(x, y);
                } else {
                  path.lineTo(x, y);
                }
              }
              prevLon = lon;
            });
          });
          ctx.fill(path);
        });
        const maskData = ctx.getImageData(0, 0, W, H).data;

        function isLand(lat, lon) {
          if (lat < -75) return true;
          let px = Math.floor((lon + 180) / 360 * W);
          let py = Math.floor((90 - lat) / 180 * H);
          px = Math.max(0, Math.min(W - 1, px));
          py = Math.max(0, Math.min(H - 1, py));
          return maskData[(py * W + px) * 4] > 128;
        }

        const SAMPLE_COUNT = 90000; // Original high density
        const DOT_R = GLOBE_R + 0.6;
        const positions = [];
        const sizes = [];
        const isCityFlag = [];

        const offset = 2 / SAMPLE_COUNT;
        const increment = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < SAMPLE_COUNT; i++) {
          const y = (i * offset) - 1 + offset / 2;
          const r = Math.sqrt(Math.max(0, 1 - y * y));
          const phi = i * increment;
          const x = Math.cos(phi) * r;
          const z = Math.sin(phi) * r;

          const { lat, lon } = vec3ToLatLon(new THREE.Vector3(x, y, z));
          if (!isLand(lat, lon)) continue;

          let nearCity = 0;
          for (const [clat, clon] of CITY_COORDS) {
            const d = Math.sqrt((lat - clat) ** 2 + (lon - clon) ** 2);
            if (d < 6) { nearCity = 1; break; }
          }

          positions.push(x * DOT_R, y * DOT_R, z * DOT_R);
          sizes.push(nearCity ? 4.0 : 2.2 + Math.random() * 0.8);
          isCityFlag.push(nearCity);
        }

        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        dotGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
        dotGeo.setAttribute('isCity', new THREE.Float32BufferAttribute(isCityFlag, 1));

        dotMat = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
          },
          vertexShader: `
            attribute float aSize;
            attribute float isCity;
            varying   float vIsCity;

            void main() {
              vIsCity = isCity;
              gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = aSize;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            varying float vIsCity;

            void main() {
              vec2  uv   = gl_PointCoord - 0.5;
              float d2   = dot(uv, uv);
              if (d2 > 0.25) discard;

              float pulse = 0.55 + 0.45 * sin(uTime * 2.2 + vIsCity * 3.14);
              float alpha = vIsCity > 0.5 ? pulse * 1.0 : 0.95;

              vec3 cityCol  = vec3(0.31, 0.12, 0.85); // Rich Indigo/Violet
              vec3 plainCol = vec3(0.09, 0.13, 0.22); // Solid dark Slate-900 (#0f172a / #172138 style) for high contrast
              vec3 col      = vIsCity > 0.5 ? cityCol : plainCol;

              gl_FragColor = vec4(col, alpha);
            }
          `,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending, // Normal blending for clear display on light theme
        });

        dots = new THREE.Points(dotGeo, dotMat);
        globeGroup.add(dots);
      } catch (err) {
        console.error("Failed to build land dots:", err);
      }
    }

    // ============================================================
    // LAYER 3 — City node halos
    // ============================================================
    const cityNodes = CITY_COORDS.map(([lat, lon]) => ({
      pos: latLonToVec3(lat, lon, GLOBE_R + 1.2),
      phase: Math.random() * Math.PI * 2,
    }));

    const ringGroup = new THREE.Group();
    cityNodes.forEach(node => {
      const geo = new THREE.RingGeometry(1.0, 2.5, 24); // Larger halo rings
      const mat = new THREE.MeshBasicMaterial({
        color: 0x7c3aed, // Vivid Violet
        transparent: true,
        opacity: 0.9, // Higher opacity
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(node.pos);
      mesh.lookAt(new THREE.Vector3(0, 0, 0));
      mesh.userData.phase = node.phase;
      ringGroup.add(mesh);
    });
    globeGroup.add(ringGroup);

    // ============================================================
    // LAYER 4 — Animated arcs between cities
    // ============================================================
    const ARC_PAIRS = [
      [0, 1], [1, 2], [2, 7], [3, 7], [4, 7], [5, 0], [6, 0], [8, 1],
      [9, 1], [10, 0], [11, 0], [12, 1], [13, 2], [14, 9], [15, 8],
      [16, 0], [17, 2], [18, 6], [19, 1], [20, 13], [21, 9], [22, 19],
      [23, 11], [23, 2], [23, 4], [23, 13],
      [24, 3], [24, 20], [24, 7], [24, 1],
      [25, 4], [25, 7], [25, 28],
      [26, 4], [26, 23], [26, 29],
      [27, 1], [27, 0], [27, 20],
      [28, 21], [28, 25], [28, 24],
      [29, 6], [29, 0], [29, 26],
      [30, 0], [30, 29], [30, 15],
    ];

    class Arc {
      constructor(startNode, endNode) {
        const A = startNode.pos.clone().normalize().multiplyScalar(GLOBE_R + 1);
        const B = endNode.pos.clone().normalize().multiplyScalar(GLOBE_R + 1);

        const mid = A.clone().add(B).multiplyScalar(0.5);
        const lift = A.distanceTo(B) * 0.55;
        const ctrl1 = mid.clone().normalize().multiplyScalar(GLOBE_R + lift * 0.7);

        this.curve = new THREE.QuadraticBezierCurve3(A, ctrl1, B);
        const pts = this.curve.getPoints(60);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);

        const colors = [];
        const colorA = new THREE.Color(0x2563eb); // Vivid Blue
        const colorB = new THREE.Color(0x7c3aed); // Vivid Violet
        pts.forEach((_, i) => {
          const t = i / (pts.length - 1);
          const c = colorA.clone().lerp(colorB, t);
          colors.push(c.r, c.g, c.b);
        });
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        this.mat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0,
          linewidth: 2.5, // Thicker line
          blending: THREE.NormalBlending,
        });
        this.line = new THREE.Line(geo, this.mat);
        this.totalPts = pts.length;
        this.progress = 0;
        this.fadeOut = false;
        this.dead = false;
        this.speed = 0.008 + Math.random() * 0.008;

        this.line.geometry.setDrawRange(0, 0);
        globeGroup.add(this.line);

        this.headGeo = new THREE.BufferGeometry();
        this.headGeo.setAttribute('position', new THREE.Float32BufferAttribute([A.x, A.y, A.z], 3));
        this.headMat = new THREE.PointsMaterial({
          color: 0x2563eb, // Vivid Blue head
          size: 8.0, // Larger size
          sizeAttenuation: false,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        this.head = new THREE.Points(this.headGeo, this.headMat);
        globeGroup.add(this.head);
      }

      update() {
        if (this.dead) return;
        if (!this.fadeOut) {
          this.progress += this.speed;
          const t = Math.min(1, this.progress);
          this.mat.opacity = Math.min(0.95, this.progress * 3); // More opaque lines
          this.line.geometry.setDrawRange(0, Math.floor(t * this.totalPts));

          const p = this.curve.getPoint(t);
          this.headGeo.attributes.position.setXYZ(0, p.x, p.y, p.z);
          this.headGeo.attributes.position.needsUpdate = true;
          this.headMat.opacity = Math.min(1, this.progress * 3);

          if (this.progress >= 1) { this.fadeOut = true; this.progress = 1; }
        } else {
          this.mat.opacity -= 0.015;
          this.headMat.opacity -= 0.025;
          if (this.mat.opacity <= 0) {
            globeGroup.remove(this.line);
            globeGroup.remove(this.head);
            this.dead = true;
          }
        }
      }
    }

    let arcs = [];
    let lastArcTime = 0;

    function spawnArc() {
      const pair = ARC_PAIRS[Math.floor(Math.random() * ARC_PAIRS.length)];
      arcs.push(new Arc(cityNodes[pair[0]], cityNodes[pair[1]]));
    }

    // ============================================================
    // Lights (Studio setup for soft light-theme shading)
    // ============================================================
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(150, 150, 150);
    scene.add(dirLight);

    buildLandDots();

    // ============================================================
    // Drag-to-rotate
    // ============================================================
    let autoSpin = true;
    let isDragging = false;
    let prevMX = 0, prevMY = 0;
    let velX = 0, velY = 0;
    let rotX = 0.3, rotY = 0;

    function applyRotation() {
      globeGroup.rotation.x = rotX;
      globeGroup.rotation.y = rotY;
    }

    const onMouseDown = (e) => {
      isDragging = true;
      autoSpin = false;
      prevMX = e.clientX;
      prevMY = e.clientY;
      velX = velY = 0;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      velY = (e.clientX - prevMX) * 0.006;
      velX = (e.clientY - prevMY) * 0.006;
      rotY += velY;
      rotX += velX;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      prevMX = e.clientX;
      prevMY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => { autoSpin = true; }, 1500);
    };

    const onTouchStart = (e) => {
      isDragging = true;
      autoSpin = false;
      prevMX = e.touches[0].clientX;
      prevMY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      rotY += (e.touches[0].clientX - prevMX) * 0.006;
      rotX += (e.touches[0].clientY - prevMY) * 0.006;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      prevMX = e.touches[0].clientX;
      prevMY = e.touches[0].clientY;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // ============================================================
    // Render loop
    // ============================================================
    const clock = new THREE.Clock();

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (dotMat) dotMat.uniforms.uTime.value = elapsed;

      // Continuous rotation
      rotY += 0.002;

      if (!isDragging) {
        rotY += velY;
        rotX += velX;
        velY *= 0.96;
        velX *= 0.96;
      }

      applyRotation();

      ringGroup.children.forEach(ring => {
        const s = 1 + 0.25 * Math.sin(elapsed * 2.5 + ring.userData.phase);
        ring.scale.setScalar(s);
        ring.material.opacity = 0.5 + 0.4 * Math.sin(elapsed * 2 + ring.userData.phase);
      });

      if (elapsed - lastArcTime > 0.15 && arcs.filter(a => !a.dead).length < 35) {
        spawnArc();
        lastArcTime = elapsed;
      }

      arcs = arcs.filter(a => !a.dead);
      arcs.forEach(a => a.update());

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
    </div>
  );
};

export default Globe;
