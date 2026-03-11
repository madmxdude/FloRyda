export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {
            playBtn: document.getElementById('btn-play'),
            resetBtn: document.getElementById('btn-reset'),
            clearBtn: document.getElementById('btn-clear'),
            freeplayBtn: document.getElementById('btn-freeplay'),
            challengeBtn: document.getElementById('btn-challenge'),
            leaderboardBtn: document.getElementById('btn-leaderboard'),
            scoreValue: document.getElementById('score-value'),
            scoreContainer: document.getElementById('score-container'),
            modeLabel: document.getElementById('game-mode-label'),
            centerMessage: document.getElementById('center-message'),
            messageTitle: document.getElementById('message-title'),
            messageBody: document.getElementById('message-body'),
            messageAction: document.getElementById('message-action'),
            loginBtn: document.getElementById('login-btn'),
            userName: document.getElementById('user-name'),
            challengeMenu: document.getElementById('challenge-menu'),
            challengeList: document.getElementById('challenge-list'),
            closeChallengeBtn: document.getElementById('close-challenge-menu'),
            leaderboardModal: document.getElementById('leaderboard-modal'),
            leaderboardContent: document.getElementById('leaderboard-content'),
            closeLeaderboardBtn: document.getElementById('close-leaderboard'),
            drawFreeBtn: document.getElementById('btn-draw-free'),
            drawStraightBtn: document.getElementById('btn-draw-straight'),
            drawEraserBtn: document.getElementById('btn-draw-eraser'),
            undoBtn: document.getElementById('btn-undo'),
            redoBtn: document.getElementById('btn-redo')
        };

        this.setupListeners();
    }

    setupListeners() {
        this.elements.playBtn.onclick = () => this.game.togglePlay();
        this.elements.resetBtn.onclick = () => this.game.reset();
        this.elements.clearBtn.onclick = () => this.game.clear();
        
        this.elements.freeplayBtn.onclick = () => this.game.setMode('freeplay');
        this.elements.challengeBtn.onclick = () => this.showChallengeMenu();
        
        this.elements.loginBtn.onclick = () => this.game.handleLogin();
        this.elements.messageAction.onclick = () => {
            this.hideMessage();
            this.game.reset();
        };

        this.elements.closeChallengeBtn.onclick = () => this.hideChallengeMenu();
        this.elements.leaderboardBtn.onclick = () => this.showLeaderboard();
        this.elements.closeLeaderboardBtn.onclick = () => this.hideLeaderboard();

        this.elements.drawFreeBtn.onclick = () => this.game.setDrawMode('free');
        this.elements.drawStraightBtn.onclick = () => this.game.setDrawMode('straight');
        this.elements.drawEraserBtn.onclick = () => this.game.setDrawMode('eraser');
        
        this.elements.undoBtn.onclick = () => this.game.undo();
        this.elements.redoBtn.onclick = () => this.game.redo();
    }

    update(state) {
        // Update Play/Pause icons
        document.getElementById('icon-play').classList.toggle('hidden', state.isPlaying);
        document.getElementById('icon-pause').classList.toggle('hidden', !state.isPlaying);

        // Update Score
        this.elements.scoreValue.innerText = `${state.score.toFixed(1)}m`;
        this.elements.scoreContainer.classList.toggle('hidden', state.mode === 'freeplay');

        // Update Mode Label
        this.elements.modeLabel.innerText = state.mode === 'freeplay' ? 'Free Play Mode' : `Challenge: ${state.challengeName}`;

        // Update Auth
        if (state.user) {
            this.elements.userName.innerText = state.user.displayName;
            this.elements.loginBtn.classList.add('hidden');
        } else {
            this.elements.userName.innerText = 'Guest';
            this.elements.loginBtn.classList.remove('hidden');
            this.elements.loginBtn.innerText = state.isLoggingIn ? 'Logging in...' : 'Login';
            this.elements.loginBtn.disabled = state.isLoggingIn;
        }

        // Active Mode Buttons
        this.elements.freeplayBtn.classList.toggle('bg-emerald-500', state.mode === 'freeplay');
        this.elements.freeplayBtn.classList.toggle('text-zinc-950', state.mode === 'freeplay');
        this.elements.challengeBtn.classList.toggle('bg-emerald-500', state.mode === 'challenge');
        this.elements.challengeBtn.classList.toggle('text-zinc-950', state.mode === 'challenge');

        // Active Drawing Mode Buttons
        this.elements.drawFreeBtn.classList.toggle('bg-emerald-500', state.drawMode === 'free');
        this.elements.drawFreeBtn.classList.toggle('text-zinc-950', state.drawMode === 'free');
        this.elements.drawStraightBtn.classList.toggle('bg-emerald-500', state.drawMode === 'straight');
        this.elements.drawStraightBtn.classList.toggle('text-zinc-950', state.drawMode === 'straight');
        this.elements.drawEraserBtn.classList.toggle('bg-emerald-500', state.drawMode === 'eraser');
        this.elements.drawEraserBtn.classList.toggle('text-zinc-950', state.drawMode === 'eraser');

        // Update Undo/Redo states
        this.elements.undoBtn.disabled = !state.canUndo;
        this.elements.redoBtn.disabled = !state.canRedo;
    }

    showMessage(title, body) {
        this.elements.messageTitle.innerText = title;
        this.elements.messageBody.innerText = body;
        this.elements.centerMessage.classList.remove('opacity-0', 'pointer-events-none');
    }

    hideMessage() {
        this.elements.centerMessage.classList.add('opacity-0', 'pointer-events-none');
    }

    showChallengeMenu() {
        const list = this.elements.challengeList;
        list.innerHTML = '';
        
        const challenges = this.game.challenges || [];
        challenges.forEach(track => {
            const card = document.createElement('div');
            card.className = 'bg-zinc-800/50 border border-white/5 p-6 rounded-2xl hover:border-emerald-500/50 transition-all cursor-pointer group';
            card.innerHTML = `
                <h3 class="text-xl font-bold mb-1 group-hover:text-emerald-400 transition-colors">${track.name}</h3>
                <p class="text-zinc-400 text-sm mb-4">${track.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Target: ${track.targetDistance}m</span>
                    <span class="text-emerald-400 font-bold text-sm">Play →</span>
                </div>
            `;
            card.onclick = () => {
                this.game.startChallenge(track.id);
                this.hideChallengeMenu();
            };
            list.appendChild(card);
        });

        this.elements.challengeMenu.classList.remove('hidden');
    }

    hideChallengeMenu() {
        this.elements.challengeMenu.classList.add('hidden');
    }

    async showLeaderboard() {
        if (this.game.mode !== 'challenge') {
            alert('Select a challenge first to view its leaderboard!');
            return;
        }

        this.elements.leaderboardModal.classList.remove('hidden');
        this.elements.leaderboardContent.innerHTML = '<div class="text-center py-8 text-zinc-500 italic">Loading scores...</div>';

        const scores = await this.game.loadLeaderboardData();
        this.elements.leaderboardContent.innerHTML = '';

        if (!scores || scores.length === 0) {
            this.elements.leaderboardContent.innerHTML = '<div class="text-center py-8 text-zinc-500 italic">No scores yet. Be the first!</div>';
            return;
        }

        scores.forEach((s, i) => {
            const row = document.createElement('div');
            row.className = 'flex justify-between items-center p-3 bg-zinc-800/30 rounded-xl border border-white/5';
            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-zinc-500 font-mono w-4">${i + 1}</span>
                    <span class="font-bold">${s.displayName}</span>
                </div>
                <span class="font-mono text-emerald-400 font-bold">${s.score.toFixed(1)}m</span>
            `;
            this.elements.leaderboardContent.appendChild(row);
        });
    }

    hideLeaderboard() {
        this.elements.leaderboardModal.classList.add('hidden');
    }
}
