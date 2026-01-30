export default function Loader({ label = "Loading..." }) {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
    </div>
  );
}
