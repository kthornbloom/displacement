import * as THREE from 'three';

export class RubiksCube {
    constructor(gltf, gameEngine) {
        this.gltf = gltf;
        this.gameEngine = gameEngine;
        this.group = new THREE.Group();
        
        // Cube state - 3x3x3 structure
        this.cubeState = this.initializeCubeState();
        
        // Animation settings
        this.animationDuration = 300; // milliseconds
        this.isAnimating = false;
        
        // Initialize faces object
        this.faces = {
            front: [],
            back: [],
            top: [],
            bottom: [],
            left: [],
            right: []
        };
        
        this.setupCube();
        
        console.log('About to scramble cube...');
        // Scramble the cube to start in a random state
        this.scrambleCube();
        console.log('Scramble complete!');
    }

    initializeCubeState() {
        // Initialize a solved 3x3 cube state
        // Each face is represented as a 3x3 grid
        const faces = ['front', 'back', 'top', 'bottom', 'left', 'right'];
        const state = {};
        
        faces.forEach(face => {
            state[face] = Array(3).fill().map(() => Array(3).fill(face));
        });
        
        return state;
    }

    setupCube() {
        console.log('Setting up cube from GLTF:', this.gltf);
        
        // Clone the GLTF scene
        const model = this.gltf.scene.clone();
        console.log('Cloned model:', model);
        
        // Organize cube pieces by their names
        this.pieces = {};
        this.faces = {
            front: [],
            back: [],
            top: [],
            bottom: [],
            left: [],
            right: []
        };
        
        let meshCount = 0;
        model.traverse((child) => {
            console.log('Traversing child:', child.name, child.type);
            if (child.isMesh) {
                meshCount++;
                const pieceName = child.name;
                console.log('Found mesh piece:', pieceName);
                this.pieces[pieceName] = child;
                
                // Categorize pieces by their position
                this.categorizePiece(pieceName, child);
                
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        console.log(`Found ${meshCount} mesh objects`);
        this.group.add(model);
        
        console.log('Cube pieces organized:', this.pieces);
        console.log('Faces organized:', this.faces);
    }

    categorizePiece(pieceName, mesh) {
        console.log('Categorizing piece:', pieceName, 'faces object:', this.faces);
        
        // Ensure faces object exists
        if (!this.faces) {
            console.error('this.faces is undefined!');
            this.faces = {
                front: [],
                back: [],
                top: [],
                bottom: [],
                left: [],
                right: []
            };
        }
        
        // Categorize pieces based on their names (a1, a2, etc.)
        if (pieceName.startsWith('a')) {
            console.log(`Adding ${pieceName} to top face`);
            this.faces.top.push(pieceName);
        } else if (pieceName.startsWith('b')) {
            console.log(`Adding ${pieceName} to front face`);
            // For now, put all middle pieces in front face
            this.faces.front.push(pieceName);
        } else if (pieceName.startsWith('c')) {
            console.log(`Adding ${pieceName} to bottom face`);
            this.faces.bottom.push(pieceName);
        } else if (pieceName === 'center') {
            console.log(`Center piece ${pieceName} - not categorizing`);
            // Center piece doesn't move
        } else {
            console.log(`Unknown piece name: ${pieceName} - not categorizing`);
        }
        
        console.log(`Categorized piece ${pieceName} into faces:`, this.faces);
    }

    async rotateFace(face, direction) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Get pieces for the face
        const facePieces = this.getFacePieces(face);
        if (!facePieces) {
            this.isAnimating = false;
            return;
        }
        
        // Create rotation group at the cube center
        const rotationGroup = new THREE.Group();
        rotationGroup.position.set(0, 0, 0);
        
        // Store original world positions and add pieces to rotation group
        const pieceData = [];
        facePieces.forEach(pieceName => {
            const piece = this.pieces[pieceName];
            if (piece) {
                // Get the piece's world position before moving it
                const worldPosition = piece.getWorldPosition(new THREE.Vector3());
                pieceData.push({ piece, originalPosition: worldPosition.clone() });
                
                // Remove from main group and add to rotation group
                this.group.remove(piece);
                rotationGroup.add(piece);
                
                // Set the piece's position relative to the rotation group
                piece.position.copy(worldPosition);
            }
        });
        
        this.group.add(rotationGroup);
        
        // Animate rotation
        await this.animateRotation(rotationGroup, face, direction);
        
        // Update cube state
        this.updateCubeState(face, direction);
        
        // Return pieces to main group with their new positions
        pieceData.forEach(({ piece, originalPosition }) => {
            rotationGroup.remove(piece);
            
            // Get the piece's new world position after rotation
            const newWorldPosition = piece.getWorldPosition(new THREE.Vector3());
            piece.position.copy(newWorldPosition);
            
            this.group.add(piece);
        });
        
        this.group.remove(rotationGroup);
        this.isAnimating = false;
    }

    async rotateSlice(slice, direction) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Get pieces for the slice
        const slicePieces = this.getSlicePieces(slice);
        if (!slicePieces || slicePieces.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        console.log(`Rotating slice: ${slice}, direction: ${direction}, pieces:`, slicePieces);
        
        // Create rotation group at the cube center
        const rotationGroup = new THREE.Group();
        rotationGroup.position.set(0, 0, 0);
        
        // Store original world positions and add pieces to rotation group
        const pieceData = [];
        slicePieces.forEach(pieceName => {
            const piece = this.pieces[pieceName];
            if (piece) {
                // Get the piece's world position before moving it
                const worldPosition = piece.getWorldPosition(new THREE.Vector3());
                pieceData.push({ piece, originalPosition: worldPosition.clone() });
                
                // Remove from main group and add to rotation group
                this.group.remove(piece);
                rotationGroup.add(piece);
                
                // Set the piece's position relative to the rotation group
                piece.position.copy(worldPosition);
            }
        });
        
        this.group.add(rotationGroup);
        
        // Animate rotation
        await this.animateSliceRotation(rotationGroup, slice, direction);
        
        // Update cube state
        this.updateSliceState(slice, direction);
        
        // Return pieces to main group with their new positions
        pieceData.forEach(({ piece, originalPosition }) => {
            rotationGroup.remove(piece);
            
            // Get the piece's new world position after rotation
            const newWorldPosition = piece.getWorldPosition(new THREE.Vector3());
            piece.position.copy(newWorldPosition);
            
            this.group.add(piece);
        });
        
        this.group.remove(rotationGroup);
        this.isAnimating = false;
    }

    // Rotate visual pieces without animation (for initialization)
    rotateVisualPieces(face, direction) {
        console.log(`Rotating visual pieces for face: ${face}, direction: ${direction}`);
        
        // Get pieces for the face
        const facePieces = this.getFacePieces(face);
        if (!facePieces || facePieces.length === 0) {
            console.log('No pieces found for face:', face);
            return;
        }
        
        console.log('Pieces to rotate:', facePieces);
        
        // Create rotation group at the cube center
        const rotationGroup = new THREE.Group();
        rotationGroup.position.set(0, 0, 0);
        
        // Add pieces to rotation group
        facePieces.forEach(pieceName => {
            const piece = this.pieces[pieceName];
            if (piece) {
                // Remove from main group and add to rotation group
                this.group.remove(piece);
                rotationGroup.add(piece);
            }
        });
        
        this.group.add(rotationGroup);
        
        // Apply immediate rotation (no animation)
        const rotationAngle = Math.PI / 2 * direction;
        switch (face) {
            case 'top':
                rotationGroup.rotation.x = rotationAngle;
                break;
            case 'bottom':
                rotationGroup.rotation.x = -rotationAngle;
                break;
            case 'front':
                rotationGroup.rotation.z = rotationAngle;
                break;
            case 'back':
                rotationGroup.rotation.z = -rotationAngle;
                break;
            case 'left':
                rotationGroup.rotation.y = rotationAngle;
                break;
            case 'right':
                rotationGroup.rotation.y = -rotationAngle;
                break;
        }
        
        // Return pieces to main group
        while (rotationGroup.children.length > 0) {
            const piece = rotationGroup.children[0];
            rotationGroup.remove(piece);
            this.group.add(piece);
        }
        
        this.group.remove(rotationGroup);
        
        console.log('Visual rotation complete');
    }

    getFacePieces(face) {
        // Map face names to piece collections
        const faceMap = {
            'top': this.faces.top,
            'bottom': this.faces.bottom,
            'front': this.faces.front,
            'back': this.faces.back,
            'left': this.faces.left,
            'right': this.faces.right
        };
        
        return faceMap[face] || [];
    }

    getSlicePieces(slice) {
        // Map slice names to piece collections
        const sliceMap = {
            'top': this.faces.top,
            'bottom': this.faces.bottom,
            'middle': this.faces.front, // For now, use front face as middle slice
            'left': this.faces.left,
            'right': this.faces.right
        };
        
        return sliceMap[slice] || [];
    }

    async animateSliceRotation(rotationGroup, slice, direction) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const targetRotation = Math.PI / 2 * direction; // 90 degrees
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.animationDuration, 1);
                
                // Easing function for smooth animation
                const easedProgress = this.easeInOutCubic(progress);
                const currentRotation = targetRotation * easedProgress;
                
                // Apply rotation based on slice
                switch (slice) {
                    case 'top':
                        rotationGroup.rotation.x = currentRotation;
                        break;
                    case 'bottom':
                        rotationGroup.rotation.x = -currentRotation;
                        break;
                    case 'middle':
                        rotationGroup.rotation.z = currentRotation;
                        break;
                    case 'left':
                        rotationGroup.rotation.y = currentRotation;
                        break;
                    case 'right':
                        rotationGroup.rotation.y = -currentRotation;
                        break;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    updateSliceState(slice, direction) {
        // Update the internal cube state representation for slice rotation
        // This is a simplified version - would need proper slice state tracking
        console.log(`Updating slice state: ${slice}, direction: ${direction}`);
    }

    async animateRotation(rotationGroup, face, direction) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const targetRotation = Math.PI / 2 * direction; // 90 degrees
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.animationDuration, 1);
                
                // Easing function for smooth animation
                const easedProgress = this.easeInOutCubic(progress);
                const currentRotation = targetRotation * easedProgress;
                
                // Apply rotation based on face
                switch (face) {
                    case 'top':
                        rotationGroup.rotation.x = currentRotation;
                        break;
                    case 'bottom':
                        rotationGroup.rotation.x = -currentRotation;
                        break;
                    case 'front':
                        rotationGroup.rotation.z = currentRotation;
                        break;
                    case 'back':
                        rotationGroup.rotation.z = -currentRotation;
                        break;
                    case 'left':
                        rotationGroup.rotation.y = currentRotation;
                        break;
                    case 'right':
                        rotationGroup.rotation.y = -currentRotation;
                        break;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    updateCubeState(face, direction) {
        // Update the internal cube state representation
        // This is a simplified version - a full implementation would track all face colors
        const faceState = this.cubeState[face];
        if (!faceState) return;
        
        // Rotate the face state
        if (direction === 1) {
            // Clockwise rotation
            this.rotateFaceClockwise(faceState);
        } else {
            // Counter-clockwise rotation
            this.rotateFaceCounterClockwise(faceState);
        }
    }

    rotateFaceClockwise(faceState) {
        // Rotate 3x3 face clockwise
        const temp = faceState[0][0];
        faceState[0][0] = faceState[2][0];
        faceState[2][0] = faceState[2][2];
        faceState[2][2] = faceState[0][2];
        faceState[0][2] = temp;
        
        const temp2 = faceState[0][1];
        faceState[0][1] = faceState[1][0];
        faceState[1][0] = faceState[2][1];
        faceState[2][1] = faceState[1][2];
        faceState[1][2] = temp2;
    }

    rotateFaceCounterClockwise(faceState) {
        // Rotate 3x3 face counter-clockwise
        const temp = faceState[0][0];
        faceState[0][0] = faceState[0][2];
        faceState[0][2] = faceState[2][2];
        faceState[2][2] = faceState[2][0];
        faceState[2][0] = temp;
        
        const temp2 = faceState[0][1];
        faceState[0][1] = faceState[1][2];
        faceState[1][2] = faceState[2][1];
        faceState[2][1] = faceState[1][0];
        faceState[1][0] = temp2;
    }

    isSolved() {
        // Check if all faces are solved (all pieces on each face have the same color)
        const faces = ['front', 'back', 'top', 'bottom', 'left', 'right'];
        
        for (const face of faces) {
            const faceState = this.cubeState[face];
            if (!faceState) continue;
            
            const firstColor = faceState[0][0];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (faceState[i][j] !== firstColor) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    // Utility methods
    getPiece(name) {
        return this.pieces[name];
    }

    getAllPieces() {
        return this.pieces;
    }

    getCubeState() {
        return this.cubeState;
    }

    // Scramble the cube on initialization
    scrambleCube() {
        console.log('Doing one top rotation...');
        console.log('Cube state before:', JSON.stringify(this.cubeState));
        
        // Actually rotate the visual pieces
        this.rotateVisualPieces('top', 1);
        
        // Update the internal state
        this.updateCubeState('top', 1);
        
        console.log('Cube state after:', JSON.stringify(this.cubeState));
        console.log('Top rotation applied!');
    }

    // Debug method to scramble the cube
    scramble(moves = 20) {
        const faces = ['top', 'bottom', 'front', 'back', 'left', 'right'];
        const directions = [-1, 1];
        
        for (let i = 0; i < moves; i++) {
            const randomFace = faces[Math.floor(Math.random() * faces.length)];
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            this.rotateFace(randomFace, randomDirection);
        }
    }
} 