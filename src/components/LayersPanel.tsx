import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";

const LayersPanel = ({
  layers,
  selectedLayer,
  selectLayer,
  moveLayer,
  toggleLayerVisibility,
  toggleLayerLock,
  setLayers,
}) => {
  const [renamingLayerId, setRenamingLayerId] = useState(null);
  const [newName, setNewName] = useState("");

  const handleRename = (layerId, name) => {
    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        layer.object.name = name.trim();
        return { ...layer, name: name.trim() };
      }
      return layer;
    });
    setLayers(updatedLayers);
  };

  return (
    <div className="absolute w-64 p-4 h-[100vh]">
      <div className="rounded-xl bg-base-200/80 backdrop-blur-lg  border-base-300 border shadow-lg h-full">
        <div className="p-2 px-3 border-b border-base-content/30">
          <h3 className="text-lg font-semibold text-base-content">Calques</h3>
        </div>

        <div className="p-2 space-y-1 max-h-[90vh] overflow-y-scroll">
          {layers
            .slice()
            .reverse()
            .map((layer, index) => (
              <div
                key={layer.id}
                className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                  selectedLayer === layer.object
                    ? "border-primary/50 bg-primary/30"
                    : "boorder-base-100 hover:bg-base-100"
                }`}
                onClick={() => selectLayer(layer)}
              >
                <div className="flex items-center justify-between">
                  {renamingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => {
                        handleRename(layer.id, newName);
                        setRenamingLayerId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRename(layer.id, newName);
                          setRenamingLayerId(null);
                        }
                      }}
                      autoFocus
                      className="text-sm w-25 font-medium text-base-content truncate bg-base-300 outline-0 border-0 rounded px-1 py-0.5"
                    />
                  ) : (
                    <span
                      className="text-sm font-medium text-base-content truncate"
                      onDoubleClick={() => {
                        setRenamingLayerId(layer.id);
                        setNewName(layer.name);
                      }}
                    >
                      {layer.name}
                    </span>
                  )}

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer, "up");
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Monter"
                    >
                      <ChevronUp size={14} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(layer, "down");
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Descendre"
                    >
                      <ChevronDown size={14} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title={layer.visible ? "Masquer" : "Afficher"}
                    >
                      {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerLock(layer);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title={layer.locked ? "Déverrouiller" : "Verrouiller"}
                    >
                      {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {layers.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Aucun calque</p>
              <p className="text-xs">Commencez à dessiner !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;
