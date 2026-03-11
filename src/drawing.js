export class DrawingManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = [];
        this.history = [[]]; // Start with empty state
        this.historyIndex = 0;
        this.isDrawing = false;
        this.lastPoint = null;
        this.startPoint = null;
        this.currentPoint = null;
        this.drawMode = 'free'; // 'free', 'straight', or 'eraser'
        this.eraseRadius = 20;
    }

    setDrawMode(mode) {
        this.drawMode = mode;
    }

    saveState() {
        // If we're not at the end of the history (due to undos), truncate the redo part
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push([...this.lines.map(l => ({ ...l }))]);
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.lines = [...this.history[this.historyIndex].map(l => ({ ...l }))];
            return true;
        }
        return false;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.lines = [...this.history[this.historyIndex].map(l => ({ ...l }))];
            return true;
        }
        return false;
    }

    startDrawing(x, y, camera) {
        this.isDrawing = true;
        const point = { x: x + camera.x, y: y + camera.y };
        this.lastPoint = point;
        this.startPoint = point;
        this.currentPoint = point;

        if (this.drawMode === 'eraser') {
            this.eraseAt(point.x, point.y);
        }
    }

    draw(x, y, camera) {
        if (!this.isDrawing) return;

        const currentPoint = { x: x + camera.x, y: y + camera.y };
        this.currentPoint = currentPoint;
        
        if (this.drawMode === 'free') {
            // Only add line if moved enough
            const dist = Math.hypot(currentPoint.x - this.lastPoint.x, currentPoint.y - this.lastPoint.y);
            if (dist > 5) {
                this.lines.push({
                    x1: this.lastPoint.x,
                    y1: this.lastPoint.y,
                    x2: currentPoint.x,
                    y2: currentPoint.y
                });
                this.lastPoint = currentPoint;
            }
        } else if (this.drawMode === 'eraser') {
            this.eraseAt(currentPoint.x, currentPoint.y);
        }
    }

    eraseAt(x, y) {
        const initialCount = this.lines.length;
        this.lines = this.lines.filter(line => {
            // Distance from point to line segment
            const dist = this.distToSegment({ x, y }, { x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 });
            return dist > this.eraseRadius;
        });
    }

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    stopDrawing() {
        if (!this.isDrawing) return;

        if (this.drawMode === 'straight' && this.startPoint && this.currentPoint) {
            const dist = Math.hypot(this.currentPoint.x - this.startPoint.x, this.currentPoint.y - this.startPoint.y);
            if (dist > 5) {
                this.lines.push({
                    x1: this.startPoint.x,
                    y1: this.startPoint.y,
                    x2: this.currentPoint.x,
                    y2: this.currentPoint.y
                });
            }
        }

        // Save state for undo/redo
        this.saveState();

        this.isDrawing = false;
        this.lastPoint = null;
        this.startPoint = null;
        this.currentPoint = null;
    }

    clear() {
        this.lines = [];
        this.saveState();
    }

    render(ctx, camera) {
        ctx.strokeStyle = '#52525b'; // zinc-600
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (const line of this.lines) {
            ctx.beginPath();
            ctx.moveTo(line.x1 - camera.x, line.y1 - camera.y);
            ctx.lineTo(line.x2 - camera.x, line.y2 - camera.y);
            ctx.stroke();
        }

        // Render preview for straight line
        if (this.isDrawing && this.drawMode === 'straight' && this.startPoint && this.currentPoint) {
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)'; // emerald-500 with opacity
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.startPoint.x - camera.x, this.startPoint.y - camera.y);
            ctx.lineTo(this.currentPoint.x - camera.x, this.currentPoint.y - camera.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Render eraser preview
        if (this.drawMode === 'eraser' && this.currentPoint && !this.isDrawing) {
            ctx.beginPath();
            ctx.arc(this.currentPoint.x - camera.x, this.currentPoint.y - camera.y, this.eraseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // red-500
            ctx.stroke();
        }
    }
}
