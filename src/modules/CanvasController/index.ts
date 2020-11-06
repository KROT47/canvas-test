import { debounce } from "utils";

import { CanvasItem, CanvasItemRenderType } from "./CanvasItem";
import { getConfig, DefaultConfigsType } from "./defaultConfigs";

type ConfigType = {
  canvas: HTMLCanvasElement;
  activeItemBorderWidth?: number;
};

export class CanvasController {
  canvas: HTMLCanvasElement;
  activeItemBorderWidth: number = 2;
  ctx2d: CanvasRenderingContext2D;
  items: Array<{ meta: {}; item: CanvasItem }> = [];
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

  private _init() {
    const { width, height } = this.clientRect;
    this.canvas.width = width;
    this.canvas.height = height;

    for (const { item } of this.items) item.recalculateRect();
  }

  get clientRect(): ClientRect {
    return this.canvas.getBoundingClientRect();
  }

  get activeItem(): CanvasItem {
    return this.items[this.items.length - 1]?.item;
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

  getMousedownItemIndex(event: MouseEvent): number {
    const { offsetX, offsetY } = event;

    const layerX = offsetX - this.clientRect.left;
    const layerY = offsetY - this.clientRect.top;

    const { items } = this;

    for (let i = items.length; i--; ) {
      const { item } = items[i];

      if (item.existsAt(layerX, layerY)) return i;
    }

    return -1;
  }

  addCanvasItem({
    renderItem,
    rect,
    meta,
  }: {
    renderItem: CanvasItemRenderType;
    rect?: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    meta: {
      method: string;
      args: Array<any>;
    };
  }) {
    const item = new CanvasItem({
      canvas: this.canvas,
      activeBorderWidth: this.activeItemBorderWidth,
      renderItem,
      rect,
    });

    this.items.push({ meta, item });

    item.render();
  }

  drawImage(image: HTMLImageElement, config?: DefaultConfigsType["drawImage"]) {
    const { x, y, w: baseW, h: baseH, sizeRatio } = getConfig(
      "drawImage",
      config
    );

    let w = baseW;
    let h = baseH;

    if (!w || !h) {
      const { width: canvasWidth, height: canvasHeight } = this.canvas;

      const imgWidth = image.naturalWidth;
      const imgHeight = image.naturalHeight;

      const wRatio = canvasWidth / imgWidth;
      const hRatio = canvasHeight / imgHeight;

      const minRatio = Math.min(wRatio, hRatio);

      const multiplier = minRatio;

      w = imgWidth * multiplier * sizeRatio;
      h = imgHeight * multiplier * sizeRatio;
    }

    this.addCanvasItem({
      meta: {
        method: "drawImage",
        args: [...arguments],
      },
      rect: {
        x,
        y,
        w,
        h,
      },
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
    for (const { item } of this.items) item.render();
  }
}
