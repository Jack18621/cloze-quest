import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

export const StreakCounter = () => {
  const [streak, setStreak] = useState(0);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  useEffect(() => {
    const storedStreak = localStorage.getItem("flashcard-streak");
    const storedLastVisit = localStorage.getItem("flashcard-last-visit");
    const today = new Date().toDateString();

    if (storedLastVisit === today) {
      setStreak(parseInt(storedStreak || "1", 10));
    } else if (storedLastVisit) {
      const lastDate = new Date(storedLastVisit);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = parseInt(storedStreak || "0", 10) + 1;
        setStreak(newStreak);
        localStorage.setItem("flashcard-streak", newStreak.toString());
      } else {
        setStreak(1);
        localStorage.setItem("flashcard-streak", "1");
      }
    } else {
      setStreak(1);
      localStorage.setItem("flashcard-streak", "1");
    }

    localStorage.setItem("flashcard-last-visit", today);
    setLastVisit(today);
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="p-4 bg-gradient-to-br from-streak/20 to-streak/5 border-streak/20">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Flame className="w-8 h-8 text-streak fill-streak" />
          </motion.div>
          <div>
            <div className="text-2xl font-bold">{streak} Day{streak !== 1 ? 's' : ''}</div>
            <div className="text-sm text-muted-foreground">Study Streak</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};