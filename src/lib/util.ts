export function remap(
  value: number,
  lowIn: number,
  highIn: number,
  lowOut: number,
  highOut: number
): number {
  return lowOut + (value - lowIn) * ((highOut - lowOut) / (highIn - lowIn));
}

// Canvas utilities
export type Point = { x: number; y: number };
export type Curve = Point[];

export function drawPath(ctx: CanvasRenderingContext2D, coordinates: Point[]) {
  ctx.beginPath();
  for (const point of coordinates) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

export function drawPathQuad(ctx: CanvasRenderingContext2D, coordinates: Point[]) {
  ctx.beginPath();
  ctx.moveTo(coordinates[0].x, coordinates[0].y);
  for (let i = 0; i < coordinates.length - 1; i++) {
    // Line between points i and i+1
    const p = coordinates[i];
    const p_n = coordinates[i + 1];
    const x_c = 0.5 * (p.x + p_n.x); // x control
    const y_c = 0.5 * (p.y + p_n.y); // y control
    ctx.quadraticCurveTo(p.x, p.y, x_c, y_c);
  }
  ctx.lineTo(coordinates[coordinates.length - 1].x, coordinates[coordinates.length - 1].y);
  ctx.stroke();
}

export function drawPathSmooth(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  tension: number = 1
) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    let p0 = i > 0 ? points[i - 1] : points[0];
    let p1 = points[i];
    let p2 = points[i + 1];
    let p3 = i != points.length - 2 ? points[i + 2] : p2;

    let cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    let cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;

    let cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    let cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.stroke();
}
