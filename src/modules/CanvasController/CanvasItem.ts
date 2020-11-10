export type CanvasItemRenderType = (
  x: number,
  y: number,
  w: number,
  h: number
) => void;

export type RectType = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CanvasItemConfigType = {
  canvas: HTMLCanvasElement;
  activeBorderWidth: number;
  renderItem: CanvasItemRenderType;
  rect?: RectType;
};

let UID = 1;

export class CanvasItem {
  canvasWidth: number;
  canvasHeight: number;
  canvas: HTMLCanvasElement;
  activeBorderWidth: number;
  ctx2d: CanvasRenderingContext2D;
  renderItem: CanvasItemRenderType;
  isActive: boolean;

  id = UID++;

  rect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };

  constructor(config: CanvasItemConfigType) {
    Object.assign(this, config);

    this.ctx2d = this.canvas.getContext("2d");

    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
  }

  recalculateRect() {
    const { rect } = this;

    const xMultiplier = this.canvas.width / this.canvasWidth;
    rect.x *= xMultiplier;
    rect.w *= xMultiplier;

    const yMultiplier = this.canvas.height / this.canvasHeight;
    rect.y *= yMultiplier;
    rect.h *= yMultiplier;

    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
  }

  existsAt(userX: number, userY: number): boolean {
    const { x, y, w, h } = this.rect;
    return x <= userX && y <= userY && x + w >= userX && y + h >= userY;
  }

  setIsActive(isActive: boolean): void {
    this.isActive = isActive;
  }

  move(deltaX: number, deltaY: number) {
    const { rect } = this;

    rect.x += deltaX;
    if (rect.x < 0) rect.x = 0;
    if (rect.x + rect.w > this.canvas.width) {
      rect.x = this.canvas.width - rect.w;
    }

    rect.y += deltaY;
    if (rect.y < 0) rect.y = 0;
    if (rect.y + rect.h > this.canvas.height) {
      rect.y = this.canvas.height - rect.h;
    }
  }

  render() {
    const {
      activeBorderWidth: deltaPx,
      rect: { x, y, w, h },
    } = this;

    if (this.isActive) {
      this.ctx2d.fillStyle = "green";
      this.ctx2d.fillRect(
        x - deltaPx,
        y - deltaPx,
        w + deltaPx * 2,
        h + deltaPx * 2
      );
    }

    return this.renderItem(x, y, w, h);
  }
}
