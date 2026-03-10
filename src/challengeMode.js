import { CHALLENGE_TRACKS } from './tracks.js';

export class ChallengeManager {
    constructor() {
        this.tracks = CHALLENGE_TRACKS;
        this.currentTrack = null;
    }

    getTrack(id) {
        return this.tracks.find(t => t.id === id);
    }

    loadTrack(id, rider, drawingManager) {
        const track = this.getTrack(id);
        if (!track) return null;

        this.currentTrack = track;
        
        // Setup Rider
        rider.setStart(track.startPos.x, track.startPos.y);
        
        // Setup Lines
        drawingManager.clear();
        drawingManager.lines = [...track.lines];

        return track;
    }

    checkWin(rider) {
        if (!this.currentTrack) return false;
        return rider.distance >= this.currentTrack.targetDistance;
    }
}
