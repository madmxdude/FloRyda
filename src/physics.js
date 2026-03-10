export const GRAVITY = 0.25;
export const FRICTION = 0.98;
export const BOUNCE = 0.2;

export function checkCollision(rider, line) {
    const { x, y, vx, vy, radius } = rider;
    const { x1, y1, x2, y2 } = line;

    // Vector from line start to end
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLenSq = dx * dx + dy * dy;

    // Project rider onto line
    let t = ((x - x1) * dx + (y - y1) * dy) / lineLenSq;
    t = Math.max(0, Math.min(1, t));

    // Closest point on line
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    // Distance to closest point
    const distDx = x - closestX;
    const distDy = y - closestY;
    const distSq = distDx * distDx + distDy * distDy;

    if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        const nx = distDx / dist; // Normal X
        const ny = distDy / dist; // Normal Y

        // Resolve overlap
        const overlap = radius - dist;
        
        // Only collide if moving towards the line
        const dot = vx * nx + vy * ny;
        if (dot < 0) {
            return {
                collided: true,
                nx, ny,
                overlap,
                closestX, closestY
            };
        }
    }

    return { collided: false };
}

export function updatePhysics(rider, lines) {
    // Apply gravity
    rider.vy += GRAVITY;

    // Apply velocity
    rider.x += rider.vx;
    rider.y += rider.vy;

    let onGround = false;

    // Check collisions with all lines
    for (const line of lines) {
        const collision = checkCollision(rider, line);
        if (collision.collided) {
            // Push out of line
            rider.x += collision.nx * collision.overlap;
            rider.y += collision.ny * collision.overlap;

            // Reflect velocity
            const dot = rider.vx * collision.nx + rider.vy * collision.ny;
            rider.vx -= (1 + BOUNCE) * dot * collision.nx;
            rider.vy -= (1 + BOUNCE) * dot * collision.ny;

            // Apply friction along the line
            rider.vx *= FRICTION;
            rider.vy *= FRICTION;
            
            onGround = true;
        }
    }

    // Update distance traveled (score)
    if (rider.vx > 0.1) {
        rider.distance += rider.vx / 10;
    }

    return onGround;
}
