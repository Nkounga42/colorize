import { RotateCcw, RotateCw, Trash2 } from "lucide-react";

const Toolbar = ({
  tools,
  selectedTool,
  setSelectedTool,
  addShape,
  addText,
  undo,
  redo,
  deleteSelected,
  historyIndex,
  history
}) => {
  return (
    <div className=" border-base-300  border w-auto z-100 border-1 border-base-200 absolute shadow-lg left-1/2 transform -translate-x-1/2 bottom-4 flex bg-base-200/80 backdrop-blur-lg  rounded-full overflow-hidden p-1   flex gap-1 items-center ">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => {
            if (tool.id === 'rectangle' || tool.id === 'circle' || tool.id === 'triangle' || tool.id === 'line') {
              addShape(tool.id);
            } else if (tool.id === 'text') {
              addText();
            } else {
              setSelectedTool(tool.id);
            }
          }}
          className={`p-2 rounded-full transition-colors ${
            selectedTool === tool.id 
              ? 'bg-primary text-base-200' 
              : 'text-base-content/70 hover:bg-primary/50 hover:bg-primary/50'
          }`}
          title={tool.label}
        >
          <tool.icon size={20} />
        </button>
      ))}
      
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 rounded-full text-base-content/50 hover:bg-primary/50 hover:bg-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Annuler"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 rounded-full text-base-content/50 hover:bg-primary/50 hover:bg-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refaire"
        >
          <RotateCw size={20} />
        </button>
        
        <button
          onClick={deleteSelected}
          className="p-2 rounded-lg text-error over:bg-primary/50 hover:bg-primary/50 "
          title="Supprimer"
        >
          <Trash2 size={20} />
        </button>
    </div>
  );
};


export default Toolbar