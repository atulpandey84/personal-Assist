/**
 * Real-Time Living 3D Female Persona Engine (Three.js WebGL Engine)
 * Implements realistic 3D female persona rendering, facial expressions, eye saccades,
 * eyebrow dynamics, procedural breathing, viseme mouth morphs,
 * multi-agent posture states, and standalone VRM/GLTF model loader support.
 */
class Persona3DManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.headGroup = null;
        this.mouthMesh = null;
        this.upperLip = null;
        this.lowerLip = null;
        this.leftEye = null;
        this.rightEye = null;
        this.leftIris = null;
        this.rightIris = null;
        this.leftBrow = null;
        this.rightBrow = null;
        this.leftEyelash = null;
        this.rightEyelash = null;
        this.hairGroup = null;
        this.torsoMesh = null;

        // Viseme blend shape morph targets
        this.visemes = {
            aa: 0, // open mouth
            ih: 0, // wide smile
            ou: 0, // rounded lips
            ee: 0, // extended smile
            oh: 0  // circular mouth
        };

        this.targetViseme = 'aa';
        this.visemeIntensity = 0;

        // Agent state (ready, listening, thinking, speaking, alert)
        this.currentState = 'ready';
        this.clock = new THREE.Clock();

        // Mouse and gaze tracking
        this.mousePos = { x: 0, y: 0 };

        // Saccade (eye darting) mechanics
        this.saccadeOffset = { x: 0, y: 0 };
        this.nextSaccadeTime = 0;

        // Blink mechanics
        this.blinkScale = 1.0;
        this.isBlinking = false;
        this.nextBlinkTime = 2.0;

        // Loaded VRM / External Model reference
        this.loadedModel = null;

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 1000);
        this.camera.position.set(0, 0.08, 3.4);

        // WebGL Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(240, 240);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.12;

        // Studio Lighting Setup
        const ambientLight = new THREE.AmbientLight(0xfff0f4, 1.0);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffebee, 1.2);
        keyLight.position.set(2, 3, 4);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xdce7f5, 0.6);
        fillLight.position.set(-2.5, -1, 2);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rimLight.position.set(0, 3, -3);
        this.scene.add(rimLight);

        // Build High-Quality 3D Female Persona Mesh
        this.buildPersonaMesh();

        // Register Mouse Move for Gaze & Micro-Saccade Tracking
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Start Animation Loop
        this.animate();
    }

    buildPersonaMesh() {
        this.headGroup = new THREE.Group();

        // 1. Head Mesh with Smooth Flesh Tone & Contoured Chin
        const headGeo = new THREE.SphereGeometry(0.66, 64, 64);
        headGeo.scale(1.0, 1.20, 0.92);
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xffe2d5,
            roughness: 0.35,
            metalness: 0.02
        });
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        this.headGroup.add(headMesh);

        // 2. High-Detail Anime/Game Eyes
        const eyeGroupLeft = new THREE.Group();
        const eyeGroupRight = new THREE.Group();

        // Eye Sclera (White)
        const scleraGeo = new THREE.SphereGeometry(0.095, 32, 32);
        scleraGeo.scale(1.15, 0.88, 0.45);
        const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });

        const leftSclera = new THREE.Mesh(scleraGeo, scleraMat);
        const rightSclera = new THREE.Mesh(scleraGeo, scleraMat);
        eyeGroupLeft.add(leftSclera);
        eyeGroupRight.add(rightSclera);

        // Vibrant Blue Irises
        const irisGeo = new THREE.CircleGeometry(0.060, 32);
        const irisMat = new THREE.MeshStandardMaterial({
            color: 0x1b6fe3,
            roughness: 0.1,
            metalness: 0.1
        });

        this.leftIris = new THREE.Mesh(irisGeo, irisMat);
        this.leftIris.position.set(0, 0, 0.046);
        eyeGroupLeft.add(this.leftIris);

        this.rightIris = new THREE.Mesh(irisGeo, irisMat);
        this.rightIris.position.set(0, 0, 0.046);
        eyeGroupRight.add(this.rightIris);

        // Pupils
        const pupilGeo = new THREE.CircleGeometry(0.028, 24);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x080a14 });
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(0, 0, 0.048);
        eyeGroupLeft.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0, 0, 0.048);
        eyeGroupRight.add(rightPupil);

        // Eye Catchlight Highlights
        const hlGeo = new THREE.CircleGeometry(0.018, 16);
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const leftHl = new THREE.Mesh(hlGeo, hlMat);
        leftHl.position.set(-0.018, 0.02, 0.05);
        eyeGroupLeft.add(leftHl);

        const rightHl = new THREE.Mesh(hlGeo, hlMat);
        rightHl.position.set(-0.018, 0.02, 0.05);
        eyeGroupRight.add(rightHl);

        // Dark Eyelash Curvature Lines
        const lashGeo = new THREE.TorusGeometry(0.09, 0.012, 12, 24, Math.PI * 0.7);
        const lashMat = new THREE.MeshBasicMaterial({ color: 0x181210 });

        this.leftEyelash = new THREE.Mesh(lashGeo, lashMat);
        this.leftEyelash.position.set(0, 0.035, 0.045);
        this.leftEyelash.rotation.z = -0.15;
        eyeGroupLeft.add(this.leftEyelash);

        this.rightEyelash = new THREE.Mesh(lashGeo, lashMat);
        this.rightEyelash.position.set(0, 0.035, 0.045);
        this.rightEyelash.rotation.z = 0.15;
        this.rightEyelash.rotation.y = Math.PI;
        eyeGroupRight.add(this.rightEyelash);

        // Position Eye Assemblies
        eyeGroupLeft.position.set(-0.21, 0.12, 0.56);
        eyeGroupRight.position.set(0.21, 0.12, 0.56);
        this.headGroup.add(eyeGroupLeft);
        this.headGroup.add(eyeGroupRight);
        this.leftEye = eyeGroupLeft;
        this.rightEye = eyeGroupRight;

        // 3. Eyebrows
        const browGeo = new THREE.BoxGeometry(0.16, 0.018, 0.01);
        const browMat = new THREE.MeshBasicMaterial({ color: 0x4a3222 });

        this.leftBrow = new THREE.Mesh(browGeo, browMat);
        this.leftBrow.position.set(-0.21, 0.25, 0.58);
        this.leftBrow.rotation.z = 0.04;
        this.headGroup.add(this.leftBrow);

        this.rightBrow = new THREE.Mesh(browGeo, browMat);
        this.rightBrow.position.set(0.21, 0.25, 0.58);
        this.rightBrow.rotation.z = -0.04;
        this.headGroup.add(this.rightBrow);

        // 4. Soft Cheek Blush
        const blushGeo = new THREE.CircleGeometry(0.12, 24);
        const blushMat = new THREE.MeshBasicMaterial({
            color: 0xff8898,
            transparent: true,
            opacity: 0.36
        });
        const leftBlush = new THREE.Mesh(blushGeo, blushMat);
        leftBlush.position.set(-0.30, -0.05, 0.57);
        leftBlush.rotation.y = -0.22;
        this.headGroup.add(leftBlush);

        const rightBlush = new THREE.Mesh(blushGeo, blushMat);
        rightBlush.position.set(0.30, -0.05, 0.57);
        rightBlush.rotation.y = 0.22;
        this.headGroup.add(rightBlush);

        // 5. Stylized Female Hair (Layered Back Volume + Side Locks + Sleek Forehead Bangs)
        this.hairGroup = new THREE.Group();
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x543b2b,
            roughness: 0.45,
            metalness: 0.05
        });

        // Top Hair Volume
        const hairCapGeo = new THREE.SphereGeometry(0.68, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42);
        const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
        hairCap.position.set(0, 0.28, -0.10);
        this.hairGroup.add(hairCap);

        // Back Hair Volume
        const backHairGeo = new THREE.SphereGeometry(0.66, 32, 32);
        const backHair = new THREE.Mesh(backHairGeo, hairMat);
        backHair.position.set(0, -0.12, -0.20);
        this.hairGroup.add(backHair);

        // Side Hair Locks
        const lockGeo = new THREE.CylinderGeometry(0.05, 0.13, 0.85, 20);
        const leftLock = new THREE.Mesh(lockGeo, hairMat);
        leftLock.position.set(-0.46, -0.22, 0.15);
        leftLock.rotation.z = -0.12;
        this.hairGroup.add(leftLock);

        const rightLock = new THREE.Mesh(lockGeo, hairMat);
        rightLock.position.set(0.46, -0.22, 0.15);
        rightLock.rotation.z = 0.12;
        this.hairGroup.add(rightLock);

        // Sleek Crown Band
        const crownBandGeo = new THREE.TorusGeometry(0.35, 0.03, 12, 24, Math.PI * 0.85);
        const crownBand = new THREE.Mesh(crownBandGeo, hairMat);
        crownBand.position.set(0, 0.38, 0.35);
        crownBand.rotation.x = 0.4;
        this.hairGroup.add(crownBand);

        this.headGroup.add(this.hairGroup);

        // 6. Lip & Mouth Assembly
        const mouthGroup = new THREE.Group();
        const lipMat = new THREE.MeshStandardMaterial({
            color: 0xe6556e,
            roughness: 0.25,
            metalness: 0.05
        });

        const upperLipGeo = new THREE.TorusGeometry(0.10, 0.02, 12, 24, Math.PI);
        this.upperLip = new THREE.Mesh(upperLipGeo, lipMat);
        this.upperLip.rotation.x = Math.PI;
        this.upperLip.position.set(0, 0.012, 0);
        mouthGroup.add(this.upperLip);

        const lowerLipGeo = new THREE.TorusGeometry(0.09, 0.022, 12, 24, Math.PI);
        this.lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
        this.lowerLip.position.set(0, -0.012, 0);
        mouthGroup.add(this.lowerLip);

        // Mouth Cavity
        const cavityGeo = new THREE.PlaneGeometry(0.16, 0.08);
        const cavityMat = new THREE.MeshBasicMaterial({ color: 0x420c14 });
        this.mouthMesh = new THREE.Mesh(cavityGeo, cavityMat);
        this.mouthMesh.position.set(0, 0, -0.01);
        mouthGroup.add(this.mouthMesh);

        mouthGroup.position.set(0, -0.22, 0.58);
        this.headGroup.add(mouthGroup);

        // 7. Torso & Stylish Dark Outer Jacket
        const torsoGroup = new THREE.Group();

        // Inner Top
        const innerGeo = new THREE.CylinderGeometry(0.34, 0.48, 0.7, 24);
        const innerMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.5 });
        const innerTop = new THREE.Mesh(innerGeo, innerMat);
        innerTop.position.set(0, -0.95, 0);
        torsoGroup.add(innerTop);

        // Outer Jacket
        const jacketGeo = new THREE.CylinderGeometry(0.44, 0.62, 0.75, 24, 1, true, 0, Math.PI * 1.6);
        const jacketMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.4 });
        const jacketMesh = new THREE.Mesh(jacketGeo, jacketMat);
        jacketMesh.position.set(0, -0.98, 0);
        jacketMesh.rotation.y = Math.PI * 0.2;
        torsoGroup.add(jacketMesh);

        this.torsoMesh = torsoGroup;
        this.scene.add(this.torsoMesh);

        this.scene.add(this.headGroup);
    }

    setViseme(viseme, intensity = 1.0) {
        this.targetViseme = viseme;
        this.visemeIntensity = intensity;
    }

    setState(stateName) {
        this.currentState = stateName;
    }

    loadVRMModel(url) {
        if (typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            loader.load(url, (gltf) => {
                if (this.headGroup) this.scene.remove(this.headGroup);
                if (this.torsoMesh) this.scene.remove(this.torsoMesh);
                this.loadedModel = gltf.scene;
                this.loadedModel.position.set(0, -1.0, 0);
                this.scene.add(this.loadedModel);
                console.log("3D Female Persona standalone VRM model successfully loaded:", url);
            }, undefined, (err) => {
                console.warn("Failed to load external VRM model, retaining procedural model fallback:", err);
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Procedural Breathing
        const breathCycle = Math.sin(time * 1.8);
        const breathOffsetY = breathCycle * 0.012;
        if (this.headGroup) this.headGroup.position.y = breathOffsetY;
        if (this.torsoMesh) this.torsoMesh.position.y = breathOffsetY * 0.4;

        // 2. Eye Saccades
        if (time > this.nextSaccadeTime) {
            this.saccadeOffset.x = (Math.random() - 0.5) * 0.05;
            this.saccadeOffset.y = (Math.random() - 0.5) * 0.03;
            this.nextSaccadeTime = time + 1.2 + Math.random() * 2.5;
        }

        const targetGazeX = this.mousePos.x * 0.08 + this.saccadeOffset.x;
        const targetGazeY = this.mousePos.y * 0.05 + this.saccadeOffset.y;

        if (this.leftIris && this.rightIris) {
            this.leftIris.position.x = THREE.MathUtils.lerp(this.leftIris.position.x, targetGazeX, 0.1);
            this.leftIris.position.y = THREE.MathUtils.lerp(this.leftIris.position.y, targetGazeY, 0.1);
            this.rightIris.position.x = THREE.MathUtils.lerp(this.rightIris.position.x, targetGazeX, 0.1);
            this.rightIris.position.y = THREE.MathUtils.lerp(this.rightIris.position.y, targetGazeY, 0.1);
        }

        // 3. Eye Blinking Logic
        if (time > this.nextBlinkTime && !this.isBlinking) {
            this.isBlinking = true;
            this.nextBlinkTime = time + 2.5 + Math.random() * 3.5;
        }

        if (this.isBlinking) {
            this.blinkScale = THREE.MathUtils.lerp(this.blinkScale, 0.1, 0.3);
            if (this.blinkScale < 0.15) {
                this.isBlinking = false;
            }
        } else {
            this.blinkScale = THREE.MathUtils.lerp(this.blinkScale, 1.0, 0.3);
        }

        if (this.leftEye && this.rightEye) {
            this.leftEye.scale.y = this.blinkScale;
            this.rightEye.scale.y = this.blinkScale;
        }

        // 4. Eyebrows & Posture Transitions
        let targetHeadRotX = -this.mousePos.y * 0.06;
        let targetHeadRotY = this.mousePos.x * 0.10;
        let targetHeadRotZ = 0;
        let targetBrowY = 0.25;

        if (this.currentState === 'listening') {
            targetHeadRotZ = Math.sin(time * 2.5) * 0.03 + 0.05;
            targetHeadRotX += 0.03;
            targetBrowY = 0.27;
        } else if (this.currentState === 'thinking') {
            targetHeadRotX = -0.10;
            targetHeadRotY = Math.sin(time * 1.5) * 0.12;
            targetBrowY = 0.23;
        } else if (this.currentState === 'speaking') {
            targetHeadRotY += Math.sin(time * 4) * 0.03;
            targetHeadRotX += Math.cos(time * 3) * 0.02;
            targetBrowY = 0.26 + Math.sin(time * 5) * 0.012;
        } else if (this.currentState === 'alert') {
            targetHeadRotX = 0.08;
            targetBrowY = 0.28;
        }

        if (this.headGroup) {
            this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, targetHeadRotX, 0.06);
            this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, targetHeadRotY, 0.06);
            this.headGroup.rotation.z = THREE.MathUtils.lerp(this.headGroup.rotation.z, targetHeadRotZ, 0.06);
        }

        if (this.leftBrow && this.rightBrow) {
            this.leftBrow.position.y = THREE.MathUtils.lerp(this.leftBrow.position.y, targetBrowY, 0.1);
            this.rightBrow.position.y = THREE.MathUtils.lerp(this.rightBrow.position.y, targetBrowY, 0.1);
        }

        // 5. Viseme Mouth Morphing
        if (this.upperLip && this.lowerLip && this.mouthMesh) {
            let lipGap = 0;
            let lipWidth = 1.0;

            if (this.targetViseme === 'aa') {
                lipGap = 0.06 * this.visemeIntensity;
                lipWidth = 1.1;
            } else if (this.targetViseme === 'oh' || this.targetViseme === 'ou') {
                lipGap = 0.05 * this.visemeIntensity;
                lipWidth = 0.8;
            } else if (this.targetViseme === 'ee' || this.targetViseme === 'ih') {
                lipGap = 0.02 * this.visemeIntensity;
                lipWidth = 1.25;
            }

            this.upperLip.position.y = THREE.MathUtils.lerp(this.upperLip.position.y, 0.012 + lipGap * 0.5, 0.25);
            this.lowerLip.position.y = THREE.MathUtils.lerp(this.lowerLip.position.y, -0.012 - lipGap * 0.5, 0.25);
            this.upperLip.scale.x = THREE.MathUtils.lerp(this.upperLip.scale.x, lipWidth, 0.25);
            this.lowerLip.scale.x = THREE.MathUtils.lerp(this.lowerLip.scale.x, lipWidth, 0.25);
            this.mouthMesh.scale.y = THREE.MathUtils.lerp(this.mouthMesh.scale.y, 1.0 + lipGap * 10, 0.25);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global reference initialization
window.persona3D = null;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        window.persona3D = new Persona3DManager('avatar-3d-canvas');
    }
});
