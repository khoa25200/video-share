interface AdPlaceholderProps {
  className?: string;
  height?: string;
  label?: string;
}

export default function AdPlaceholder({
  className = "",
  height = "h-24",
  label = "Quảng cáo",
}: AdPlaceholderProps) {
  return (
    <div
      className={`w-full bg-dark-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center ${height} ${className}`}
    >
      <div className="text-center">
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-gray-600 text-xs mt-1">320 x 100</p>
      </div>
    </div>
  );
}

