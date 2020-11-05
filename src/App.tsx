import React, { useEffect, useRef } from "react";
import "./App.module.scss";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "blue";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div styleName="root">
      <canvas ref={canvasRef} styleName="canvas" />
    </div>
  );
};
