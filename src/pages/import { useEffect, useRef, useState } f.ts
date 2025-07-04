import { useEffect, useRef, useState } from "react";
import * as Fabric from "fabric";
import Canvas from "../components/Canvas";
import Toolbar from "../components/Toolbar";

export default function Drawing() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState<Any>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 500,
      });
      initCanvas.backgroundColor = "#fff";
      initCanvas.renderAll();

      setCanvas(initCanvas);
      return () => {
        initCanvas.dispose();
      };
    }
  }, [canvasRef]);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4 gap-4">
      <Canvas ref={canvasRef}></Canvas>
      <Toolbar
        tools={undefined}
        selectedTool={undefined}
        setSelectedTool={undefined}
        addShape={undefined}
        addText={undefined}
        undo={undefined}
        redo={undefined}
        deleteSelected={undefined}
        historyIndex={undefined}
        history={undefined}
      />
    </div>
  );
}
