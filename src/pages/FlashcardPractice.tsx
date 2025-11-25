import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Shuffle, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUpdateFlashcard, type Flashcard } from "@/hooks/useFlashcards";
import { MasteryBadge } from "@/components/MasteryBadge";

interface ParsedPart {
  type: "text" | "reveal";
  content: string;
  index?: number;
}

const parseQuestion = (question: string): ParsedPart[] => {
  const parts: ParsedPart[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;
  let revealIndex = 0;

  while ((match = regex.exec(question)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: question.substring(lastIndex, match.index) });
    }
    parts.push({ type: "reveal", content: match[1], index: revealIndex++ });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < question.length) {
    parts.push({ type: "text", content: question.substring(lastIndex) });
  }

  return parts;
};

export default function FlashcardPractice() {
  const location = useLocation();
  const navigate = useNavigate();
  const updateCard = useUpdateFlashcard();

  const initialCards = (location.state?.cards || []) as Flashcard[];
  const deckName = location.state?.deckName || "Practice";

  const [randomize, setRandomize] = useState(false);
  const [frontSide, setFrontSide] = useState<"question" | "answer">("question");
  const [practiceCards, setPracticeCards] = useState(() => {
    return randomize ? [...initialCards].sort(() => Math.random() - 0.5) : initialCards;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealedParts, setRevealedParts] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<{
    red: Flashcard[];
    orange: Flashcard[];
    yellow: Flashcard[];
    green: Flashcard[];
  }>({ red: [], orange: [], yellow: [], green: [] });
  const [sessionComplete, setSessionComplete] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const leftOpacity = useTransform(x, [-200, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, 200], [0, 1]);

  const currentCard = practiceCards[currentIndex];

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!currentCard) return;

    const offset = info.offset.x;
    let newMastery: "red" | "orange" | "yellow" | "green";

    if (offset > 150) {
      newMastery = "green";
    } else if (offset < -150) {
      newMastery = "red";
    } else {
      x.set(0);
      return;
    }

    updateCard.mutate({
      id: currentCard.id,
      mastery: newMastery,
      last_reviewed_at: new Date().toISOString(),
    });

    setResults((prev) => ({
      ...prev,
      [newMastery]: [...prev[newMastery], currentCard],
    }));

    if (currentIndex < practiceCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setRevealedParts({});
      x.set(0);
    } else {
      setSessionComplete(true);
    }
  };

  const startNewSession = (filterMastery?: "red" | "orange" | "yellow" | "green") => {
    let newCards = initialCards;
    if (filterMastery) {
      newCards = initialCards.filter((c) => c.mastery === filterMastery);
    }
    if (randomize) {
      newCards = [...newCards].sort(() => Math.random() - 0.5);
    }
    setPracticeCards(newCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRevealedParts({});
    setResults({ red: [], orange: [], yellow: [], green: [] });
    setSessionComplete(false);
  };

  const parsedParts = useMemo(() => {
    if (!currentCard) return [];
    const text = frontSide === "question" ? currentCard.question : currentCard.answer;
    return parseQuestion(text);
  }, [currentCard, frontSide]);

  if (!currentCard || practiceCards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">No cards to practice!</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Session Complete!</h2>
          <div className="space-y-3 mb-6">
            {(["red", "orange", "yellow", "green"] as const).map((mastery) => {
              const count = results[mastery].length;
              if (count === 0) return null;
              return (
                <div key={mastery} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2">
                    <MasteryBadge mastery={mastery} />
                    <span className="capitalize">{mastery}</span>
                  </div>
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            {results.red.length > 0 && (
              <Button className="w-full" variant="outline" onClick={() => startNewSession("red")}>
                Practice Red Cards
              </Button>
            )}
            {results.orange.length > 0 && (
              <Button className="w-full" variant="outline" onClick={() => startNewSession("orange")}>
                Practice Orange Cards
              </Button>
            )}
            <Button className="w-full" onClick={() => navigate("/")}>
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">{deckName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={randomize ? "default" : "outline"}
              size="icon"
              onClick={() => {
                setRandomize(!randomize);
                const newCards = !randomize
                  ? [...practiceCards].sort(() => Math.random() - 0.5)
                  : [...initialCards];
                setPracticeCards(newCards);
              }}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFrontSide(frontSide === "question" ? "answer" : "question")}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Progress value={((currentIndex + 1) / practiceCards.length) * 100} className="mb-6" />

        <div className="relative h-[500px] flex items-center justify-center">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate }}
            onDragEnd={handleDragEnd}
            className="absolute w-full cursor-grab active:cursor-grabbing"
          >
            <Card
              className="p-8 h-[450px] flex flex-col items-center justify-center text-center relative overflow-hidden"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div className="absolute inset-0 bg-mastery-red/30 opacity-0" style={{ opacity: leftOpacity }} />
              <motion.div
                className="absolute inset-0 bg-mastery-green/30 opacity-0"
                style={{ opacity: rightOpacity }}
              />

              <div className="absolute top-4 right-4">
                <MasteryBadge mastery={currentCard.mastery} />
              </div>

              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {!isFlipped ? (
                  <div className="text-xl space-y-2">
                    {parsedParts.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.content}</span>
                      ) : (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevealedParts((prev) => ({ ...prev, [part.index!]: true }));
                          }}
                          className={`inline-block mx-1 px-3 py-1 rounded-full text-sm ${
                            revealedParts[part.index!]
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {revealedParts[part.index!] ? part.content : "..."}
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-xl" style={{ transform: "rotateY(180deg)" }}>
                    {frontSide === "question" ? currentCard.answer : currentCard.question}
                  </div>
                )}
              </motion.div>

              <div className="absolute bottom-4 text-sm text-muted-foreground">
                {currentIndex + 1} / {practiceCards.length}
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-mastery-red font-bold text-lg"
            style={{ opacity: leftOpacity }}
          >
            <MasteryBadge mastery="red" size="lg" />
            <span>Red</span>
          </motion.div>
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-mastery-green font-bold text-lg"
            style={{ opacity: rightOpacity }}
          >
            <span>Green</span>
            <MasteryBadge mastery="green" size="lg" />
          </motion.div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Tap to flip • Swipe left (red) or right (green)
        </p>
      </div>
    </div>
  );
}