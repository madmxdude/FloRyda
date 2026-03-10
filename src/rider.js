export class Rider {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.reset();
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.radius = 10;
        this.distance = 0;
        this.isCrashed = false;
        this.rotation = 0;
    }

    setStart(x, y) {
        this.startX = x;
        this.startY = y;
        this.reset();
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        ctx.translate(screenX, screenY);
        
        // Simple rotation based on velocity
        this.rotation = Math.atan2(this.vy, this.vx);
        ctx.rotate(this.rotation);

        // Draw Rider Body (Circle)
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isCrashed ? '#ef4444' : '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw "Face" direction
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius, 0);
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        ctx.restore();
    }
}
