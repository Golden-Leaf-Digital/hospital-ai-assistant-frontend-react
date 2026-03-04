import { cn } from "../lib/utils"; // adjust path if needed

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  as: Comp = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-[#FF4242] text-white focus:ring-[#FF4242]",
    outline:
      "border border-[#FF4242] text-[#FF4242] hover:bg-[#FF4242] hover:text-white focus:ring-[#FF4242]",
    ghost: "text-[#FF4242] hover:bg-[#FF4242]/10 focus:ring-[#FF4242]",
    link: "text-[#FF4242] underline-offset-4 hover:underline",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2 rounded-full",
  };

  return (
    <Comp
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  );
}