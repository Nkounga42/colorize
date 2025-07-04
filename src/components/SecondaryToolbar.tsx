import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Download,
  Palette,
  Trash2,
  Upload,
  Move,
  RotateCcw,
  Droplets,
  Square,
  Type,
  FileText,
  Settings,
} from "lucide-react";
import debounce from "lodash/debounce";
import ImageDropZone from "./ImageDropZone";

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const ColorInput = ({ value = "#345645", onChange }) => {
  const [colorIndicator, setColorIndicator] = useState(value);

  useEffect(() => {
    if (value !== colorIndicator) {
      setColorIndicator(value);
    }
  }, [value]);

  const debouncedOnChange = useMemo(() => debounce(onChange, 150), [onChange]);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColorIndicator(newColor);
    debouncedOnChange(newColor);
  };

  return (
    <div className="flex h-9 items-center rounded-lg overflow-hidden border border-base-300">
      <div
        style={{ backgroundColor: colorIndicator }}
        className="w-9 h-9 cursor-pointer border-0 relative"
      >
        <input
          type="color"
          value={colorIndicator}
          onChange={handleColorChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>

      <input
        type="text"
        value={colorIndicator}
        onChange={handleColorChange}
        className="input flex-1 font-mono border-0"
      />
    </div>
  );
};

const SecondaryToolbar = ({
  setStrokeWidth = () => {},
  handleImageClick = () => {},
  importImageFromURL = () => {},
  exportCanvas = () => {},
  clearCanvas = () => {},
  onStyleChange = () => {},
  setDrawingColor = () => {},
  selectedElement = null,
  visualProperties: visualPropertiesFromParent = null,
}) => {
  const colorIndex = useRef(0);
  const [rainbowMode, setRainbowMode] = useState(false);

  const getNextColor = useCallback(() => {
    const next = `hsl(${colorIndex.current % 360}, 100%, 50%)`;
    colorIndex.current += 5;
    return next;
  }, []);

  const [urlInput, setUrlInput] = useState("");
  const [visualProperties, setVisualProperties] = useState({
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    text: {
      size: 16,
      fontFamily: "Inter",
      weight: "normal",
      style: "normal",
      align: "left",
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    fill: { color: "#000000", opacity: 1 },
    stroke: { color: "#000000", width: 0, opacity: 1 },
    shadow: {
      color: "#000000",
      x: 0,
      y: 4,
      blur: 4,
      spread: 0,
      opacity: 0.25,
    },
  });

  useEffect(() => {
    if (
      selectedElement &&
      visualPropertiesFromParent &&
      !deepEqual(visualPropertiesFromParent, visualProperties)
    ) {
      setVisualProperties(visualPropertiesFromParent);
    }
  }, [selectedElement, visualPropertiesFromParent]);

  const updateVisualProperty = (path, value) => {
    setVisualProperties((prev) => {
      const newProps = structuredClone(prev);
      const keys = path.split(".");
      let target = newProps;
      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = value;

      if (selectedElement) {
        try {
          const layer = selectedElement;
          switch (path) {
            case "fill.color":
              layer.set("fill", value);
              break;
            case "stroke.color":
              layer.set("stroke", value);
              break;
            case "stroke.width":
              layer.set("strokeWidth", value);
              break;
            case "position.x":
              layer.set("left", value);
              break;
            case "position.y":
              layer.set("top", value);
              break;
            case "size.width":
              layer.scaleToWidth(value);
              break;
            case "size.height":
              layer.scaleToHeight(value);
              break;
            case "rotation":
              layer.set("angle", value);
              break;
          }
          layer.canvas?.renderAll();
        } catch (e) {
          console.warn("Erreur de mise à jour sur l'objet", e);
        }
      }

      onStyleChange(newProps);
      return newProps;
    });
  };

  const handleImportURL = () => {
    if (urlInput.trim()) {
      importImageFromURL(urlInput.trim());
      setUrlInput("");
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen z-30 p-4">
      <div className="card w-80 h-full">
        <div className="overflow-y-auto space-y-3">
          {/* === IMPORT D'IMAGES === */}
          <div className="collapse collapse-arrow bg-base-200/90 backdrop-blur-lg shadow-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-sm font-bold text-primary flex items-center gap-2">
              <Upload size={16} />
              IMAGES
            </div>
            <div className="collapse-content space-y-3">
              <div className="join w-full">
                <input
                  type="text"
                  placeholder="URL de l'image..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="input input-bordered join-item flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleImportURL();
                    }
                  }}
                />
                <button
                  onClick={handleImportURL}
                  className="btn btn-primary join-item"
                  title="Importer depuis URL"
                >
                  Ajouter
                </button>
              </div>
              <ImageDropZone onImageClick={handleImageClick} />
            </div>
          </div>

          {/* === PROPRIÉTÉS VISUELLES === */}
          <div className="collapse collapse-arrow bg-base-200/90 backdrop-blur-lg shadow-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-sm font-bold text-primary flex items-center gap-2">
              <Settings size={16} />
              PROPRIÉTÉS VISUELLES
            </div>
            <div className="collapse-content space-y-10">
              {/* Position et Taille */}
              <div className="">
                <h3 className="card-title mb-2 text-base-content/70 uppercase flex items-center gap-1">
                  <Move size={14} />
                  Position & Taille
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text">X</span>
                    </label>
                    <input
                      type="number"
                      value={visualProperties.position.x}
                      onChange={(e) =>
                        updateVisualProperty("position.x", Number(e.target.value))
                      }
                      className="input input-bordered"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text">Y</span>
                    </label>
                    <input
                      type="number"
                      value={visualProperties.position.y}
                      onChange={(e) =>
                        updateVisualProperty("position.y", Number(e.target.value))
                      }
                      className="input input-bordered"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text">Largeur</span>
                    </label>
                    <input
                      type="number"
                      value={visualProperties.size.width}
                      onChange={(e) =>
                        updateVisualProperty("size.width", Number(e.target.value))
                      }
                      className="input input-bordered"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text">Hauteur</span>
                    </label>
                    <input
                      type="number"
                      value={visualProperties.size.height}
                      onChange={(e) =>
                        updateVisualProperty("size.height", Number(e.target.value))
                      }
                      className="input input-bordered"
                    />
                  </div>
                </div>

                <div className="form-control mt-2">
                  <label className="label">
                    <span className="label-text flex items-center gap-1">
                      <RotateCcw size={10} />
                      Rotation: {visualProperties.rotation}°
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={visualProperties.rotation}
                    onChange={(e) =>
                      updateVisualProperty("rotation", Number(e.target.value))
                    }
                    className="range hover:range-primary my-2 range-xs transition duration-150 ease-in-out"
                  />
                  <div className="w-full flex justify-between px-2 text-base-content/50">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>180°</span>
                  </div>
                </div>
              </div>

              {/* Remplissage (Fill) */}
              <div className="shadow-sm">
                <h3 className="card-title mb-2 text-base-content/70 uppercase flex items-center gap-1">
                  <Droplets size={14} />
                  Remplissage (Fill)
                </h3>
                <ColorInput
                  value={visualProperties.fill.color}
                  onChange={(color) => updateVisualProperty("fill.color", color)}
                />
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Opacité: {Math.round(visualProperties.fill.opacity * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={visualProperties.fill.opacity}
                    onChange={(e) =>
                      updateVisualProperty("fill.opacity", Number(e.target.value))
                    }
                    className="range hover:range-primary my-2 range-xs transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              {/* Contour (Stroke) */}
              <div className="shadow-sm">
                <h3 className="card-title mb-2 text-base-content/70 uppercase flex items-center gap-1">
                  <Square size={14} />
                  Contour (Stroke)
                </h3>
                <button
                  className={`btn btn-xs ${rainbowMode ? "btn-info" : "btn-ghost"}`}
                  onClick={() => setRainbowMode(!rainbowMode)}
                  title="Activer/désactiver le mode Rainbow"
                >
                  🌈 Rainbow: {rainbowMode ? "On" : "Off"}
                </button>

                <ColorInput
                  value={visualProperties.stroke.color}
                  onChange={(color) => {
                    const newColor = rainbowMode ? getNextColor() : color;
                    updateVisualProperty("stroke.color", newColor);
                    setDrawingColor(newColor);
                  }}
                />

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Épaisseur: {visualProperties.stroke.width}px
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={visualProperties.stroke.width}
                    onChange={(e) => {
                      updateVisualProperty("stroke.width", Number(e.target.value));
                    }}
                    className="range hover:range-primary my-2 range-xs transition duration-150 ease-in-out"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Opacité: {Math.round(visualProperties.stroke.opacity * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={visualProperties.stroke.opacity}
                    onChange={(e) =>
                      updateVisualProperty("stroke.opacity", Number(e.target.value))
                    }
                    className="range hover:range-primary my-2 range-xs transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              {/* Ombre (Shadow) */}
              <div className="shadow-sm">
                <h3 className="card-title mb-2 text-base-content/70 uppercase flex items-center gap-1">
                  <Palette size={14} />
                  Ombre (Shadow)
                </h3>
                <ColorInput
                  value={visualProperties.shadow.color}
                  onChange={(color) => updateVisualProperty("shadow.color", color)}
                />

                <div className="grid grid-cols-2 gap-2">
                  {["x", "y", "blur", "spread"].map((key) => (
                    <div className="form-control" key={key}>
                      <label className="label py-1">
                        <span className="label-text">
                          {key === "x"
                            ? `X: ${visualProperties.shadow.x}`
                            : key === "y"
                            ? `Y: ${visualProperties.shadow.y}`
                            : key === "blur"
                            ? `Flou: ${visualProperties.shadow.blur}`
                            : `Étalement: ${visualProperties.shadow.spread}`}
                        </span>
                      </label>
                      <input
                        type="range"
                        min={key === "blur" ? 0 : key === "spread" ? 0 : -20}
                        max={key === "blur" ? 20 : key === "spread" ? 10 : 20}
                        value={visualProperties.shadow[key]}
                        onChange={(e) =>
                          updateVisualProperty(`shadow.${key}`, Number(e.target.value))
                        }
                        className="range hover:range-primary my-2 range-xs transition duration-150 ease-in-out"
                      />
                    </div>
                  ))}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Opacité: {Math.round(visualProperties.shadow.opacity * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={visualProperties.shadow.opacity}
                    onChange={(e) =>
                      updateVisualProperty("shadow.opacity", Number(e.target.value))
                    }
                    className="range hover:range-primary my-2 range-xs transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              {/* Texte */}
              <div className="shadow-sm">
                <h3 className="card-title mb-2 text-base-content/70 uppercase flex items-center gap-1">
                  <Type size={14} />
                  Texte
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text">Taille</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Taille"
                      value={visualProperties.text.size}
                      onChange={(e) =>
                        updateVisualProperty("text.size", Number(e.target.value))
                      }
                      className="input input-bordered"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text">Police</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={visualProperties.text.fontFamily}
                      onChange={(e) =>
                        updateVisualProperty("text.fontFamily", e.target.value)
                      }
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      updateVisualProperty(
                        "text.weight",
                        visualProperties.text.weight === "bold" ? "normal" : "bold"
                      )
                    }
                    className={`btn btn-ms ${
                      visualProperties.text.weight === "bold"
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() =>
                      updateVisualProperty(
                        "text.style",
                        visualProperties.text.style === "italic" ? "normal" : "italic"
                      )
                    }
                    className={`btn btn-ms ${
                      visualProperties.text.style === "italic"
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                  >
                    I
                  </button>
                  <div className="divider divider-horizontal mx-0"></div>
                  <button
                    onClick={() => updateVisualProperty("text.align", "left")}
                    className={`btn btn-ms ${
                      visualProperties.text.align === "left"
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                  >
                    ⬅
                  </button>
                  <button
                    onClick={() => updateVisualProperty("text.align", "center")}
                    className={`btn btn-ms ${
                      visualProperties.text.align === "center"
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                  >
                    ↔
                  </button>
                  <button
                    onClick={() => updateVisualProperty("text.align", "right")}
                    className={`btn btn-ms ${
                      visualProperties.text.align === "right"
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                  >
                    ➡
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="collapse collapse-arrow bg-base-200/90 backdrop-blur-lg shadow-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-sm font-bold text-primary">
              ACTIONS
            </div>
            <div className="collapse-content">
              <div className="flex gap-2">
                <button
                  onClick={exportCanvas}
                  className="btn btn-success btn-sm flex-1"
                >
                  <Download size={14} />
                  Exporter
                </button>
                <button
                  onClick={clearCanvas}
                  className="btn btn-error btn-sm flex-1"
                >
                  <Trash2 size={14} />
                  Effacer
                </button>
              </div>
            </div>
          </div>

          {/* EXPORT JSON */}
          <div className="collapse collapse-arrow bg-base-200/90 backdrop-blur-lg shadow-xl">
            <input type="checkbox" />
            <div className="collapse-title text-sm font-bold text-primary flex items-center gap-2">
              <FileText size={16} />
              EXPORT JSON
            </div>
            <div className="collapse-content">
              <div className="mockup-code">
                <pre className="overflow-auto max-h-40">
                  <code>{JSON.stringify(visualProperties, null, 2)}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondaryToolbar;
