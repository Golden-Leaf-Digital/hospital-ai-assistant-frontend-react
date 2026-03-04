
export default function Input({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  helperText,
  rightIcon,
  onRightIconClick,
  className = "",
}) {
  return (
    <div className="w-full">
      {/* LABEL */}
      {label && (
        <label
          htmlFor={id}
          className="font-medium text-gray-700 text-sm"
        >
          {label}
        </label>
      )}

      {/* INPUT WRAPPER */}
      <div className="relative mt-2">
        {/* LEFT ICON */}
        {Icon && (
          <span className="absolute left-3 top-3 text-[#FF4242]">
            <Icon size={20} />
          </span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full py-4 rounded-lg outline-none transition-all
            ${Icon ? "pl-10" : "pl-4"} 
            ${rightIcon ? "pr-10" : "pr-4"}
            ${
              error
                ? "border border-red-500 focus:ring-2 focus:ring-red-200"
                : "border border-gray-300 focus:ring-2 focus:ring-[#FF4242]/20"
            }
            ${className}
          `}
        />

        {/* RIGHT ICON */}
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-3 text-gray-500"
          >
            {rightIcon}
          </button>
        )}
      </div>

      {/* ERROR / HELPER TEXT */}
      <p
        className={`text-xs mt-1 ${
          error ? "text-red-600" : "text-gray-500"
        }`}
      >
        {error ? error : helperText}
      </p>
    </div>
  );
}