export class DrawingManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = [];
        this.isDrawing = false;
        this.lastPoint = null;
        this.startPoint = null;
        this.currentPoint = null;
        this.drawMode = 'free'; // 'free' or 'straight'
    }

    setDrawMode(mode) {
        this.drawMode = mode;
    }

    startDrawing(x, y, camera) {
        this.isDrawing = true;
        const point = { x: x + camera.x, y: y + camera.y };
        this.lastPoint = point;
        this.startPoint = point;
        this.currentPoint = point;
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
        }
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

        this.isDrawing = false;
        this.lastPoint = null;
        this.startPoint = null;
        this.currentPoint = null;
    }

    clear() {
        this.lines = [];
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
    }
}
