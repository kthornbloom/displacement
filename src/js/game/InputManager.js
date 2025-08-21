export class InputManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.canvas = document.getElementById('game-canvas');
        
        // Touch/Mouse state
        this.isDragging = false;
        this.isRotatingCube = false;
        this.lastTouch = { x: 0, y: 0 };
        this.startTouch = { x: 0, y: 0 };
        this.dragStartTime = 0;
        
        // Swipe detection
        this.minSwipeDistance = 50;
        this.maxSwipeTime = 300;
        
        // Pinch zoom
        this.initialPinchDistance = 0;
        this.currentPinchDistance = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    onPointerDown(event) {
        event.preventDefault();
        this.startDrag(event.clientX, event.clientY);
    }

    onPointerMove(event) {
        event.preventDefault();
        if (this.isDragging) {
            this.handleDrag(event.clientX, event.clientY);
        }
    }

    onPointerUp(event) {
        event.preventDefault();
        this.endDrag(event.clientX, event.clientY);
    }

    onWheel(event) {
        event.preventDefault();
        const delta = event.deltaY * 0.01;
        this.gameEngine.zoom(delta);
    }

    onTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            // Single touch - potential swipe or drag
            const touch = event.touches[0];
            this.startDrag(touch.clientX, touch.clientY);
        } else if (event.touches.length === 2) {
            // Two touches - pinch to zoom
            this.startPinch(event.touches);
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1 && this.isDragging) {
            // Single touch drag
            const touch = event.touches[0];
            this.handleDrag(touch.clientX, touch.clientY);
        } else if (event.touches.length === 2) {
            // Pinch zoom
            this.handlePinch(event.touches);
        }
    }

    onTouchEnd(event) {
        event.preventDefault();
        
        if (event.touches.length === 0) {
            // All touches ended
            if (this.isDragging) {
                const lastTouch = this.lastTouch;
                this.endDrag(lastTouch.x, lastTouch.y);
            }
            this.endPinch();
        } else if (event.touches.length === 1) {
            // One touch ended, switch to single touch mode
            const touch = event.touches[0];
            this.startDrag(touch.clientX, touch.clientY);
        }
    }

    startDrag(x, y) {
        this.isDragging = true;
        this.startTouch = { x, y };
        this.lastTouch = { x, y };
        this.dragStartTime = Date.now();
        this.isRotatingCube = false;
    }

    handleDrag(x, y) {
        if (!this.isDragging) return;
        
        const deltaX = x - this.lastTouch.x;
        const deltaY = y - this.lastTouch.y;
        
        // Determine if this is a cube rotation or scene rotation
        if (!this.isRotatingCube) {
            // Check if we're clicking on the cube
            const isOnCube = this.isPointOnCube(x, y);
            
            if (isOnCube) {
                this.isRotatingCube = true;
            }
        }
        
        if (this.isRotatingCube) {
            // Rotate cube faces
            this.handleCubeRotation(deltaX, deltaY);
        } else {
            // Rotate scene
            this.gameEngine.rotateScene(deltaX, deltaY);
        }
        
        this.lastTouch = { x, y };
    }

    endDrag(x, y) {
        if (!this.isDragging) return;
        
        const deltaX = x - this.startTouch.x;
        const deltaY = y - this.startTouch.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const time = Date.now() - this.dragStartTime;
        
        // Check if this was a swipe (quick, long movement)
        if (distance > this.minSwipeDistance && time < this.maxSwipeTime) {
            this.handleSwipe(deltaX, deltaY);
        }
        
        this.isDragging = false;
        this.isRotatingCube = false;
    }

    handleCubeRotation(deltaX, deltaY) {
        // Determine which slice to rotate based on movement direction and starting position
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // Get the starting touch position to determine which slice
        const startX = this.startTouch.x;
        const startY = this.startTouch.y;
        
        // Determine if this is a horizontal or vertical slice rotation
        if (absX > absY) {
            // Horizontal slice rotation
            const slice = this.getHorizontalSlice(startY);
            const direction = deltaX > 0 ? 1 : -1;
            this.gameEngine.rotateSlice(slice, direction);
        } else {
            // Vertical slice rotation
            const slice = this.getVerticalSlice(startX);
            const direction = deltaY > 0 ? 1 : -1;
            this.gameEngine.rotateSlice(slice, direction);
        }
    }

    getHorizontalSlice(y) {
        // Determine which horizontal slice based on Y position
        const centerY = window.innerHeight / 2;
        const relativeY = y - centerY;
        
        if (relativeY < -100) return 'top';
        else if (relativeY > 100) return 'bottom';
        else return 'middle';
    }

    getVerticalSlice(x) {
        // Determine which vertical slice based on X position
        const centerX = window.innerWidth / 2;
        const relativeX = x - centerX;
        
        if (relativeX < -100) return 'left';
        else if (relativeX > 100) return 'right';
        else return 'middle';
    }

    handleSwipe(deltaX, deltaY) {
        // Handle swipe gestures for cube rotation
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
            // Horizontal swipe
            const face = deltaX > 0 ? 'right' : 'left';
            const direction = deltaX > 0 ? 1 : -1;
            this.gameEngine.rotateFace(face, direction);
        } else {
            // Vertical swipe
            const face = deltaY > 0 ? 'bottom' : 'top';
            const direction = deltaY > 0 ? 1 : -1;
            this.gameEngine.rotateFace(face, direction);
        }
    }

    startPinch(touches) {
        this.initialPinchDistance = this.getDistance(touches[0], touches[1]);
        this.currentPinchDistance = this.initialPinchDistance;
    }

    handlePinch(touches) {
        if (touches.length !== 2) return;
        
        this.currentPinchDistance = this.getDistance(touches[0], touches[1]);
        const delta = this.currentPinchDistance - this.initialPinchDistance;
        const zoomDelta = delta * 0.01;
        
        this.gameEngine.zoom(zoomDelta);
    }

    endPinch() {
        this.initialPinchDistance = 0;
        this.currentPinchDistance = 0;
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isPointOnCube(x, y) {
        // Simple check to see if the point is in the center area of the screen
        // This is a simplified version - a more accurate version would use raycasting
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const cubeSize = 200; // Approximate cube size in pixels
        
        const distanceX = Math.abs(x - centerX);
        const distanceY = Math.abs(y - centerY);
        
        return distanceX < cubeSize && distanceY < cubeSize;
    }

    // Utility methods
    getCanvas() {
        return this.canvas;
    }

    isDragging() {
        return this.isDragging;
    }

    isRotatingCube() {
        return this.isRotatingCube;
    }
} 