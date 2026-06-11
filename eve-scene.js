/* ============================================
   EVE 3D Scene — New Model v2
   Frame-clamped animation (112-140 @ 24fps)
   Duplicate mesh hiding + Orbit camera
   ============================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function () {
    'use strict';

    const MODEL_PATH = 'eve_model_v2.glb';
    const FPS = 24;
    const IDLE_FRAME = 112;
    const WAVE_START_FRAME = 112;
    const WAVE_END_FRAME = 140;
    const IDLE_TIME = IDLE_FRAME / FPS;       // 4.667s
    const WAVE_START = WAVE_START_FRAME / FPS; // 4.667s
    const WAVE_END = WAVE_END_FRAME / FPS;     // 5.833s

    let scene, camera, renderer, clock;
    let eveRoot = null;
    let mixer = null;
    let actions = [];
    let isWaving = false;
    let isVisible = true;
    let isRendering = false;
    let isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    let centerOffset = new THREE.Vector3(); // saved center at frame 112

    // Mouse tracking — EVE follows the cursor
    let mouseX = 0, mouseY = 0;       // current mouse (normalized -1 to 1)
    let targetRotX = 0, targetRotY = 0; // target rotation for tracking
    let currentRotX = 0, currentRotY = 0; // smoothed current rotation
    const MAX_ROT_X = 0.8;  // max horizontal rotation (radians, ~45°)
    const MAX_ROT_Y = 0.4;  // max vertical rotation (radians, ~23°)

    // Orbit camera
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let orbitTheta = 0, orbitPhi = Math.PI / 2;
    let targetTheta = 0, targetPhi = Math.PI / 2;
    let camDistance = 2;

    function init() {
        const container = document.getElementById('eve-3d-container');
        if (!container) return;

        clock = new THREE.Clock();
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.001, 100);

        renderer = new THREE.WebGLRenderer({
            antialias: !isMobile, alpha: true, powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 1.8));
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
        keyLight.position.set(2, 4, 5); scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xddeeff, 1.0);
        fillLight.position.set(-3, 2, 2); scene.add(fillLight);
        const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
        topLight.position.set(0, 5, 0); scene.add(topLight);
        const glow = new THREE.PointLight(0x00aaff, 1.5, 4);
        glow.position.set(0, 0.5, 1); scene.add(glow);

        loadModel(container);
        setupOrbitControls(container);
        setupMouseTracking();

        window.addEventListener('resize', () => {
            if (!camera || !renderer) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }, { passive: true });

        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible && !isRendering) { isRendering = true; clock.start(); animate(); }
            });
        }, { threshold: 0.05 }).observe(container);
    }

    function setupOrbitControls(container) {
        container.style.cursor = 'grab';
        let pointerStartX = 0, pointerStartY = 0;

        container.addEventListener('pointerdown', (e) => {
            isDragging = true; prevX = e.clientX; prevY = e.clientY;
            pointerStartX = e.clientX; pointerStartY = e.clientY;
            container.style.cursor = 'grabbing'; e.preventDefault();
        });
        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            targetTheta -= (e.clientX - prevX) * 0.005;
            targetPhi -= (e.clientY - prevY) * 0.005;
            targetPhi = Math.max(0.3, Math.min(Math.PI - 0.3, targetPhi));
            prevX = e.clientX; prevY = e.clientY;
        });
        window.addEventListener('pointerup', (e) => {
            if (isDragging) {
                // If the pointer barely moved, it's a click → play wave
                const dx = Math.abs(e.clientX - pointerStartX);
                const dy = Math.abs(e.clientY - pointerStartY);
                if (dx < 5 && dy < 5) {
                    playWave();
                    console.log('EVE: 👆 Clicked! Playing wave');
                }
            }
            isDragging = false;
            const c = document.getElementById('eve-3d-container');
            if (c) c.style.cursor = 'grab';
        });
        container.addEventListener('touchstart', (e) => {
            isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
            pointerStartX = e.touches[0].clientX; pointerStartY = e.touches[0].clientY;
        }, { passive: true });
        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            targetTheta -= (e.touches[0].clientX - prevX) * 0.005;
            targetPhi -= (e.touches[0].clientY - prevY) * 0.005;
            targetPhi = Math.max(0.3, Math.min(Math.PI - 0.3, targetPhi));
            prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
        }, { passive: true });
        container.addEventListener('touchend', (e) => {
            if (isDragging) {
                const lastX = e.changedTouches?.[0]?.clientX || pointerStartX;
                const lastY = e.changedTouches?.[0]?.clientY || pointerStartY;
                const dx = Math.abs(lastX - pointerStartX);
                const dy = Math.abs(lastY - pointerStartY);
                if (dx < 5 && dy < 5) {
                    playWave();
                }
            }
            isDragging = false;
        });
    }

    function loadModel(container) {
        new GLTFLoader().load(MODEL_PATH,
            (gltf) => {
                eveRoot = gltf.scene;

                // Hide tiny/degenerate meshes, set double-sided
                eveRoot.traverse((child) => {
                    if (!child.isMesh) return;
                    const v = child.geometry.attributes.position?.count || 0;
                    if (v <= 4) { child.visible = false; return; }
                    if (child.material) child.material.side = THREE.DoubleSide;
                    console.log(`EVE: MESH ${child.name} ${v}v parent=${child.parent?.name}`);
                });

                // Add to scene (no scaling/centering yet — do it AFTER evaluating frame 112)
                scene.add(eveRoot);

                // === ANIMATION SETUP ===
                // Keep ALL tracks including position — they're needed for correct pose
                mixer = new THREE.AnimationMixer(eveRoot);
                actions = [];

                gltf.animations.forEach(clip => {
                    const action = mixer.clipAction(clip);
                    action.setLoop(THREE.LoopOnce);
                    action.clampWhenFinished = true;
                    action.play();
                    action.paused = true;
                    action.time = IDLE_TIME;
                    actions.push(action);
                });

                // Force evaluate frame 112 pose
                mixer.update(0);

                // NOW scale and center based on frame 112 pose
                const box = new THREE.Box3().setFromObject(eveRoot);
                const size = new THREE.Vector3(); box.getSize(size);
                const scale = 1.0 / Math.max(size.x, size.y, size.z);
                eveRoot.scale.multiplyScalar(scale);

                // Recalculate bounds after scaling
                const sbox = new THREE.Box3().setFromObject(eveRoot);
                const center = new THREE.Vector3(); sbox.getCenter(center);
                centerOffset.copy(center);

                // Use a wrapper group to keep eveRoot centered
                // by always subtracting the frame-112 center
                eveRoot.position.sub(center);

                console.log(`EVE: ✅ Loaded! Paused at frame ${IDLE_FRAME}`);
                console.log(`EVE: Scale=${scale.toFixed(4)}, Center=${center.x.toFixed(3)},${center.y.toFixed(3)},${center.z.toFixed(3)}`);

                // Camera
                camDistance = 1.2 / Math.tan(THREE.MathUtils.degToRad(20));
                camera.position.set(0, 0, camDistance);
                camera.lookAt(0, 0, 0);

                isRendering = true;
                animate();
            },
            (p) => { if (p.total > 0) console.log('EVE:', Math.round((p.loaded / p.total) * 100) + '%'); },
            (err) => { console.error('EVE: ❌', err); }
        );
    }

    // Play wave: frames 112 → 140, then snap back to 112
    function playWave() {
        if (!mixer || actions.length === 0 || isWaving) return;
        isWaving = true;
        console.log('EVE: 👋 Wave! (frames 112→140)');

        actions.forEach(action => {
            action.paused = false;
            action.time = WAVE_START;
        });
    }

    function recenterModel() {
        // After each animation update, recenter the model to prevent drift
        if (!eveRoot) return;
        const box = new THREE.Box3().setFromObject(eveRoot);
        const currentCenter = new THREE.Vector3();
        box.getCenter(currentCenter);
        // Shift eveRoot so that the model center stays at origin
        eveRoot.position.sub(currentCenter);
    }

    function animate() {
        if (!isVisible) { isRendering = false; clock.stop(); return; }
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (mixer) {
            if (isWaving) {
                mixer.update(delta);
                recenterModel();

                // Check if we've reached frame 140
                const currentTime = actions[0]?.time || 0;
                if (currentTime >= WAVE_END) {
                    // Snap back to idle pose at frame 112
                    actions.forEach(action => {
                        action.time = IDLE_TIME;
                        action.paused = true;
                    });
                    mixer.update(0);
                    recenterModel();
                    isWaving = false;
                    console.log('EVE: Wave done ✅ → back to frame 112');
                }
            }
        }

        // Mouse tracking — EVE follows the cursor
        updateMouseTracking();

        // Smooth orbit camera
        orbitTheta += (targetTheta - orbitTheta) * 0.1;
        orbitPhi += (targetPhi - orbitPhi) * 0.1;
        camera.position.set(
            camDistance * Math.sin(orbitPhi) * Math.sin(orbitTheta),
            camDistance * Math.cos(orbitPhi),
            camDistance * Math.sin(orbitPhi) * Math.cos(orbitTheta)
        );
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    // === MOUSE TRACKING ===
    function setupMouseTracking() {
        const updateMousePosition = (clientX, clientY) => {
            const container = document.getElementById('eve-3d-container');
            if (!container) return;
            // Get center of EVE's container
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Map [0, centerX] -> [-1, 0] and [centerX, windowWidth] -> [0, 1]
            if (clientX < centerX) {
                mouseX = centerX > 0 ? (clientX - centerX) / centerX : 0;
            } else {
                const rightSpace = window.innerWidth - centerX;
                mouseX = rightSpace > 0 ? (clientX - centerX) / rightSpace : 0;
            }

            if (clientY < centerY) {
                mouseY = centerY > 0 ? (clientY - centerY) / centerY : 0;
            } else {
                const bottomSpace = window.innerHeight - centerY;
                mouseY = bottomSpace > 0 ? (clientY - centerY) / bottomSpace : 0;
            }
        };

        // Track mouse across the entire page
        document.addEventListener('mousemove', (e) => {
            updateMousePosition(e.clientX, e.clientY);
        }, { passive: true });

        // Touch support
        document.addEventListener('touchmove', (e) => {
            updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        console.log('EVE: 👀 Mouse tracking enabled');
    }

    function updateMouseTracking() {
        if (!eveRoot || isDragging) return;

        // Target rotation based on mouse position
        // Positive mouseX (right) = positive Y rotation (look right)
        targetRotY = mouseX * MAX_ROT_X;  // horizontal: look same direction as mouse
        targetRotX = mouseY * MAX_ROT_Y;  // vertical: mouse up = look up

        // Smooth lerp towards target (0.05 = very smooth, natural follow)
        currentRotX += (targetRotX - currentRotX) * 0.05;
        currentRotY += (targetRotY - currentRotY) * 0.05;

        // Apply rotation to the model root
        // Only apply mouse tracking rotation, preserving the animation rotations
        eveRoot.rotation.x = currentRotX;
        eveRoot.rotation.y = currentRotY;
    }

    // PUBLIC API
    window.eveAnimate = function (action) {
        if (action === 'wave' || action === 'greeting') playWave();
    };
    window.eveIsLoaded = function () { return eveRoot !== null; };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
