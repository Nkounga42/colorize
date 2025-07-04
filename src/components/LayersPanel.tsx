import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Folder,
  FolderOpen,
  Plus,
  Minus,
} from "lucide-react";

const LayersPanel = ({
  layers,
  selectedLayer,
  selectedLayers = [], // Nouveau prop pour la sélection multiple
  selectLayer,
  selectMultipleLayers, // Nouveau prop pour la sélection multiple
  moveLayer,
  toggleLayerVisibility,
  toggleLayerLock,
  deleteLayer, // Nouveau prop pour supprimer un calque
  deleteSelectedLayers, // Nouveau prop pour supprimer les calques sélectionnés
  createGroup, // Nouveau prop pour créer un groupe
  toggleGroup, // Nouveau prop pour ouvrir/fermer un groupe
  addToGroup, // Nouveau prop pour ajouter des calques à un groupe
  removeFromGroup, // Nouveau prop pour retirer des calques d'un groupe
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

  const handleLayerClick = (layer, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Sélection multiple avec Ctrl/Cmd
      selectMultipleLayers(layer, 'toggle');
    } else if (event.shiftKey) {
      // Sélection de plage avec Shift
      selectMultipleLayers(layer, 'range');
    } else {
      // Sélection simple
      selectLayer(layer);
    }
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedLayers.length > 0) {
      event.preventDefault();
      deleteSelectedLayers();
    }
  };

  const isLayerSelected = (layer) => {
    return selectedLayers.some(selected => selected.id === layer.id) || selectedLayer === layer.object;
  };

  const renderLayer = (layer, depth = 0) => {
    const isSelected = isLayerSelected(layer);
    const isGroup = layer.type === 'group';
    
    return (
      <div key={layer.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div
          className={`px-1 py-1 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? "border-primary/50 bg-primary/30"
              : "border-base-100 hover:bg-base-100"
          }`}
          onClick={(e) => handleLayerClick(layer, e)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center ">
              {isGroup && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroup(layer);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {layer.expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
                </button>
              )}
              
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
                  className="text-sm m-0 font-medium text-base-content truncate bg-base-300 outline-0 border-0 rounded p-1"
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
            </div>

            {renamingLayerId !== layer.id  && <div className="flex items-center space-x-1">
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer);
                }}
                className="p-1 text-red-400 hover:text-red-600"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>}
          </div>
        </div>

        {/* Rendu des calques enfants si c'est un groupe ouvert */}
        {isGroup && layer.expanded && layer.children && (
          <div className="ml-2">
            {layer.children.map(childLayer => renderLayer(childLayer, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      handleKeyDown(event);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [selectedLayers]);

  return (
    <div className="absolute w-64 p-1 h-[100vh]">
      <div className="rounded-xl bg-base-200/80 backdrop-blur-lg border-base-300 border shadow-lg h-full">
        <div className="p-2 px-3 border-b border-base-content/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-base-content">Calques</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => createGroup()}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Créer un groupe"
              >
                <Folder size={16} />
              </button>
              {selectedLayers.length > 1 && (
                <button
                  onClick={() => addToGroup(selectedLayers)}
                  className="p-1 text-blue-400 hover:text-blue-600"
                  title="Grouper les calques sélectionnés"
                >
                  <Plus size={16} />
                </button>
              )}
              {selectedLayers.length > 0 && (
                <button
                  onClick={() => deleteSelectedLayers()}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="Supprimer les calques sélectionnés"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          
          {selectedLayers.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {selectedLayers.length} calque(s) sélectionné(s)
            </div>
          )}
        </div>

        <div className="p-2 space-y-1 max-h-[80%] overflow-y-scroll">
          {layers
            .slice()
            .reverse()
            .map((layer) => renderLayer(layer))}

          {layers.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Aucun calque</p>
              <p className="text-xs">Commencez à dessiner !</p>
            </div>
          )}
        </div>

        {/* Instructions d'utilisation */}
        <div className="p-2 border-t border-base-content/30 text-xs text-gray-500">
          <p>Ctrl+Clic : Sélection multiple</p>
          <p>Shift+Clic : Sélection de plage</p>
          <p>Suppr : Effacer sélection</p>
          <p>Double-clic : Renommer</p>
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;