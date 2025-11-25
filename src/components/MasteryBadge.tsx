import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MasteryBadgeProps {
  mastery: "red" | "orange" | "yellow" | "green";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const masteryConfig = {
  red: { emoji: "❌", label: "Don't know", color: "mastery-red" },
  orange: { emoji: "😕", label: "Vague", color: "mastery-orange" },
  yellow: { emoji: "🙂", label: "Mostly OK", color: "mastery-yellow" },
  green: { emoji: "😎", label: "Solid", color: "mastery-green" },
};

const sizeClasses = {
  sm: "text-xs w-6 h-6",
  md: "text-sm w-8 h-8",
  lg: "text-lg w-10 h-10",
};

export const MasteryBadge = ({
  mastery,
  size = "md",
  onClick,
  className,
}: MasteryBadgeProps) => {
  const config = masteryConfig[mastery];

  return (
    <motion.button
      whileHover={{ scale: onClick ? 1.1 : 1 }}
      whileTap={{ scale: onClick ? 0.95 : 1 }}
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "rounded-full flex items-center justify-center font-medium transition-colors",
        `bg-[hsl(var(--mastery-${mastery}))]`,
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80",
        !onClick && "cursor-default",
        className
      )}
      title={config.label}
    >
      {config.emoji}
    </motion.button>
  );
};