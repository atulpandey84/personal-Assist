/**
 * 3D Female Persona Manager (Three.js WebGL Engine)
 * Implements real-time 3D rendering, procedural animations, viseme lip-syncing,
 * multi-agent posture/expression states, and gaze tracking.
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
        this.leftEye = null;
        this.rightEye = null;
        this.hairMesh = null;
        this.torsoMesh = null;

        // Viseme blend shape morph targets
        this.visemes = {
            aa: 0, // open
            ih: 0, // wide
            ou: 0, // round
            ee: 0, // smile wide
            oh: 0  // circle
        };

        this.targetViseme = 'aa';
        this.visemeIntensity = 0;

        this.currentState = 'ready'; // ready, listening, thinking, speaking, alert
        this.clock = new THREE.Clock();
        this.mousePos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xfbf3f3);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.set(0, 0, 3.8);

        // WebGL Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(220, 220);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffe0e6, 0.9);
        keyLight.position.set(2, 3, 4);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xd4a5a5, 0.4);
        fillLight.position.set(-2, -1, 2);
        this.scene.add(fillLight);

        // Build 3D Female Persona Geometry
        this.buildPersonaMesh();

        // Register Mouse Move for Gaze Tracking
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Start Animation Loop
        this.animate();
    }

    buildPersonaMesh() {
        this.headGroup = new THREE.Group();

        // 1. Head / Face Mesh
        const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
        headGeo.scale(1, 1.15, 0.95);
        const skinMat = new THREE.MeshPhongMaterial({
            color: 0xffe0bd,
            shininess: 15,
            flatShading: false
        });
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        this.headGroup.add(headMesh);

        // 2. Eyes
        const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const eyeMat = new THREE.MeshPhongMaterial({ color: 0x2b2b2b });

        this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        this.leftEye.position.set(-0.24, 0.12, 0.62);
        this.headGroup.add(this.leftEye);

        this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        this.rightEye.position.set(0.24, 0.12, 0.62);
        this.headGroup.add(this.rightEye);

        // Eye Highlights
        const highlightGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const hlLeft = new THREE.Mesh(highlightGeo, highlightMat);
        hlLeft.position.set(-0.22, 0.14, 0.70);
        this.headGroup.add(hlLeft);

        const hlRight = new THREE.Mesh(highlightGeo, highlightMat);
        hlRight.position.set(0.26, 0.14, 0.70);
        this.headGroup.add(hlRight);

        // 3. Cheeks (Feminine Blush)
        const blushGeo = new THREE.CircleGeometry(0.12, 16);
        const blushMat = new THREE.MeshBasicMaterial({
            color: 0xffa0b0,
            transparent: true,
            opacity: 0.45
        });
        const leftBlush = new THREE.Mesh(blushGeo, blushMat);
        leftBlush.position.set(-0.35, -0.05, 0.64);
        leftBlush.rotation.y = -0.3;
        this.headGroup.add(leftBlush);

        const rightBlush = new THREE.Mesh(blushGeo, blushMat);
        rightBlush.position.set(0.35, -0.05, 0.64);
        rightBlush.rotation.y = 0.3;
        this.headGroup.add(rightBlush);

        // 4. Stylized Female Hair
        const hairGroup = new THREE.Group();
        const hairMat = new THREE.MeshPhongMaterial({
            color: 0x4a3728,
            shininess: 25
        });

        // Top / Back Hair
        const mainHairGeo = new THREE.SphereGeometry(0.78, 32, 32);
        const mainHair = new THREE.Mesh(mainHairGeo, hairMat);
        mainHair.position.set(0, 0.1, -0.05);
        hairGroup.add(mainHair);

        // Hair Bangs (Feminine Strand Front)
        const bangGeo = new THREE.ConeGeometry(0.35, 0.7, 16);
        const bangLeft = new THREE.Mesh(bangGeo, hairMat);
        bangLeft.position.set(-0.3, 0.5, 0.45);
        bangLeft.rotation.z = -0.5;
        bangLeft.rotation.x = -0.2;
        hairGroup.add(bangLeft);

        const bangRight = new THREE.Mesh(bangGeo, hairMat);
        bangRight.position.set(0.3, 0.5, 0.45);
        bangRight.rotation.z = 0.5;
        bangRight.rotation.x = -0.2;
        hairGroup.add(bangRight);

        this.headGroup.add(hairGroup);

        // 5. Dynamic Mouth with Morph Target Shapes (Visemes)
        const mouthShape = new THREE.Shape();
        mouthShape.moveTo(-0.15, 0);
        mouthShape.quadraticCurveTo(0, -0.08, 0.15, 0);
        mouthShape.quadraticCurveTo(0, 0.02, -0.15, 0);

        const mouthGeo = new THREE.ShapeGeometry(mouthShape);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0xe75480, side: THREE.DoubleSide });
        this.mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
        this.mouthMesh.position.set(0, -0.24, 0.67);
        this.headGroup.add(this.mouthMesh);

        // 6. Torso / Shoulders
        const torsoGeo = new THREE.CylinderGeometry(0.5, 0.75, 0.9, 32);
        const torsoMat = new THREE.MeshPhongMaterial({ color: 0xd4a5a5 });
        this.torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
        this.torsoMesh.position.set(0, -1.2, 0);
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

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // 1. Procedural Sinusoidal Breathing
        const breath = Math.sin(time * 2) * 0.02;
        if (this.headGroup) this.headGroup.position.y = breath;
        if (this.torsoMesh) this.torsoMesh.position.y = -1.2 + breath * 0.5;

        // 2. Procedural Eye Blinking (Random every 3-5 seconds)
        const blinkCycle = Math.sin(time * 1.5);
        if (blinkCycle > 0.98) {
            this.leftEye.scale.y = 0.1;
            this.rightEye.scale.y = 0.1;
        } else {
            this.leftEye.scale.y = 1.0;
            this.rightEye.scale.y = 1.0;
        }

        // 3. Subtle Head Gaze Tracking
        if (this.headGroup) {
            this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, this.mousePos.x * 0.25, 0.05);
            this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, -this.mousePos.y * 0.15, 0.05);
        }

        // 4. Multi-Agent State Gesture Transformations
        if (this.headGroup) {
            if (this.currentState === 'listening') {
                this.headGroup.rotation.z = Math.sin(time * 3) * 0.05 + 0.1; // Interested tilt
            } else if (this.currentState === 'thinking') {
                this.headGroup.rotation.x = -0.2; // Thinking look up
                this.headGroup.rotation.y = Math.sin(time * 2) * 0.2;
            } else if (this.currentState === 'alert') {
                this.headGroup.rotation.x = 0.15; // Alert posture
            } else {
                this.headGroup.rotation.z = THREE.MathUtils.lerp(this.headGroup.rotation.z, 0, 0.05);
            }
        }

        // 5. Real-Time Viseme Mouth Animation Smoothing
        if (this.mouthMesh) {
            let scaleX = 1.0;
            let scaleY = 1.0;

            if (this.targetViseme === 'aa') {
                scaleX = 1.2;
                scaleY = 1.0 + this.visemeIntensity * 2.5;
            } else if (this.targetViseme === 'oh' || this.targetViseme === 'ou') {
                scaleX = 0.7;
                scaleY = 1.0 + this.visemeIntensity * 2.0;
            } else if (this.targetViseme === 'ee' || this.targetViseme === 'ih') {
                scaleX = 1.5;
                scaleY = 0.8 + this.visemeIntensity * 0.5;
            }

            this.mouthMesh.scale.x = THREE.MathUtils.lerp(this.mouthMesh.scale.x, scaleX, 0.2);
            this.mouthMesh.scale.y = THREE.MathUtils.lerp(this.mouthMesh.scale.y, scaleY, 0.2);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global reference
window.persona3D = null;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        window.persona3D = new Persona3DManager('avatar-3d-canvas');
    }
});
