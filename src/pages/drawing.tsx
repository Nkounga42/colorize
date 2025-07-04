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
  maxHistorySize: 50,
};

function historyReducer(state, action) {
  switch (action.type) {
    case "SAVE_STATE":
      {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(action.payload);
        
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        } else {
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
  const [selectedLayers, setSelectedLayers] = useState([]); // MOVED HERE - before it's used
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [visualProperties, setVisualProperties] = useState(null);
  const [showSecondaryToolbar, setShowSecondaryToolbar] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const colorIndex = useRef(0);
  
  const isLoadingFromHistory = useRef(false);
  const saveTimeout = useRef(null);
  const lastSavedState = useRef(null);

  const [historyState, dispatch] = useReducer(historyReducer, initialHistoryState);

  // MOVED: deleteSelectedLayers function definition before it's used
  const deleteSelectedLayers = useCallback(() => {
    if (!canvas || selectedLayers.length === 0) return;
    
    // Supprimer tous les objets sélectionnés
    selectedLayers.forEach(layer => {
      canvas.remove(layer.object);
    });
    
    canvas.discardActiveObject();
    setSelectedLayers([]);
    setSelectedLayer(null);
    updateLayers(canvas);
    saveStateImmediate(canvas);
  }, [canvas, selectedLayers]);

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

  const saveStateDebounced = useCallback((fabricCanvas) => {
    if (isLoadingFromHistory.current) return;
    
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    saveTimeout.current = setTimeout(() => {
      const currentState = JSON.stringify(fabricCanvas.toJSON());
      
      if (currentState !== lastSavedState.current) {
        lastSavedState.current = currentState;
        dispatch({ type: "SAVE_STATE", payload: currentState });
      }
    }, 300);
  }, []);

  const saveStateImmediate = useCallback((fabricCanvas) => {
    if (isLoadingFromHistory.current) return;
    
    const currentState = JSON.stringify(fabricCanvas.toJSON());
    if (currentState !== lastSavedState.current) {
      lastSavedState.current = currentState;
      dispatch({ type: "SAVE_STATE", payload: currentState });
    }
  }, []);

  // FONCTION MODIFIÉE : updateLayers avec préservation des noms
  const updateLayers = useCallback((fabricCanvas) => {
    const objects = fabricCanvas.getObjects();
    
    setLayers(prevLayers => {
      return objects.map((obj, i) => {
        // Chercher si cette couche existait déjà
        const existingLayer = prevLayers.find(layer => 
          layer.object === obj || 
          (layer.id && obj.id && layer.id === obj.id)
        );
        
        // Si la couche existait déjà, préserver son nom personnalisé
        if (existingLayer) {
          return {
            ...existingLayer,
            id: obj.id || existingLayer.id || `layer-${i}`,
            visible: obj.visible !== false,
            locked: !obj.selectable,
            object: obj,
          };
        }
        
        // Sinon, créer une nouvelle couche avec un nom par défaut
        return {
          id: obj.id || `layer-${i}`,
          name: obj.customName || getObjectTypeName(obj.type) + ` ${i + 1}`,
          visible: obj.visible !== false,
          locked: !obj.selectable,
          object: obj,
        };
      });
    });
  }, []);

  // FONCTION AJOUTÉE : pour assigner des IDs uniques
  const addUniqueId = (obj) => {
    if (!obj.id) {
      obj.id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return obj;
  };

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

    // ÉVÉNEMENT MODIFIÉ : path:created avec ID unique
    fabricCanvas.on("path:created", (e) => {
      if (!isLoadingFromHistory.current) {
        addUniqueId(e.path);
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
  }, [fabricLoaded, saveStateDebounced, saveStateImmediate, updateLayers]);

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

  useEffect(() => {
    if (!canvas) return;
    
    const handleSelectionCreated = (e) => {
      if (e.selected?.length > 1) {
        const selectedLayerObjects = e.selected.map(obj => 
          layers.find(layer => layer.object === obj)
        ).filter(Boolean);
        setSelectedLayers(selectedLayerObjects);
        setSelectedLayer(null);
      } else if (e.selected?.length === 1) {
        setSelectedLayer(e.selected[0]);
        setSelectedLayers([]);
      }
    };
    
    const handleSelectionUpdated = (e) => {
      if (e.selected?.length > 1) {
        const selectedLayerObjects = e.selected.map(obj => 
          layers.find(layer => layer.object === obj)
        ).filter(Boolean);
        setSelectedLayers(selectedLayerObjects);
        setSelectedLayer(null);
      } else if (e.selected?.length === 1) {
        setSelectedLayer(e.selected[0]);
        setSelectedLayers([]);
      }
    };
    
    const handleSelectionCleared = () => {
      setSelectedLayer(null);
      setSelectedLayers([]);
    };
    
    // Nettoyer les anciens event listeners
    canvas.off('selection:created');
    canvas.off('selection:updated');
    canvas.off('selection:cleared');
    
    // Ajouter les nouveaux
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);
    
    return () => {
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas, layers]);

  // Gestionnaire pour les touches globales
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      // Vérifier si l'utilisateur n'est pas en train d'écrire dans un input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      if ((event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        
        if (selectedLayers.length > 0) {
          deleteSelectedLayers();
        } else if (selectedLayer) {
          canvas.remove(selectedLayer);
          canvas.discardActiveObject();
          setSelectedLayer(null);
          updateLayers(canvas);
          saveStateImmediate(canvas);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [selectedLayers, selectedLayer, canvas, deleteSelectedLayers, updateLayers, saveStateImmediate]);

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
        
        setTimeout(() => {
          isLoadingFromHistory.current = false;
        }, 100);
      });
    }
  };

  // FONCTION MODIFIÉE : addShape avec ID unique
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
        shape = new window.fabric.Rect({ ...options, width: 100, height: 80 });
        break;
      case "circle":
        shape = new window.fabric.Circle({ ...options, radius: 50 });
        break;
      case "triangle":
        shape = new window.fabric.Triangle({ ...options, width: 100, height: 100 });
        break;
      case "line":
        shape = new window.fabric.Line([50, 100, 200, 100], {
          ...options,
          fill: "",
          strokeWidth: strokeWidth * 2,
        });
        break;
      default:
        return;
    }
    
    // Ajouter un ID unique
    addUniqueId(shape);
    
    canvas.add(shape);
    canvas.setActiveObject(shape);
  };

  // FONCTION MODIFIÉE : addText avec ID unique
  const addText = () => {
    if (!canvas || !window.fabric) return;
    const text = new window.fabric.IText("Texte...", {
      left: 100,
      top: 100,
      fill: drawingColor,
      fontSize: 24,
      fontFamily: "Arial",
    });
    
    // Ajouter un ID unique
    addUniqueId(text);
    
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
    // Sélection simple - nettoie la sélection multiple
    setSelectedLayers([]);
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

  const selectMultipleLayers = (layer, mode) => {
    if (mode === 'toggle') {
      setSelectedLayers(prev => {
        const isSelected = prev.some(selected => selected.id === layer.id);
        let newSelection;
        if (isSelected) {
          newSelection = prev.filter(selected => selected.id !== layer.id);
        } else {
          newSelection = [...prev, layer];
        }
        
        // Synchroniser avec le canvas Fabric.js
        if (newSelection.length > 1) {
          const fabricObjects = newSelection.map(l => l.object);
          const activeSelection = new window.fabric.ActiveSelection(fabricObjects, {
            canvas: canvas,
          });
          canvas.setActiveObject(activeSelection);
          canvas.renderAll();
        } else if (newSelection.length === 1) {
          canvas.setActiveObject(newSelection[0].object);
          canvas.renderAll();
        } else {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        
        return newSelection;
      });
    } else if (mode === 'range') {
      const layerIndex = layers.findIndex(l => l.id === layer.id);
      const lastSelectedIndex = selectedLayers.length > 0 
        ? layers.findIndex(l => l.id === selectedLayers[selectedLayers.length - 1].id)
        : layerIndex;
      
      const start = Math.min(layerIndex, lastSelectedIndex);
      const end = Math.max(layerIndex, lastSelectedIndex);
      
      const rangeSelection = layers.slice(start, end + 1);
      setSelectedLayers(rangeSelection);
      
      // Synchroniser avec le canvas Fabric.js
      if (rangeSelection.length > 1) {
        const fabricObjects = rangeSelection.map(l => l.object);
        const activeSelection = new window.fabric.ActiveSelection(fabricObjects, {
          canvas: canvas,
        });
        canvas.setActiveObject(activeSelection);
        canvas.renderAll();
      }
    }
  };

  const deleteLayer = (layer) => {
    if (!canvas) return;
    canvas.remove(layer.object);
    canvas.discardActiveObject();
    setSelectedLayers(prev => prev.filter(selected => selected.id !== layer.id));
    updateLayers(canvas);
    saveStateImmediate(canvas);
  };

  const createGroup = () => {
    // Implémentation future pour créer des groupes
    console.log("Créer un groupe");
  };

  const toggleGroup = (layer) => {
    // Implémentation future pour les groupes
    console.log("Toggle group", layer);
  };

  const addToGroup = (layers) => {
    // Implémentation future pour ajouter aux groupes
    console.log("Ajouter au groupe", layers);
  };

  const removeFromGroup = (layer) => {
    // Implémentation future pour retirer des groupes
    console.log("Retirer du groupe", layer);
  };

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
          selectedLayers={selectedLayers}
          selectLayer={selectLayer}
          selectMultipleLayers={selectMultipleLayers}
          moveLayer={moveLayer}
          toggleLayerVisibility={toggleLayerVisibility}
          toggleLayerLock={toggleLayerLock}
          deleteLayer={deleteLayer}
          deleteSelectedLayers={deleteSelectedLayers}
          createGroup={createGroup}
          toggleGroup={toggleGroup}
          addToGroup={addToGroup}
          removeFromGroup={removeFromGroup}
          setLayers={setLayers}
          canvas={canvas} 
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