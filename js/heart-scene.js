// ============================================================
// 3D Interactive Heart Scene — Three.js + MediaPipe
// ============================================================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// ─── CONFIG ───────────────────────────────────────────────────
const CONFIG = {
    colors: {
        bg: 0x050208,
        fog: 0x050208,
        heartPink: 0xffb6c1,
        deepPink: 0xff69b4,
        gold: 0xffd966,
        softWhite: 0xffeef2,
    },
    particles: {
        count: 5000,
        dustCount: 2000,
        sparkleCount: 1000,
        heartScale: 7,
    },
    camera: { z: 50 },
};

const STATE = {
    mode: 'HEART',
    focusIndex: -1,
    focusTarget: null,
    hand: { detected: false, x: 0, y: 0 },
    rotation: { x: 0, y: 0 },
    touch: { active: false, startX: 0, startY: 0, lastX: 0, lastY: 0 },
    initialized: false,
};

let scene, camera, renderer, composer;
let mainGroup;
let clock = new THREE.Clock();
let particleSystem = [];
let photoMeshGroup = new THREE.Group();
let handLandmarker, video;
let sparkleSystem;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isCameraRunning = false;
let animationId = null;

// ─── PUBLIC API (called from main.js) ─────────────────────────
window.initHeartScene = function () {
    if (STATE.initialized) return;
    STATE.initialized = true;
    init();
};

window.setHeartMode = function (mode) {
    if (mode === 'FOCUS_RANDOM') {
        STATE.mode = 'FOCUS';
        const photos = particleSystem.filter(p => p.type === 'PHOTO');
        if (photos.length) STATE.focusTarget = photos[Math.floor(Math.random() * photos.length)].mesh;
    } else {
        STATE.mode = mode;
        if (mode === 'HEART') STATE.focusTarget = null;
    }
};

// ─── HEART PARAMETRIC EQUATION ────────────────────────────────
function heartPosition(u, v, scale) {
    // 3D heart surface parametric equations
    const phi = u * Math.PI * 2;
    const theta = v * Math.PI;

    // Classic heart surface
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);


    // Classic 3D Heart Formula (Taubin/Parametric)
    // We map the "Shape" to X/Y and "Thickness" to Z to face the camera.

    // x = 16sin^3(t) style width
    // z term in original was the height (lobes)
    // y term in original was the thickness

    // We want:
    // X = Width (sinPhi terms)
    // Y = Height (cosPhi terms - the lobes + point)
    // Z = Depth/Thickness (cosTheta)

    const x_width = sinTheta * (16 * sinPhi * sinPhi * sinPhi); // Modified for nicer width
    const y_height = sinTheta * (13 * cosPhi - 5 * Math.cos(2 * phi) - 2 * Math.cos(3 * phi) - Math.cos(4 * phi));
    const z_depth = 10 * cosTheta; // Thickness

    // Combine and scale
    const vec = new THREE.Vector3(
        x_width * scale * 0.05,
        y_height * scale * 0.05,
        z_depth * scale * 0.05
    );

    return vec;
}

// ─── INIT ─────────────────────────────────────────────────────
function init() {
    initThree();
    setupEnvironment();
    setupLights();
    createHeartParticles();
    createDust();
    createSparkles();
    loadMediaPhotos();
    setupPostProcessing();
    setupEvents();
    setupTouchAndClick();

    // Auto-start camera if supported
    setTimeout(() => initMediaPipe(), 1000);

    // Hide loader
    const loader = document.getElementById('heart-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 800);
    }

    animate();
}

// ─── THREE.JS SETUP ───────────────────────────────────────────
function initThree() {
    const container = document.getElementById('heart-canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colors.bg);
    scene.fog = new THREE.FogExp2(CONFIG.colors.fog, 0.012);

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, CONFIG.camera.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.5;
    container.appendChild(renderer.domElement);

    mainGroup = new THREE.Group();
    scene.add(mainGroup);
}

function setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
}

function setupLights() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const innerLight = new THREE.PointLight(0xffaacc, 2.5, 25);
    innerLight.position.set(0, 2, 0);
    mainGroup.add(innerLight);

    const spotPink = new THREE.SpotLight(0xff88aa, 1000);
    spotPink.position.set(25, 35, 35);
    spotPink.angle = 0.5;
    spotPink.penumbra = 0.5;
    scene.add(spotPink);

    const spotBlue = new THREE.SpotLight(0x8888ff, 600);
    spotBlue.position.set(-25, 15, -25);
    scene.add(spotBlue);

    const fill = new THREE.DirectionalLight(0xffeeff, 0.7);
    fill.position.set(0, 0, 50);
    scene.add(fill);
}

function setupPostProcessing() {
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0.5;
    bloomPass.strength = 0.6;
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
}

// ─── PARTICLE CLASS ───────────────────────────────────────────
class Particle {
    constructor(mesh, type, isDust = false) {
        this.mesh = mesh;
        this.type = type;
        this.isDust = isDust;
        this.posHeart = new THREE.Vector3();
        this.posScatter = new THREE.Vector3();
        this.baseScale = mesh.scale.x;
        const speedMult = type === 'PHOTO' ? 0.3 : 2.0;
        this.spinSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * speedMult,
            (Math.random() - 0.5) * speedMult,
            (Math.random() - 0.5) * speedMult
        );
        this.calculatePositions();
    }

    calculatePositions() {
        if (this.type === 'PHOTO') {
            this.posHeart.set(0, 0, 0); // Will be set by updatePhotoLayout
            const rScatter = 8 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            this.posScatter.set(
                rScatter * Math.sin(phi) * Math.cos(theta),
                rScatter * Math.sin(phi) * Math.sin(theta),
                rScatter * Math.cos(phi)
            );
            return;
        }

        // Use heart parametric surface for particle positions
        const u = Math.random();
        const v = Math.random();

        // Volume filling: distribute particles inside the shape, not just on surface
        // Power > 1 pushes points outward (shell-like), Power < 1 pulls inward. 
        // 0.5 gives a nice solid filled look.
        const volumeScale = Math.pow(Math.random(), 0.4);

        this.posHeart.copy(heartPosition(u, v, CONFIG.particles.heartScale));
        this.posHeart.multiplyScalar(volumeScale);

        // Add some jitter/fuzziness
        this.posHeart.x += (Math.random() - 0.5) * 0.2;
        this.posHeart.y += (Math.random() - 0.5) * 0.2;
        this.posHeart.z += (Math.random() - 0.5) * 0.2;

        // Position correction: Lift heart slightly so it's centered
        this.posHeart.y += 2;

        // Scatter position
        const rScatter = this.isDust ? (12 + Math.random() * 20) : (8 + Math.random() * 12);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        this.posScatter.set(
            rScatter * Math.sin(phi) * Math.cos(theta),
            rScatter * Math.sin(phi) * Math.sin(theta),
            rScatter * Math.cos(phi)
        );
    }

    update(dt, mode, focusTargetMesh) {
        let target = mode === 'SCATTER' ? this.posScatter : this.posHeart;

        if (mode === 'FOCUS') {
            if (this.mesh === focusTargetMesh) {
                const desiredWorldPos = new THREE.Vector3(0, 2, 35);
                const invMatrix = new THREE.Matrix4().copy(mainGroup.matrixWorld).invert();
                target = desiredWorldPos.applyMatrix4(invMatrix);
            } else {
                target = this.posScatter;
            }
        }

        const lerpSpeed = (mode === 'FOCUS' && this.mesh === focusTargetMesh) ? 5.0 : 2.0;
        this.mesh.position.lerp(target, lerpSpeed * dt);

        // Rotation
        if (mode === 'SCATTER') {
            this.mesh.rotation.x += this.spinSpeed.x * dt;
            this.mesh.rotation.y += this.spinSpeed.y * dt;
            this.mesh.rotation.z += this.spinSpeed.z * dt;
        } else if (mode === 'HEART') {
            if (this.type === 'PHOTO') {
                this.mesh.lookAt(0, this.mesh.position.y, 0);
                this.mesh.rotateY(Math.PI);
            } else {
                this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);
                this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);
                this.mesh.rotation.y += 0.5 * dt;
            }
        }

        if (mode === 'FOCUS' && this.mesh === focusTargetMesh) {
            this.mesh.lookAt(camera.position);
        }

        // Scale
        let s = this.baseScale;
        if (this.isDust) {
            s = this.baseScale * (0.8 + 0.4 * Math.sin(clock.elapsedTime * 4 + this.mesh.id));
            if (mode === 'HEART') s = 0;
        } else if (mode === 'SCATTER' && this.type === 'PHOTO') {
            s = this.baseScale * 2.5;
        } else if (mode === 'FOCUS') {
            s = this.mesh === focusTargetMesh ? 4.5 : this.baseScale * 0.8;
        }
        this.mesh.scale.lerp(new THREE.Vector3(s, s, s), 4 * dt);
    }
}

// ─── CREATE HEART PARTICLES ───────────────────────────────────
function createHeartParticles() {
    const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const boxGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);

    // Pink/rose materials
    const pinkMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.heartPink,
        metalness: 0.6,
        roughness: 0.2,
        emissive: 0xff8899,
        emissiveIntensity: 0.3,
        envMapIntensity: 1.5,
    });
    const deepPinkMat = new THREE.MeshPhysicalMaterial({
        color: CONFIG.colors.deepPink,
        metalness: 0.4,
        roughness: 0.2,
        clearcoat: 1.0,
        emissive: 0xff3366,
        emissiveIntensity: 0.2,
    });
    const goldMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.gold,
        metalness: 1.0,
        roughness: 0.1,
        emissive: 0x443300,
        emissiveIntensity: 0.3,
        envMapIntensity: 2.0,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.softWhite,
        metalness: 0.3,
        roughness: 0.3,
        emissive: 0xffddee,
        emissiveIntensity: 0.2,
    });

    for (let i = 0; i < CONFIG.particles.count; i++) {
        const rand = Math.random();
        let mesh, type;

        if (rand < 0.35) {
            mesh = new THREE.Mesh(sphereGeo, pinkMat);
            type = 'PINK_SPHERE';
        } else if (rand < 0.60) {
            mesh = new THREE.Mesh(boxGeo, pinkMat);
            type = 'PINK_BOX';
        } else if (rand < 0.78) {
            mesh = new THREE.Mesh(sphereGeo, deepPinkMat);
            type = 'DEEP_PINK';
        } else if (rand < 0.90) {
            mesh = new THREE.Mesh(boxGeo, goldMat);
            type = 'GOLD';
        } else {
            mesh = new THREE.Mesh(sphereGeo, whiteMat);
            type = 'WHITE';
        }

        const s = 0.3 + Math.random() * 0.4;
        mesh.scale.set(s, s, s);
        mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        mainGroup.add(mesh);
        particleSystem.push(new Particle(mesh, type, false));
    }

    mainGroup.add(photoMeshGroup);
}

// ─── DUST PARTICLES ───────────────────────────────────────────
function createDust() {
    const geo = new THREE.TetrahedronGeometry(0.06, 0);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xffccdd,
        transparent: true,
        opacity: 0.7,
    });
    for (let i = 0; i < CONFIG.particles.dustCount; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.scale.setScalar(0.4 + Math.random());
        mainGroup.add(mesh);
        particleSystem.push(new Particle(mesh, 'DUST', true));
    }
}

// ─── SPARKLE / SNOW REPLACEMENT ───────────────────────────────
function createSparkles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const velocities = [];

    // Create soft circle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 200, 220, 1)');
    gradient.addColorStop(1, 'rgba(255, 200, 220, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const sparkleTexture = new THREE.CanvasTexture(canvas);

    for (let i = 0; i < CONFIG.particles.sparkleCount; i++) {
        vertices.push(
            THREE.MathUtils.randFloatSpread(80),
            THREE.MathUtils.randFloatSpread(50),
            THREE.MathUtils.randFloatSpread(50)
        );
        velocities.push(Math.random() * 0.08 + 0.02, Math.random() * 0.05);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('userData', new THREE.Float32BufferAttribute(velocities, 2));

    const material = new THREE.PointsMaterial({
        color: 0xffccdd,
        size: 0.35,
        map: sparkleTexture,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    sparkleSystem = new THREE.Points(geometry, material);
    scene.add(sparkleSystem);
}

function updateSparkles() {
    if (!sparkleSystem) return;
    const positions = sparkleSystem.geometry.attributes.position.array;
    const userData = sparkleSystem.geometry.attributes.userData.array;
    for (let i = 0; i < CONFIG.particles.sparkleCount; i++) {
        const fallSpeed = userData[i * 2];
        positions[i * 3 + 1] -= fallSpeed;
        const swaySpeed = userData[i * 2 + 1];
        positions[i * 3] += Math.sin(clock.elapsedTime * 1.5 + i) * swaySpeed * 0.08;
        if (positions[i * 3 + 1] < -25) {
            positions[i * 3 + 1] = 25;
            positions[i * 3] = THREE.MathUtils.randFloatSpread(80);
            positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(50);
        }
    }
    sparkleSystem.geometry.attributes.position.needsUpdate = true;
}

// ─── PHOTO LAYOUT (helical around heart) ──────────────────────
function updatePhotoLayout() {
    const photos = particleSystem.filter(p => p.type === 'PHOTO');
    const count = photos.length;
    if (count === 0) return;

    const scale = CONFIG.particles.heartScale;
    const loops = 2;

    photos.forEach((p, i) => {
        const t = (i + 0.5) / count;
        const u = t;
        const v = 0.3 + t * 0.4; // Stay in visible region of heart

        // Get position on heart surface, then push outward
        const pos = heartPosition(u * loops, v, scale);
        const dir = pos.clone().normalize();
        pos.add(dir.multiplyScalar(3.0)); // Push photos outward from heart surface

        p.posHeart.copy(pos);
    });
}

// ─── ADD PHOTO TO SCENE ───────────────────────────────────────
function addPhotoToScene(texture, mediaItem) {
    const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.05);
    const frameMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.gold,
        metalness: 1.0,
        roughness: 0.1,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);

    let width = 1.2, height = 1.2;
    if (texture.image) {
        const aspect = texture.image.width / texture.image.height;
        if (aspect > 1) height = width / aspect;
        else width = height * aspect;
    }

    const photoGeo = new THREE.PlaneGeometry(width, height);
    const photoMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const photo = new THREE.Mesh(photoGeo, photoMat);
    photo.position.z = 0.04;

    const group = new THREE.Group();
    group.add(frame);
    group.add(photo);
    frame.scale.set(width / 1.2, height / 1.2, 1);

    const s = 0.8;
    group.scale.set(s, s, s);

    // Store media item reference for click handler
    group.userData.mediaItem = mediaItem;

    photoMeshGroup.add(group);
    particleSystem.push(new Particle(group, 'PHOTO', false));
    updatePhotoLayout();
}

// ─── LOAD MEDIA FROM window.mediaData ─────────────────────────
function loadMediaPhotos() {
    if (!window.mediaData || window.mediaData.length === 0) return;
    const loader = new THREE.TextureLoader();

    window.mediaData.forEach((item) => {
        const imgSrc = item.thumbnail || item.src;
        loader.load(
            imgSrc,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                addPhotoToScene(texture, item);
            },
            undefined,
            (err) => {
                console.warn(`Failed to load thumbnail for "${item.title}":`, err);
            }
        );
    });
}

// ─── TOUCH + CLICK ────────────────────────────────────────────
function setupTouchAndClick() {
    const container = document.getElementById('heart-canvas-container');

    container.addEventListener('pointerdown', (e) => {
        STATE.touch.active = true;
        STATE.touch.startX = e.clientX;
        STATE.touch.startY = e.clientY;
        STATE.touch.lastX = e.clientX;
        STATE.touch.lastY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
        if (!STATE.touch.active) return;
        const dX = e.clientX - STATE.touch.lastX;
        const dY = e.clientY - STATE.touch.lastY;
        STATE.rotation.y += dX * 0.005;
        STATE.rotation.x += dY * 0.002;
        STATE.rotation.x = Math.max(-0.5, Math.min(0.5, STATE.rotation.x));
        STATE.touch.lastX = e.clientX;
        STATE.touch.lastY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
        STATE.touch.active = false;
    });

    // Click on photo
    container.addEventListener('click', (e) => {
        const moveDist = Math.hypot(e.clientX - STATE.touch.startX, e.clientY - STATE.touch.startY);
        if (moveDist > 10) return; // Was a drag, not a click

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(mainGroup.children, true);
        let clickedPhoto = null;

        for (let hit of intersects) {
            let obj = hit.object;
            while (obj.parent && obj.parent !== mainGroup && obj.parent !== photoMeshGroup) {
                obj = obj.parent;
            }
            const particle = particleSystem.find(p => p.mesh === obj && p.type === 'PHOTO');
            if (particle) {
                clickedPhoto = particle;
                break;
            }
        }

        if (clickedPhoto) {
            const mediaItem = clickedPhoto.mesh.userData.mediaItem;
            if (mediaItem) {
                openMediaViewer(mediaItem);
            } else {
                // Focus mode if no media item
                STATE.mode = 'FOCUS';
                STATE.focusTarget = clickedPhoto.mesh;
            }
        } else {
            if (STATE.mode === 'FOCUS') {
                STATE.mode = 'HEART';
                STATE.focusTarget = null;
            }
        }
    });

    // Double-tap to toggle scatter
    let lastTap = 0;
    container.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300 && now - lastTap > 0) {
            STATE.mode = STATE.mode === 'SCATTER' ? 'HEART' : 'SCATTER';
            e.preventDefault();
        }
        lastTap = now;
    });
}

// ─── MEDIAPIPE GESTURE CONTROL ────────────────────────────────
async function initMediaPipe() {
    if (isCameraRunning) return;

    const camBtn = document.getElementById('heart-cam-btn');
    const debugInfo = document.getElementById('heart-debug-info');
    if (camBtn) camBtn.innerText = '⏳ Initializing...';
    if (debugInfo) debugInfo.innerText = 'Loading AI models...';

    video = document.getElementById('heart-webcam');

    try {
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
        });

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);

        document.getElementById('heart-webcam-wrapper').style.opacity = '1';
        if (debugInfo) debugInfo.innerText = 'Gesture Active: Show Hand';
        if (camBtn) {
            camBtn.innerText = '✨ Gesture Active';
            camBtn.classList.add('active');
        }
        isCameraRunning = true;
    } catch (e) {
        console.warn('Camera error:', e);
        let msg = 'Camera Error: ' + e.name;
        if (e.name === 'NotAllowedError') msg = '⚠️ Camera blocked! Please allow access in URL bar.';
        else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost')
            msg = '⚠️ Security Error: gestures require HTTPS or localhost!';
        if (debugInfo) debugInfo.innerText = msg;
        if (camBtn) camBtn.innerText = '📷 Retry Camera';
    }
}

let lastVideoTime = -1;
function predictWebcam() {
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        if (handLandmarker) {
            const result = handLandmarker.detectForVideo(video, performance.now());
            processGestures(result);
        }
    }
    requestAnimationFrame(predictWebcam);
}

function processGestures(result) {
    if (result.landmarks && result.landmarks.length > 0) {
        STATE.hand.detected = true;
        const lm = result.landmarks[0];
        STATE.hand.x = (lm[9].x - 0.5) * 2;
        STATE.hand.y = (lm[9].y - 0.5) * 2;

        const wrist = lm[0];
        const middleMCP = lm[9];
        const handSize = Math.hypot(middleMCP.x - wrist.x, middleMCP.y - wrist.y);
        if (handSize < 0.02) return;

        const tips = [lm[8], lm[12], lm[16], lm[20]];
        let avgTipDist = 0;
        tips.forEach(t => (avgTipDist += Math.hypot(t.x - wrist.x, t.y - wrist.y)));
        avgTipDist /= 4;

        const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
        const extensionRatio = avgTipDist / handSize;
        const pinchRatio = pinchDist / handSize;

        const debugInfo = document.getElementById('heart-debug-info');
        if (debugInfo) debugInfo.innerText = `Gesture Detected: ${STATE.mode}`;

        if (extensionRatio < 1.0) {
            // ✊ Fist = Assemble Heart
            STATE.mode = 'HEART';
            STATE.focusTarget = null;
        } else if (pinchRatio < 0.25) {
            // 🤏 Pinch = Focus / Zoom
            if (STATE.mode !== 'FOCUS') {
                STATE.mode = 'FOCUS';
                const photos = particleSystem.filter(p => p.type === 'PHOTO');
                if (photos.length)
                    STATE.focusTarget = photos[Math.floor(Math.random() * photos.length)].mesh;
            }
        } else if (extensionRatio > 1.3) {
            // 🖐️ Open Palm = Explode / Scatter
            STATE.mode = 'SCATTER';
            STATE.focusTarget = null;
        }
    } else {
        STATE.hand.detected = false;
    }
}

// ─── EVENT LISTENERS ──────────────────────────────────────────
function setupEvents() {
    window.addEventListener('resize', () => {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (composer) composer.setSize(window.innerWidth, window.innerHeight);
    });

    // Gesture button
    const camBtn = document.getElementById('heart-cam-btn');
    if (camBtn) camBtn.addEventListener('click', () => initMediaPipe());

    // H key to toggle UI
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h') {
            const ui = document.getElementById('heart-ui-layer');
            const debug = document.getElementById('heart-debug-info');
            const camWrapper = document.getElementById('heart-webcam-wrapper');

            const isHidden = ui.style.display === 'none';
            const value = isHidden ? '' : 'none';
            const camValue = isHidden ? '1' : '0';

            if (ui) ui.style.display = value;
            if (debug) debug.style.display = value;
            // Optionally hide webcam preview too to act as wallpaper mode
            if (camWrapper) camWrapper.style.opacity = camValue;
        }
    });
}

// ─── FULLSCREEN MEDIA VIEWER ──────────────────────────────────
function openMediaViewer(mediaItem) {
    const overlay = document.getElementById('media-viewer-overlay');
    if (!overlay) return;

    // Clear previous
    const wrapper = overlay.querySelector('.viewer-media-wrapper');
    const flyingContainer = overlay.querySelector('.flying-media-container');
    const caption = overlay.querySelector('.viewer-caption');
    wrapper.innerHTML = '';
    flyingContainer.innerHTML = '';

    // Create main media element
    if (mediaItem.type === 'video') {
        const vid = document.createElement('video');
        vid.src = mediaItem.src;
        vid.controls = true;
        vid.autoplay = true;
        vid.style.maxWidth = '85vw';
        vid.style.maxHeight = '80vh';
        vid.style.borderRadius = '12px';
        wrapper.appendChild(vid);
    } else {
        const img = document.createElement('img');
        img.src = mediaItem.src;
        img.alt = mediaItem.title;
        wrapper.appendChild(img);
    }

    // Update caption
    if (caption) {
        caption.querySelector('h3').textContent = mediaItem.title || '';
        caption.querySelector('.viewer-date').textContent = mediaItem.date || '';
        caption.querySelector('.viewer-desc').textContent = mediaItem.description || '';
    }

    // Create flying background photos
    if (window.mediaData) {
        window.mediaData.forEach((item, index) => {
            if (item === mediaItem) return; // Skip the focused one

            const flyEl = document.createElement('div');
            flyEl.className = 'flying-media-item';

            const size = 60 + Math.random() * 80;
            flyEl.style.width = size + 'px';
            flyEl.style.height = size + 'px';
            flyEl.style.top = (10 + Math.random() * 75) + '%';
            flyEl.style.setProperty('--fly-duration', (15 + Math.random() * 20) + 's');
            flyEl.style.setProperty('--fly-delay', (-Math.random() * 35) + 's');
            flyEl.style.setProperty('--fly-rotate', ((Math.random() - 0.5) * 20) + 'deg');

            if (item.type === 'video') {
                const vid = document.createElement('video');
                vid.src = item.src;
                vid.muted = true;
                vid.autoplay = true;
                vid.loop = true;
                vid.playsInline = true;
                flyEl.appendChild(vid);
            } else {
                const img = document.createElement('img');
                img.src = item.thumbnail || item.src;
                img.alt = item.title || '';
                flyEl.appendChild(img);
            }

            flyingContainer.appendChild(flyEl);
        });
    }

    overlay.classList.add('active');
}

function closeMediaViewer() {
    const overlay = document.getElementById('media-viewer-overlay');
    if (!overlay) return;

    // Pause any playing video
    const vid = overlay.querySelector('.viewer-media-wrapper video');
    if (vid) vid.pause();

    // Pause flying videos
    overlay.querySelectorAll('.flying-media-container video').forEach(v => v.pause());

    overlay.classList.remove('active');
}

// Expose close function globally
window.closeMediaViewer = closeMediaViewer;

// ─── ANIMATION LOOP ──────────────────────────────────────────
function animate() {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    // Rotation logic
    if (STATE.hand.detected) {
        if (STATE.mode === 'SCATTER') {
            const targetRotY = STATE.hand.x * Math.PI * 0.9;
            const targetRotX = STATE.hand.y * Math.PI * 0.25;
            STATE.rotation.y += (targetRotY - STATE.rotation.y) * 3.0 * dt;
            STATE.rotation.x += (targetRotX - STATE.rotation.x) * 3.0 * dt;
        } else {
            STATE.rotation.y += 0.3 * dt;
        }
    } else if (STATE.touch.active) {
        // Touch rotation handled in pointermove
    } else {
        if (STATE.mode === 'HEART') {
            STATE.rotation.y += 0.3 * dt;
            STATE.rotation.x += (0 - STATE.rotation.x) * 2.0 * dt;
        } else {
            STATE.rotation.y += 0.1 * dt;
        }
    }

    mainGroup.rotation.y = STATE.rotation.y;
    mainGroup.rotation.x = STATE.rotation.x;

    // Update all particles
    particleSystem.forEach(p => p.update(dt, STATE.mode, STATE.focusTarget));

    // Update sparkles
    updateSparkles();

    // Render
    composer.render();
}
