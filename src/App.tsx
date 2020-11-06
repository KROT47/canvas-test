import React, { useEffect, useRef } from "react";

import { CanvasController } from "modules/CanvasController";
import { loadImage } from "utils";

import imgPath1 from "assets/images/1.jpg";
import imgPath2 from "assets/images/2.png";

import "./App.module.scss";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    setupCanvas(canvasRef.current);
  }, []);

  return (
    <div styleName="root">
      <canvas ref={canvasRef} styleName="canvas" />
    </div>
  );
};

const setupCanvas = async (canvas) => {
  const canv = new CanvasController({ canvas, activeItemBorderWidth: 2 });

  const [image1, image2] = await Promise.all([
    loadImage(imgPath1),
    loadImage(imgPath2),
  ]);

  canv.drawImage(image1, { sizeRatio: 0.8 });
  canv.drawImage(image2, { sizeRatio: 0.82 });
};
