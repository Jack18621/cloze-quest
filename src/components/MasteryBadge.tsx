import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MasteryBadgeProps {
  mastery: "red" | "orange" | "yellow" | "green";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const masteryConfig = {
  red: { icon: ArrowDown, label: "Don't know", color: "mastery-red" },
  orange: { icon: ArrowDown, label: "Vague", color: "mastery-orange" },
  yellow: { icon: ArrowRight, label: "Mostly OK", color: "mastery-yellow" },
  green: { icon: Check, label: "Solid", color: "mastery-green" },
};

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const iconSizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const MasteryBadge = ({
  mastery,
  size = "md",
  onClick,
  className,
}: MasteryBadgeProps) => {
  const config = masteryConfig[mastery];
  const Icon = config.icon;

  return (
    <motion.button
      whileHover={{ scale: onClick ? 1.1 : 1 }}
      whileTap={{ scale: onClick ? 0.95 : 1 }}
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "rounded-full flex items-center justify-center font-bold transition-all border-2",
        `bg-mastery-${mastery} border-mastery-${mastery} text-white`,
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80 hover:shadow-lg",
        !onClick && "cursor-default",
        className
      )}
      title={config.label}
    >
      <Icon className={iconSizeClasses[size]} strokeWidth={3} />
    </motion.button>
  );
};