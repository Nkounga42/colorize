import React, { useEffect, useRef, useState } from "react";
import {
  Pencil, Square, Circle, Triangle, Type, Image, Trash2, Download, Upload,
  RotateCcw, RotateCw, Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown,
  Palette, MousePointer, Minus, SignalZero
} from "lucide-react";
import Toolbar from "../components/Toolbar";
import SecondaryToolbar from "../components/SecondaryToolbar";
import LayersPanel from "../components/LayersPanel";
import ZoomControls from "../components/ZoomControls";
import Canvas from "../components/Canvas";
import ImageDropZone from "../components/ImageDropZone";

const Drawing = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [selectedTool, setSelectedTool] = useState("select");
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [visualProperties, setVisualProperties] = useState(null);

   const colorIndex = useRef(0);
   const [rainbowMode, setRainbowMode] = useState(true);
 
  useEffect(() => {
  if (!selectedLayer) return;

  useEffect(() => {
    if (!canvas) return;

    const handleMouseMove = () => {
      // if (canvas.isDrawingMode && rainbowMode && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = getNextColor();
        console.log(getNextColor())
      // }
    };

    canvas.on("mouse:move", handleMouseMove);

    return () => {
      canvas.off("mouse:move", handleMouseMove);
    };
  }, [canvas, rainbowMode]);

  const current = selectedLayer;

  setVisualProperties({
    fill: {
      color: current.fill ?? "#000000",
      opacity: current.opacity ?? 1,
    },
    stroke: {
      color: current.stroke ?? "#000000",
      width: current.strokeWidth ?? 1,
      opacity: current.stroke?.opacity ?? 1,
    },
    text: {
      fontSize: current.fontSize ?? 16,
      fontWeight: current.fontWeight ?? "normal",
      fontStyle: current.fontStyle ?? "normal",
      textAlign: current.textAlign ?? "left",
    },
    position: {
      x: current.left ?? 0,
      y: current.top ?? 0,
    },
    size: {
      width: current.width ?? 100,
      height: current.height ?? 100,
    },
    rotation: current.angle ?? 0,
  });
}, [  
selectedLayer]);

  useEffect(() => {
    const loadFabric = () => {
      if (window.fabric) {
        setFabricLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js";
      script.onload = () => setFabricLoaded(true);
      script.onerror = () => console.error("Failed to load Fabric.js");
      document.head.appendChild(script);
    };
    loadFabric();
  }, []);

  useEffect(() => {
    if (!fabricLoaded || !canvasRef.current || canvas) return;

    const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: "#ffffff",
    });

    fabricCanvas.freeDrawingBrush.width = strokeWidth;
    fabricCanvas.freeDrawingBrush.color = drawingColor;

    fabricCanvas.on("object:added", () => updateLayers(fabricCanvas));
    fabricCanvas.on("object:removed", () => updateLayers(fabricCanvas));
    fabricCanvas.on("object:modified", () => saveState(fabricCanvas));

    fabricCanvas.on("selection:created", (e) => {
      if (e.selected?.length === 1) {
        setSelectedLayer(e.selected[0]);
      }
    });

    fabricCanvas.on("selection:updated", (e) => {
      if (e.selected?.length === 1) {
        setSelectedLayer(e.selected[0]);
      }
    });

    fabricCanvas.on("selection:cleared", () => setSelectedLayer(null));

    setCanvas(fabricCanvas);
    saveState(fabricCanvas);

    return () => fabricCanvas.dispose();
  }, [fabricLoaded]);

  // Appliquer brush à chaque changement de couleur ou taille
  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [canvas, drawingColor, strokeWidth]);

  // Activer outils
  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = selectedTool === "pencil";
    canvas.selection = selectedTool === "select";

    if (selectedTool === "select") {
      canvas.defaultCursor = "default";
    } else {
      canvas.defaultCursor = "crosshair";
    }

    // 🔁 Force le brush quand on change d'outil vers le crayon
    if (selectedTool === "pencil" && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [canvas, selectedTool, drawingColor, strokeWidth]);

  const updateLayers = (fabricCanvas) => {
    const objects = fabricCanvas.getObjects();
    setLayers(
      objects.map((obj, i) => ({
        id: obj.id || `layer-${i}`,
        name: getObjectTypeName(obj.type) + ` ${i + 1}`,
        visible: obj.visible !== false,
        locked: !obj.selectable,
        object: obj,
      }))
    );
  };

  const getObjectTypeName = (type) => {
    const names = {
      rect: "Rectangle", circle: "Cercle", triangle: "Triangle",
      "i-text": "Texte", path: "Dessin", image: "Image", line: "Ligne",
    };
    return names[type] || "Objet";
  };

  const saveState = (fabricCanvas) => {
    const state = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        updateLayers(canvas);
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        updateLayers(canvas);
        setHistoryIndex(newIndex);
      });
    }
  };

  const addShape = (type) => {
    if (!canvas || !window.fabric) return;
    const options = {
      left: 100, top: 100, fill: drawingColor,
      stroke: drawingColor, strokeWidth
    };
    let shape;
    switch (type) {
      case "rectangle": shape = new fabric.Rect({ ...options, width: 100, height: 80 }); break;
      case "circle": shape = new fabric.Circle({ ...options, radius: 50 }); break;
      case "triangle": shape = new fabric.Triangle({ ...options, width: 100, height: 100 }); break;
      case "line": shape = new fabric.Line([50, 100, 200, 100], {
        ...options, fill: "", strokeWidth: strokeWidth * 2
      }); break;
    }
    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      saveState(canvas);
    }
  };

  const addText = () => {
    if (!canvas || !window.fabric) return;
    const text = new fabric.IText("Texte...", {
      left: 100, top: 100, fill: drawingColor,
      fontSize: 24, fontFamily: "Arial"
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    saveState(canvas);
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const objs = canvas.getActiveObjects();
    if (objs.length) {
      objs.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      saveState(canvas);
    }
  };

  const toggleLayerVisibility = (layer) => {
    layer.object.visible = !layer.object.visible;
    canvas.renderAll();
    updateLayers(canvas);
  };

  const toggleLayerLock = (layer) => {
    layer.object.selectable = !layer.object.selectable;
    layer.object.evented = layer.object.selectable;
    canvas.renderAll();
    updateLayers(canvas);
  };

  const moveLayer = (layer, direction) => {
    direction === "up" ? canvas.bringForward(layer.object) : canvas.sendBackwards(layer.object);
    updateLayers(canvas);
    saveState(canvas);
  };

  const selectLayer = (layer) => {
    canvas.setActiveObject(layer.object);
    canvas.renderAll();
    setSelectedLayer(layer.object);
  };

  const exportCanvas = () => {
    if (!canvas) return;
    const url = canvas.toDataURL({ format: "png", quality: 1 });
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = url;
    link.click();
  };

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();
    saveState(canvas);
  };

  const importImageFromURL = (url) => {
    if (!canvas || !window.fabric) return;
    window.fabric.Image.fromURL(url, (img) => {
      const maxDim = 300;
      const scale = Math.min(maxDim / img.width!, maxDim / img.height!);
      img.set({ left: 100, top: 100, scaleX: scale, scaleY: scale });
      canvas.add(img);
      saveState(canvas);
    }, { crossOrigin: "anonymous" });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const url = e.dataTransfer.getData("text/plain");
    if (url && canvas && canvasRef.current) {
      window.fabric.Image.fromURL(url, (img) => {
        const scale = Math.min(300 / img.width!, 300 / img.height!);
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        img.set({ left: x, top: y, scaleX: scale, scaleY: scale });
        canvas.add(img);
        saveState(canvas);
      });
    }
  };

  const handleStyleChange = (newStyles) => {
    if (!selectedLayer || !canvas) return;

    selectedLayer.set({
      fill: newStyles.fill?.color,
      stroke: newStyles.stroke?.color,
      strokeWidth: newStyles.stroke?.width,
      angle: newStyles.rotation,
      width: newStyles.size?.width,
      height: newStyles.size?.height,
      left: newStyles.position?.x,
      top: newStyles.position?.y,
    });

    if (selectedLayer.type === "i-text") {
      selectedLayer.set({
        fontSize: newStyles.text?.size,
        fontFamily: newStyles.text?.fontFamily,
        fontWeight: newStyles.text?.weight,
        fontStyle: newStyles.text?.style,
        textAlign: newStyles.text?.align,
        lineHeight: newStyles.text?.lineHeight,
        charSpacing: newStyles.text?.letterSpacing * 100,
      });
    }

    canvas.renderAll();
    saveState(canvas);
  };

  const tools = [
    { id: "select", icon: MousePointer, label: "Sélection" },
    { id: "pencil", icon: Pencil, label: "Crayon" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Cercle" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "line", icon: Minus, label: "Ligne" },
    { id: "text", icon: Type, label: "Texte" },
  ];

  if (!fabricLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de Fabric.js...</p>
        </div>
      </div>
    );
  }
 
  const getNextColor = () => {
    const color = `hsl(${colorIndex.current % 360}, 100%, 50%)`;
    colorIndex.current += 5;
    return color;
  };

  return (
    <div className="flex h-screen relative bg-base-300">
      <Toolbar
        tools={tools}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        addShape={addShape}
        addText={addText}
        undo={undo}
        redo={redo}
        deleteSelected={deleteSelected}
        historyIndex={historyIndex}
        history={history}
      />
      <SecondaryToolbar
         drawingColor={drawingColor}
        setDrawingColor={setDrawingColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        handleImageClick={importImageFromURL}
        exportCanvas={exportCanvas}
        clearCanvas={clearCanvas}
        importImageFromURL={importImageFromURL}
        selectedElement={selectedLayer}
        onStyleChange={handleStyleChange}
        visualProperties={visualProperties}
        rainbowMode={rainbowMode}
        setRainbowMode={setRainbowMode}
      />
      <div className="flex-1 flex flex-col" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <div className="flex-1 relative">
          <Canvas ref={canvasRef} />
        </div>
      </div>
      <LayersPanel
        layers={layers}
        selectedLayer={selectedLayer}
        selectLayer={selectLayer}
        moveLayer={moveLayer}
        toggleLayerVisibility={toggleLayerVisibility}
        toggleLayerLock={toggleLayerLock}
        setLayers={setLayers}
      />
    </div>
  );
};

export default Drawing;
