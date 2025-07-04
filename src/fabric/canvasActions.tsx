import { Circle, Minus, MousePointer, Pencil, Square, Triangle, Type } from "lucide-react";

const tools = [
  { id: "select", icon: MousePointer, label: "Sélection" },
  { id: "pencil", icon: Pencil, label: "Crayon" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Cercle" },
  { id: "triangle", icon: Triangle, label: "Triangle" },
  { id: "line", icon: Minus, label: "Ligne" },
  { id: "text", icon: Type, label: "Texte" },
];

export{
  tools
}


 
// import { useEffect } from "react";

// useEffect(() => {
//   if (!selectedLayer) return;

//   const current = selectedLayer;

//   setVisualProperties({
//     position: { x: current.left || 0, y: current.top || 0 },
//     size: {
//       width: current.width * current.scaleX,
//       height: current.height * current.scaleY,
//     },
//     rotation: current.angle || 0,
//     text: {
//       size: current.fontSize || 16,
//       fontFamily: current.fontFamily || "Inter",
//       weight: current.fontWeight || "normal",
//       style: current.fontStyle || "normal",
//       align: current.textAlign || "left",
//       lineHeight: current.lineHeight || 1.5,
//       letterSpacing: (current.charSpacing || 0) / 100,
//     },
//     fill: {
//       color: current.fill || "#ff0000",
//       opacity: 1,
//     },
//     stroke: {
//       color: current.stroke || "#000000",
//       width: current.strokeWidth || 1,
//       opacity: 1,
//     },
//     shadow: {
//       color: "#000000",
//       x: 0,
//       y: 4,
//       blur: 4,
//       spread: 0,
//       opacity: 0.25,
//     },
//   });
// }, [selectedLayer]);

// // Chargement de Fabric.js
// useEffect(() => {
//   const loadFabric = () => {
//     if (window.fabric) {
//       setFabricLoaded(true);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src =
//       "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js";
//     script.onload = () => {
//       setFabricLoaded(true);
//     };
//     script.onerror = () => {
//       console.error("Failed to load Fabric.js");
//     };
//     document.head.appendChild(script);
//   };

//   loadFabric();
// }, []);

// // Initialisation du canvas
// useEffect(() => {
//   if (!fabricLoaded || !canvasRef.current || canvas) return;

//   const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
//     width: 400,
//     height: 400,
//     backgroundColor: "#ffffff",
//   });

//   // Configuration des brushes
//   fabricCanvas.freeDrawingBrush.width = strokeWidth;
//   fabricCanvas.freeDrawingBrush.color = drawingColor;

//   // Événements pour la gestion des calques
//   fabricCanvas.on("object:added", () => updateLayers(fabricCanvas));
//   fabricCanvas.on("object:removed", () => updateLayers(fabricCanvas));
//   fabricCanvas.on("object:modified", () => saveState(fabricCanvas));
//   fabricCanvas.on("selection:created", (e) => {
//     if (e.selected && e.selected.length === 1) {
//       setSelectedLayer(e.selected[0]);
//     }
//   });
//   fabricCanvas.on("selection:cleared", () => setSelectedLayer(null));

//   setCanvas(fabricCanvas);
//   saveState(fabricCanvas);

//   return () => {
//     fabricCanvas.dispose();
//   };
// }, [fabricLoaded]);

// // Mise à jour de la couleur et épaisseur
// useEffect(() => {
//   if (canvas && window.fabric) {
//     canvas.freeDrawingBrush.color = drawingColor;
//     canvas.freeDrawingBrush.width = strokeWidth;
//   }
// }, [canvas, drawingColor, strokeWidth]);

// // Gestion des outils
// useEffect(() => {
//   if (!canvas) return;

//   canvas.isDrawingMode = selectedTool === "pencil";
//   canvas.selection = selectedTool === "select";

//   if (selectedTool === "select") {
//     canvas.defaultCursor = "default";
//   } else if (selectedTool === "pencil") {
//     canvas.defaultCursor = "crosshair";
//   } else {
//     canvas.defaultCursor = "crosshair";
//   }
// }, [canvas, selectedTool]);

// const updateLayers = (fabricCanvas) => {
//   const objects = fabricCanvas.getObjects();
//   setLayers(
//     objects.map((obj, index) => ({
//       id: obj.id || `layer-${index}`,
//       name: obj.name || getObjectTypeName(obj.type) + ` ${index + 1}`,
//       visible: obj.visible !== false,
//       locked: !obj.selectable,
//       object: obj,
//     }))
//   );
// };

// const getObjectTypeName = (type) => {
//   const typeNames = {
//     rect: "Rectangle",
//     circle: "Cercle",
//     triangle: "Triangle",
//     "i-text": "Texte",
//     path: "Dessin",
//     image: "Image",
//     line: "Ligne",
//   };
//   return typeNames[type] || "Objet";
// };

// const saveState = (fabricCanvas) => {
//   if (!fabricCanvas) return;
//   const state = JSON.stringify(fabricCanvas.toJSON());
//   const newHistory = history.slice(0, historyIndex + 1);
//   newHistory.push(state);
//   setHistory(newHistory);
//   setHistoryIndex(newHistory.length - 1);
// };

// const undo = () => {
//   if (historyIndex > 0 && canvas) {
//     const newIndex = historyIndex - 1;
//     canvas.loadFromJSON(history[newIndex], () => {
//       canvas.renderAll();
//       updateLayers(canvas);
//       setHistoryIndex(newIndex);
//     });
//   }
// };

// const redo = () => {
//   if (historyIndex < history.length - 1 && canvas) {
//     const newIndex = historyIndex + 1;
//     canvas.loadFromJSON(history[newIndex], () => {
//       canvas.renderAll();
//       updateLayers(canvas);
//       setHistoryIndex(newIndex);
//     });
//   }
// };

// const addShape = (shapeType) => {
//   if (!canvas || !window.fabric) return;

//   let shape;
//   const options = {
//     left: 100,
//     top: 100,
//     fill: drawingColor,
//     stroke: drawingColor,
//     strokeWidth: strokeWidth,
//   };

//   switch (shapeType) {
//     case "rectangle":
//       shape = new window.fabric.Rect({ ...options, width: 100, height: 80 });
//       break;
//     case "circle":
//       shape = new window.fabric.Circle({ ...options, radius: 50 });
//       break;
//     case "triangle":
//       shape = new window.fabric.Triangle({
//         ...options,
//         width: 100,
//         height: 100,
//       });
//       break;
//     case "line":
//       shape = new window.fabric.Line([50, 100, 200, 100], {
//         ...options,
//         fill: "",
//         strokeWidth: strokeWidth * 2,
//       });
//       break;
//   }

//   if (shape) {
//     canvas.add(shape);
//     canvas.setActiveObject(shape);
//     saveState(canvas);
//   }
// };

// const addText = () => {
//   if (!canvas || !window.fabric) return;

//   const text = new window.fabric.IText("Texte...", {
//     left: 100,
//     top: 100,
//     fill: drawingColor,
//     fontSize: 24,
//     fontFamily: "Arial",
//   });
//   canvas.add(text);
//   canvas.setActiveObject(text);
//   saveState(canvas);
// };

// const deleteSelected = () => {
//   if (!canvas) return;

//   const activeObjects = canvas.getActiveObjects();
//   if (activeObjects.length) {
//     activeObjects.forEach((obj) => canvas.remove(obj));
//     canvas.discardActiveObject();
//     saveState(canvas);
//   }
// };

// const toggleLayerVisibility = (layer) => {
//   layer.object.visible = !layer.object.visible;
//   canvas.renderAll();
//   updateLayers(canvas);
// };

// const toggleLayerLock = (layer) => {
//   layer.object.selectable = !layer.object.selectable;
//   layer.object.evented = layer.object.selectable;
//   canvas.renderAll();
//   updateLayers(canvas);
// };

// const moveLayer = (layer, direction) => {
//   if (direction === "up") {
//     canvas.bringForward(layer.object);
//   } else {
//     canvas.sendBackwards(layer.object);
//   }
//   updateLayers(canvas);
//   saveState(canvas);
// };

// const selectLayer = (layer) => {
//   canvas.setActiveObject(layer.object);
//   canvas.renderAll();
//   setSelectedLayer(layer.object);
// };

// const exportCanvas = () => {
//   if (!canvas) return;

//   const dataURL = canvas.toDataURL({
//     format: "png",
//     quality: 1,
//   });
//   const link = document.createElement("a");
//   link.download = "drawing.png";
//   link.href = dataURL;
//   link.click();
// };

// const clearCanvas = () => {
//   if (!canvas) return;

//   canvas.clear();
//   canvas.backgroundColor = "#ffffff";
//   canvas.renderAll();
//   saveState(canvas);
// };

// const tools = [
//   { id: "select", icon: MousePointer, label: "Sélection" },
//   { id: "pencil", icon: Pencil, label: "Crayon" },
//   { id: "rectangle", icon: Square, label: "Rectangle" },
//   { id: "circle", icon: Circle, label: "Cercle" },
//   { id: "triangle", icon: Triangle, label: "Triangle" },
//   { id: "line", icon: Minus, label: "Ligne" },
//   { id: "text", icon: Type, label: "Texte" },
// ];

// // Affichage de chargement
// if (!fabricLoaded) {
//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//         <p className="text-gray-600">Chargement de Fabric.js...</p>
//       </div>
//     </div>
//   );
// }

// const handleImageClick = (url: string) => {
//   if (!canvas || !window.fabric) return;

//   window.fabric.Image.fromURL(url, (img) => {
//     img.scaleToWidth(200);
//     img.set({ left: 100, top: 100 });
//     canvas.add(img);
//     saveState(canvas);
//   });
// };
// const importImageFromURL = (url) => {
//   if (!canvas || !window.fabric) return;

//   window.fabric.Image.fromURL(
//     url,
//     (img) => {
//       const maxDimension = 300;
//       const scale = Math.min(
//         maxDimension / img.width!,
//         maxDimension / img.height!
//       );
//       img.set({ left: 100, top: 100, scaleX: scale, scaleY: scale });
//       canvas.add(img);
//       saveState(canvas);
//     },
//     {
//       crossOrigin: "anonymous", // si tu importes depuis un autre domaine (CORS)
//     }
//   );
// };

// const handleStyleChange = (newStyles) => {
//   if (!selectedLayer || !canvas) return;

//   selectedLayer.set({
//     fill: newStyles.fill?.color,
//     stroke: newStyles.stroke?.color,
//     strokeWidth: newStyles.stroke?.width,
//     angle: newStyles.rotation,
//     width: newStyles.size?.width,
//     height: newStyles.size?.height,
//     left: newStyles.position?.x,
//     top: newStyles.position?.y,
//   });

//   // Appliquer les styles texte seulement si c’est un objet texte
//   if (selectedLayer.type === "i-text") {
//     selectedLayer.set({
//       fontSize: newStyles.text?.size,
//       fontFamily: newStyles.text?.fontFamily,
//       fontWeight: newStyles.text?.weight,
//       fontStyle: newStyles.text?.style,
//       textAlign: newStyles.text?.align,
//       lineHeight: newStyles.text?.lineHeight,
//       charSpacing: newStyles.text?.letterSpacing * 100,
//     });
//   }

//   canvas.renderAll();
//   saveState(canvas);
// };
