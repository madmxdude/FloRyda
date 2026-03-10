import { DrawingManager } from './drawing.js';
import { Rider } from './rider.js';
import { updatePhysics } from './physics.js';
import { UIManager } from './ui.js';
import { ChallengeManager } from './challengeMode.js';
import { login, onAuthChange, saveScore, getLeaderboard } from './firebase.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.camera = { x: 0, y: 0 };
        this.isPlaying = false;
        this.mode = 'freeplay'; // 'freeplay' or 'challenge'
        this.drawMode = 'free'; // 'free' or 'straight'
        this.currentChallenge = null;
        this.user = null;

        this.drawingManager = new DrawingManager(this.canvas);
        this.rider = new Rider(100, 100);
        this.challengeManager = new ChallengeManager();
        this.challenges = this.challengeManager.tracks;
        this.isLoggingIn = false;
        this.ui = new UIManager(this);

        this.setupCanvas();
        this.setupInput();
        this.setupAuth();
        
        this.loop();
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    setupInput() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isPlaying) return;
            this.drawingManager.startDrawing(e.clientX, e.clientY, this.camera);
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPlaying) return;
            this.drawingManager.draw(e.clientX, e.clientY, this.camera);
        });

        window.addEventListener('mouseup', () => {
            this.drawingManager.stopDrawing();
        });

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.isPlaying) return;
            const touch = e.touches[0];
            this.drawingManager.startDrawing(touch.clientX, touch.clientY, this.camera);
        });

        window.addEventListener('touchmove', (e) => {
            if (this.isPlaying) return;
            const touch = e.touches[0];
            this.drawingManager.draw(touch.clientX, touch.clientY, this.camera);
        });

        window.addEventListener('touchend', () => {
            this.drawingManager.stopDrawing();
        });
    }

    setupAuth() {
        onAuthChange((user) => {
            this.user = user;
            this.updateUI();
        });
    }

    async handleLogin() {
        if (this.isLoggingIn) return;
        this.isLoggingIn = true;
        try {
            const user = await login();
            if (user) {
                this.user = user;
                this.updateUI();
            }
        } catch (error) {
            console.warn('Login attempt failed or cancelled:', error.message);
        } finally {
            this.isLoggingIn = false;
            this.updateUI();
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        this.updateUI();
    }

    reset() {
        this.isPlaying = false;
        this.rider.reset();
        this.camera = { x: 0, y: 0 };
        this.updateUI();
    }

    clear() {
        if (this.mode === 'challenge') {
            alert('Cannot clear lines in Challenge Mode!');
            return;
        }
        this.drawingManager.clear();
        this.reset();
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'freeplay') {
            this.currentChallenge = null;
            this.drawingManager.clear();
            this.rider.setStart(100, 100);
        }
        this.reset();
    }

    setDrawMode(mode) {
        this.drawMode = mode;
        this.drawingManager.setDrawMode(mode);
        this.updateUI();
    }

    startChallenge(id) {
        this.mode = 'challenge';
        this.currentChallenge = this.challengeManager.loadTrack(id, this.rider, this.drawingManager);
        this.reset();
    }

    async loadLeaderboardData() {
        if (!this.currentChallenge) return [];
        return await getLeaderboard(this.currentChallenge.id);
    }

    updateUI() {
        this.ui.update({
            isPlaying: this.isPlaying,
            score: this.rider.distance,
            mode: this.mode,
            challengeName: this.currentChallenge?.name || '',
            user: this.user,
            isLoggingIn: this.isLoggingIn,
            drawMode: this.drawMode
        });
    }

    handleCrash() {
        this.isPlaying = false;
        this.ui.showMessage('Crashed!', `You traveled ${this.rider.distance.toFixed(1)}m before hitting the ground.`);
        
        if (this.mode === 'challenge' && this.user) {
            saveScore(this.currentChallenge.id, this.rider.distance);
        }
    }

    handleWin() {
        this.isPlaying = false;
        this.ui.showMessage('Victory!', `You completed ${this.currentChallenge.name}! Distance: ${this.rider.distance.toFixed(1)}m`);
        
        if (this.user) {
            saveScore(this.currentChallenge.id, this.rider.distance);
        }
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid Background
        this.drawGrid();

        if (this.isPlaying) {
            const onGround = updatePhysics(this.rider, this.drawingManager.lines);
            
            // Camera follow
            this.camera.x = this.rider.x - this.canvas.width / 2;
            this.camera.y = this.rider.y - this.canvas.height / 2;

            // Check for crash (too much fall or out of bounds)
            if (this.rider.y > 2000) {
                this.handleCrash();
            }

            // Check for win in challenge mode
            if (this.mode === 'challenge' && this.challengeManager.checkWin(this.rider)) {
                this.handleWin();
            }

            this.updateUI();
        }

        this.drawingManager.render(this.ctx, this.camera);
        this.rider.draw(this.ctx, this.camera);

        requestAnimationFrame(() => this.loop());
    }

    drawGrid() {
        const size = 50;
        const offsetX = -this.camera.x % size;
        const offsetY = -this.camera.y % size;

        this.ctx.strokeStyle = '#18181b'; // zinc-900
        this.ctx.lineWidth = 1;

        for (let x = offsetX; x < this.canvas.width; x += size) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = offsetY; y < this.canvas.height; y += size) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}

// Start Game
new Game();
