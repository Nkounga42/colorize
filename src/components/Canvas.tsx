export default function Canvas( { ref }) {
  return (
    <div className="flex-1 flex items-center h-screen justify-center p-4 ">
      <div className="border border-base-300    overflow-hidden">
        
        <canvas className="rounded-lg" ref={ref} />
      </div>
    </div>
  );
}
