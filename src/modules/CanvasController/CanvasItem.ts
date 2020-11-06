export type CanvasItemRenderType = (
  x: number,
  y: number,
  w: number,
  h: number
) => void;

export type CanvasItemConfigType = {
  canvas: HTMLCanvasElement;
  activeBorderWidth: number;
  renderItem: CanvasItemRenderType;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

export class CanvasItem {
  canvasWidth: number;
  canvasHeight: number;
  canvas: HTMLCanvasElement;
  activeBorderWidth: number;
  ctx2d: CanvasRenderingContext2D;
  renderItem: CanvasItemRenderType;
  isActive: boolean;

  x = 0;
  y = 0;
  w = 0;
  h = 0;

  constructor(config: CanvasItemConfigType) {
    Object.assign(this, config);

    this.ctx2d = this.canvas.getContext("2d");
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
  }

  recalculatePositionAndSize() {
    const xMultiplier = this.canvas.width / this.canvasWidth;
    this.x *= xMultiplier;
    this.w *= xMultiplier;

    const yMultiplier = this.canvas.height / this.canvasHeight;
    this.y *= yMultiplier;
    this.h *= yMultiplier;

    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
  }

  existsAt(userX: number, userY: number): boolean {
    const { x, y, w, h } = this;

    return x <= userX && y <= userY && x + w >= userX && y + h >= userY;
  }

  setIsActive(isActive: boolean): void {
    this.isActive = isActive;
  }

  move(deltaX: number, deltaY: number) {
    this.x += deltaX;
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > this.canvas.width) {
      this.x = this.canvas.width - this.w;
    }

    this.y += deltaY;
    if (this.y < 0) this.y = 0;
    if (this.y + this.h > this.canvas.height) {
      this.y = this.canvas.height - this.h;
    }
  }

  render() {
    if (this.isActive) {
      const { activeBorderWidth: deltaPx } = this;
      this.ctx2d.fillStyle = "green";
      this.ctx2d.fillRect(
        this.x - deltaPx,
        this.y - deltaPx,
        this.w + deltaPx * 2,
        this.h + deltaPx * 2
      );
    }

    return this.renderItem(this.x, this.y, this.w, this.h);
  }
}
