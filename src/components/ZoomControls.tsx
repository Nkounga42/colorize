import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

export default function ZoomControls() {
  const [zoom, setZoom] = useState(100);
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  return (
        <div className="w-auto absolute border-base-300 border left-10 bottom-4 flex bg-base-200/80 backdrop-blur-lg  rounded-full overflow-hidden p-1 shadow-lg z-10 border-r border-base-200 flex gap-1 items-center ">

      <ToolButton onClick={zoomOut} title="Zoom arrière">
        <ZoomOut className="w-5 h-5" />
      </ToolButton>
      <span className="px-1 py-1 text-base-content">{zoom}%</span>
      <ToolButton onClick={zoomIn} title="Zoom avant">
        <ZoomIn className="w-5 h-5" />
      </ToolButton>
    </div>
  );
}
const ToolButton = ({ onClick, title, active = false, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-full hover:bg-primary/50 active:bg-primary /50 transition-colors`}
  >
    {children}
  </button>
);
