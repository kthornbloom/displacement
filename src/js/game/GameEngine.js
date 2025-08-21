import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RubiksCube } from './RubiksCube.js';
import { InputManager } from './InputManager.js';

export class GameEngine {
    constructor(app) {
        this.app = app;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.rubiksCube = null;
        this.inputManager = null;
        this.animationId = null;
        this.isAnimating = false;
        
        // Camera settings
        this.cameraDistance = 8;
        this.minZoom = 3;
        this.maxZoom = 15;
        
        // Scene rotation - start with a nice corner view
        this.sceneRotation = {
            x: 0.3,  // Slight upward tilt
            y: 0.8   // Rotated to show corner
        };
        
        // Game state
        this.currentLevel = null;
        this.moveCount = 0;
        this.startTime = null;
        this.isPlaying = false;
    }

    async init() {
        console.log('Initializing Game Engine...');
        
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupInputManager();
        
        // Start render loop (but don't animate cube until it's loaded)
        this.animate();
        
        console.log('Game Engine initialized');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        
        // Position camera to show a corner of the cube
        this.camera.position.set(this.cameraDistance * 0.7, this.cameraDistance * 0.7, this.cameraDistance * 0.7);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light for better cube visibility
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);
    }

    setupInputManager() {
        this.inputManager = new InputManager(this);
    }

    async loadLevel(levelData) {
        console.log('Loading level:', levelData);
        
        this.currentLevel = levelData;
        this.moveCount = 0;
        this.startTime = Date.now();
        this.isPlaying = true;
        
        // Clear existing cube
        if (this.rubiksCube) {
            this.scene.remove(this.rubiksCube.group);
        }
        
        // Load 3D model
        await this.loadModel(levelData.modelPath);
        
        // Update UI
        this.app.getUIManager().updateMoveCount(this.moveCount);
        this.app.getUIManager().startTimer();
    }

    async loadModel(modelPath) {
        return new Promise((resolve, reject) => {
            console.log('Starting to load model from:', modelPath);
            const loader = new GLTFLoader();
            
            loader.load(
                modelPath,
                (gltf) => {
                    console.log('Model loaded successfully:', gltf);
                    console.log('Model scene children:', gltf.scene.children);
                    this.createRubiksCube(gltf);
                    resolve();
                },
                (progress) => {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.error('Error loading model:', error);
                    console.error('Model path was:', modelPath);
                    reject(error);
                }
            );
        });
    }

    createRubiksCube(gltf) {
        console.log('Creating RubiksCube from GLTF:', gltf);
        this.rubiksCube = new RubiksCube(gltf, this);
        console.log('RubiksCube created:', this.rubiksCube);
        this.scene.add(this.rubiksCube.group);
        
        // Position cube at center
        this.rubiksCube.group.position.set(0, 0, 0);
        console.log('Cube added to scene at position:', this.rubiksCube.group.position);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update scene rotation only if cube exists and is properly initialized
        if (this.rubiksCube && this.rubiksCube.group && this.rubiksCube.group.rotation) {
            this.rubiksCube.group.rotation.x = this.sceneRotation.x;
            this.rubiksCube.group.rotation.y = this.sceneRotation.y;
        } else {
            // Debug: log when cube is not ready
            if (!this.rubiksCube) {
                console.log('Cube not loaded yet...');
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    // Cube manipulation methods
    async rotateFace(face, direction) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.moveCount++;
        
        // Update UI
        this.app.getUIManager().updateMoveCount(this.moveCount);
        
        // Perform rotation
        await this.rubiksCube.rotateFace(face, direction);
        
        this.isAnimating = false;
        
        // Check if puzzle is solved
        if (this.rubiksCube.isSolved()) {
            this.onPuzzleSolved();
        }
    }

    async rotateSlice(slice, direction) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.moveCount++;
        
        // Update UI
        this.app.getUIManager().updateMoveCount(this.moveCount);
        
        // Perform slice rotation
        await this.rubiksCube.rotateSlice(slice, direction);
        
        this.isAnimating = false;
        
        // Check if puzzle is solved
        if (this.rubiksCube.isSolved()) {
            this.onPuzzleSolved();
        }
    }

    // Scene rotation methods
    rotateScene(deltaX, deltaY) {
        this.sceneRotation.y += deltaX * 0.01;
        this.sceneRotation.x += deltaY * 0.01;
        
        // Clamp vertical rotation
        this.sceneRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.sceneRotation.x));
    }

    // Zoom methods
    zoom(delta) {
        const newDistance = this.camera.position.z + delta;
        if (newDistance >= this.minZoom && newDistance <= this.maxZoom) {
            this.camera.position.z = newDistance;
        }
    }

    onPuzzleSolved() {
        this.isPlaying = false;
        const endTime = Date.now();
        const timeElapsed = endTime - this.startTime;
        
        const stats = {
            moves: this.moveCount,
            time: timeElapsed,
            level: this.currentLevel.number
        };
        
        // Temporarily disable victory popup
        console.log('Level completed! Stats:', stats);
        // this.app.onLevelComplete(stats);
    }

    // Getters
    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    getRubiksCube() {
        return this.rubiksCube;
    }

    getMoveCount() {
        return this.moveCount;
    }

    getStartTime() {
        return this.startTime;
    }

    isPlaying() {
        return this.isPlaying;
    }
} 