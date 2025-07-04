import React, { useEffect, useRef, useState, useReducer, useCallback } from "react";
import {
  Pencil,
  Square,
  Circle,
  Triangle,
  Type,
  Trash2,
  RotateCcw,
  RotateCw,
  MousePointer,
  Minus,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import Toolbar from "../components/Toolbar";
import SecondaryToolbar from "../components/SecondaryToolbar";
import LayersPanel from "../components/LayersPanel";
import Canvas from "../components/Canvas";

const initialHistoryState = {
  history: [],
  historyIndex: -1,
  maxHistorySize: 50, // Limite la taille de l'historique
};

function historyReducer(state, action) {
  switch (action.type) {
    case "SAVE_STATE":
      {
        // On coupe l'historique futur si on fait un nouveau dessin
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(action.payload);
        
        // Limite la taille de l'historique
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        } else {
          // Seulement si on n'a pas supprimé le premier élément
          state.historyIndex++;
        }
        
        return {
          ...state,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }
    case "SET_INDEX":
      return {
        ...state,
        historyIndex: Math.max(0, Math.min(action.payload, state.history.length - 1)),
      };
    case "CLEAR_HISTORY":
      return {
        ...state,
        history: [action.payload],
        historyIndex: 0,
      };
    default:
      return state;
  }
}

const Drawing = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [selectedTool, setSelectedTool] = useState("select");
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [visualProperties, setVisualProperties] = useState(null);
  const [showSecondaryToolbar, setShowSecondaryToolbar] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const colorIndex = useRef(0);
  
  // Refs pour la gestion de l'historique
  const isLoadingFromHistory = useRef(false);
  const saveTimeout = useRef(null);
  const lastSavedState = useRef(null);

  // useReducer pour l'historique
  const [historyState, dispatch] = useReducer(historyReducer, initialHistoryState);

  useEffect(() => {
    if (!selectedLayer) return;

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
  }, [selectedLayer]);

  useEffect(() => {
    const loadFabric = () => {
      if (window.fabric) {
        setFabricLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js";
      script.onload = () => setFabricLoaded(true);
      script.onerror = () => console.error("Failed to load Fabric.js");
      document.head.appendChild(script);
    };
    loadFabric();
  }, []);

  // Fonction de sauvegarde avec debouncing
  const saveStateDebounced = useCallback((fabricCanvas) => {
    if (isLoadingFromHistory.current) return;
    
    // Annule le timeout précédent
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    saveTimeout.current = setTimeout(() => {
      const currentState = JSON.stringify(fabricCanvas.toJSON());
      
      // Évite de sauvegarder le même état
      if (currentState !== lastSavedState.current) {
        lastSavedState.current = currentState;
        dispatch({ type: "SAVE_STATE", payload: currentState });
      }
    }, 300); // Délai de 300ms
  }, []);

  // Fonction de sauvegarde immédiate pour les actions importantes
  const saveStateImmediate = useCallback((fabricCanvas) => {
    if (isLoadingFromHistory.current) return;
    
    const currentState = JSON.stringify(fabricCanvas.toJSON());
    if (currentState !== lastSavedState.current) {
      lastSavedState.current = currentState;
      dispatch({ type: "SAVE_STATE", payload: currentState });
    }
  }, []);

  useEffect(() => {
    if (!fabricLoaded || !canvasRef.current || canvas) return;

    const width = window.innerWidth - 600;
    const height = window.innerHeight - 120;
    const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      width,
      height,
    });

    const handleResize = () => {
      fabricCanvas.setWidth(window.innerWidth - 320);
      fabricCanvas.setHeight(window.innerHeight);
      fabricCanvas.renderAll();
    };
    window.addEventListener("resize", handleResize);

    fabricCanvas.freeDrawingBrush.width = strokeWidth;
    fabricCanvas.freeDrawingBrush.color = drawingColor;

    // Événements avec gestion améliorée
    fabricCanvas.on("object:added", (e) => {
      if (!isLoadingFromHistory.current) {
        updateLayers(fabricCanvas);
        saveStateImmediate(fabricCanvas);
      }
    });

    fabricCanvas.on("object:removed", (e) => {
      if (!isLoadingFromHistory.current) {
        updateLayers(fabricCanvas);
        saveStateImmediate(fabricCanvas);
      }
    });

    fabricCanvas.on("object:modified", (e) => {
      if (!isLoadingFromHistory.current) {
        updateLayers(fabricCanvas);
        saveStateDebounced(fabricCanvas);
      }
    });

    fabricCanvas.on("object:moving", (e) => {
      if (!isLoadingFromHistory.current) {
        saveStateDebounced(fabricCanvas);
      }
    });

    fabricCanvas.on("object:scaling", (e) => {
      if (!isLoadingFromHistory.current) {
        saveStateDebounced(fabricCanvas);
      }
    });

    fabricCanvas.on("object:rotating", (e) => {
      if (!isLoadingFromHistory.current) {
        saveStateDebounced(fabricCanvas);
      }
    });

    fabricCanvas.on("path:created", (e) => {
      if (!isLoadingFromHistory.current) {
        updateLayers(fabricCanvas);
        saveStateImmediate(fabricCanvas);
      }
    });

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
    
    // Sauvegarde initiale
    const initialState = JSON.stringify(fabricCanvas.toJSON());
    lastSavedState.current = initialState;
    dispatch({ type: "CLEAR_HISTORY", payload: initialState });

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      window.removeEventListener("resize", handleResize);
      fabricCanvas.dispose();
    };
  }, [fabricLoaded, saveStateDebounced, saveStateImmediate]);

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [canvas, drawingColor, strokeWidth]);

  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = selectedTool === "pencil";
    canvas.selection = selectedTool === "select";

    if (selectedTool === "select") {
      canvas.defaultCursor = "default";
    } else {
      canvas.defaultCursor = "crosshair";
    }

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
      rect: "Rectangle",
      circle: "Cercle",
      triangle: "Triangle",
      "i-text": "Texte",
      path: "Dessin",
      image: "Image",
      line: "Ligne",
    };
    return names[type] || "Objet";
  };

  const undo = () => {
    if (historyState.historyIndex > 0 && canvas) {
      const newIndex = historyState.historyIndex - 1;
      isLoadingFromHistory.current = true;
      
      canvas.loadFromJSON(historyState.history[newIndex], () => {
        canvas.renderAll();
        updateLayers(canvas);
        dispatch({ type: "SET_INDEX", payload: newIndex });
        
        // Délai pour s'assurer que tous les événements sont traités
        setTimeout(() => {
          isLoadingFromHistory.current = false;
        }, 100);
      });
    }
  };

  const redo = () => {
    if (
      historyState.historyIndex < historyState.history.length - 1 &&
      canvas
    ) {
      const newIndex = historyState.historyIndex + 1;
      isLoadingFromHistory.current = true;
      
      canvas.loadFromJSON(historyState.history[newIndex], () => {
        canvas.renderAll();
        updateLayers(canvas);
        dispatch({ type: "SET_INDEX", payload: newIndex });
        
        // Délai pour s'assurer que tous les événements sont traités
        setTimeout(() => {
          isLoadingFromHistory.current = false;
        }, 100);
      });
    }
  };

  const addShape = (type) => {
    if (!canvas || !window.fabric) return;
    const options = {
      left: 100,
      top: 100,
      fill: drawingColor,
      stroke: drawingColor,
      strokeWidth,
    };
    let shape;
    switch (type) {
      case "rectangle":
        shape = new fabric.Rect({ ...options, width: 100, height: 80 });
        break;
      case "circle":
        shape = new fabric.Circle({ ...options, radius: 50 });
        break;
      case "triangle":
        shape = new fabric.Triangle({ ...options, width: 100, height: 100 });
        break;
      case "line":
        shape = new fabric.Line([50, 100, 200, 100], {
          ...options,
          fill: "",
          strokeWidth: strokeWidth * 2,
        });
        break;
      default:
        return;
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
  };

  const addText = () => {
    if (!canvas || !window.fabric) return;
    const text = new fabric.IText("Texte...", {
      left: 100,
      top: 100,
      fill: drawingColor,
      fontSize: 24,
      fontFamily: "Arial",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const objs = canvas.getActiveObjects();
    if (objs.length) {
      objs.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
    }
  };

  const toggleLayerVisibility = (layer) => {
    layer.object.visible = !layer.object.visible;
    canvas.renderAll();
    updateLayers(canvas);
    saveStateImmediate(canvas);
  };

  const toggleLayerLock = (layer) => {
    layer.object.selectable = !layer.object.selectable;
    layer.object.evented = layer.object.selectable;
    canvas.renderAll();
    updateLayers(canvas);
    saveStateImmediate(canvas);
  };

  const moveLayer = (layer, direction) => {
    direction === "up"
      ? canvas.bringForward(layer.object)
      : canvas.sendBackwards(layer.object);
    updateLayers(canvas);
    saveStateImmediate(canvas);
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
    saveStateImmediate(canvas);
  };

  const getNextColor = () => {
    const color = `hsl(${colorIndex.current % 360}, 100%, 50%)`;
    colorIndex.current += 5;
    return color;
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
        historyIndex={historyState.historyIndex}
        history={historyState.history}
        canUndo={historyState.historyIndex > 0}
        canRedo={historyState.historyIndex < historyState.history.length - 1}
      />
      {showSecondaryToolbar && (
        <SecondaryToolbar
          drawingColor={drawingColor}
          setDrawingColor={setDrawingColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          selectedElement={selectedLayer}
        />
      )}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <Canvas ref={canvasRef} />
        </div>
      </div>
      {showLayersPanel && (
        <LayersPanel
          layers={layers}
          selectedLayer={selectedLayer}
          selectLayer={selectLayer}
          moveLayer={moveLayer}
          toggleLayerVisibility={toggleLayerVisibility}
          toggleLayerLock={toggleLayerLock}
          setLayers={setLayers}
        />
      )}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        <button
          className={"btn btn-sm btn-circle " + (showLayersPanel ? "btn-primary" : "")}
          onClick={() => setShowLayersPanel((prev) => !prev)}
        >
          <PanelLeft />
        </button>
        <button
          className={"btn btn-sm btn-circle " + (showSecondaryToolbar ? "btn-primary" : "")}
          onClick={() => setShowSecondaryToolbar((prev) => !prev)}
        >
          <PanelRight />
        </button>
      </div>
    </div>
  );
};

export default Drawing;