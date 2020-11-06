import { debounce } from "utils";

type DefaultConfigsType = {
  drawImage: {
    x?: number;
    y?: number;
    sizeRatio?: number;
  };
};

const DefaultConfigs: DefaultConfigsType = {
  drawImage: {
    x: 0,
    y: 0,
    sizeRatio: 1,
  },
};

type ConfigType = {
  canvas: HTMLCanvasElement;
  activeItemBorderWidth?: number;
};

export class CanvasController {
  canvas: HTMLCanvasElement;
  activeItemBorderWidth: number = 2;
  ctx2d: CanvasRenderingContext2D;
  items: Array<CanvasItem> = [];
  lastMouseEvent: MouseEvent;

  constructor(config: ConfigType) {
    Object.assign(this, config);

    this.ctx2d = this.canvas.getContext("2d");

    this._init();

    window.onresize = debounce(() => {
      this._init();
      this._render();
    }, 100);

    this.canvas.onmousedown = this.onMouseDown;
    this.canvas.onmouseup = this.onMouseUp;
    this.canvas.onmouseleave = this.onMouseLeave;
  }

  onMouseDown = (event: MouseEvent) => {
    const itemIndex = this.getMousedownItemIndex(event);

    if (~itemIndex) {
      const item = this.items[itemIndex];

      this.items.splice(itemIndex, 1);
      this.items.push(item);

      this.canvas.addEventListener("mousemove", this.onMouseMove);
      this.lastMouseEvent = event;
      this.activeItem.setIsActive(true);
    }

    this._render();
  };

  onMouseMove = debounce((event: MouseEvent) => {
    const { clientX: lastClientX, clientY: lastClientY } = this.lastMouseEvent;
    const { clientX, clientY } = event;

    this.activeItem.move(clientX - lastClientX, clientY - lastClientY);

    this.lastMouseEvent = event;

    this._render();
  }, 10);

  onMouseUp = () => this.resetActiveItem();
  onMouseLeave = () => this.resetActiveItem();

  resetActiveItem() {
    if (this.lastMouseEvent) {
      this.canvas.removeEventListener("mousemove", this.onMouseMove);
      this.lastMouseEvent = null;
      this.activeItem.setIsActive(false);
      this._render();
    }
  }

  private _init() {
    const { width, height } = this.clientRect;
    this.canvas.width = width;
    this.canvas.height = height;

    for (const item of this.items) item.updateWidthHeight();
  }

  getMousedownItemIndex(event: MouseEvent): number {
    const { offsetX, offsetY } = event;

    const layerX = offsetX - this.clientRect.left;
    const layerY = offsetY - this.clientRect.top;

    const { items } = this;

    for (let i = items.length; i--; ) {
      const item = items[i];

      if (item.existsAt(layerX, layerY)) return i;
    }

    return -1;
  }

  get clientRect(): ClientRect {
    return this.canvas.getBoundingClientRect();
  }

  get activeItem(): CanvasItem {
    return this.items[this.items.length - 1];
  }

  addCanvasItem(params: {
    renderItem: CanvasItemRenderType;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  }) {
    const item = new CanvasItem({
      ...params,
      canvas: this.canvas,
      activeBorderWidth: this.activeItemBorderWidth,
    });

    this.items.push(item);

    item.render();
  }

  drawImage(
    image: HTMLImageElement,
    config: DefaultConfigsType["drawImage"] = DefaultConfigs.drawImage
  ) {
    const { x, y, sizeRatio } = this._getConfig("drawImage", config);

    const { width: canvasWidth, height: canvasHeight } = this.canvas;

    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;

    const wRatio = canvasWidth / imgWidth;
    const hRatio = canvasHeight / imgHeight;

    const minRatio = Math.min(wRatio, hRatio);

    const multiplier = minRatio;

    const w = imgWidth * multiplier * sizeRatio;
    const h = imgHeight * multiplier * sizeRatio;

    this.addCanvasItem({
      x,
      y,
      w,
      h,
      renderItem: (x, y, w, h) => {
        this.ctx2d.drawImage(image, x, y, w, h);
      },
    });
  }

  private _clear() {
    this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private _render() {
    this._clear();
    for (const item of this.items) item.render();
  }

  private _getConfig<
    T extends keyof DefaultConfigsType,
    C = DefaultConfigsType[T]
  >(configKey: T, userConfig: C): C {
    return {
      ...DefaultConfigs[configKey],
      ...userConfig,
    };
  }
}

type CanvasItemRenderType = (
  x: number,
  y: number,
  w: number,
  h: number
) => void;
type CanvasItemConfigType = {
  canvas: HTMLCanvasElement;
  activeBorderWidth: number;
  renderItem: CanvasItemRenderType;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

class CanvasItem {
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

  updateWidthHeight() {
    this.w *= this.canvas.width / this.canvasWidth;
    this.h *= this.canvas.height / this.canvasHeight;

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
