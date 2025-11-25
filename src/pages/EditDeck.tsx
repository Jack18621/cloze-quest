import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  useDecks,
  useFlashcards,
  useUpdateDeck,
  useUpdateFlashcard,
  useDeleteFlashcard,
  useCreateFlashcard,
} from "@/hooks/useFlashcards";
import { AddCardsModal } from "@/components/AddCardsModal";
import { MasteryBadge } from "@/components/MasteryBadge";

const masteryOrder: Array<"red" | "orange" | "yellow" | "green"> = ["red", "orange", "yellow", "green"];

export default function EditDeck() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { data: decks = [] } = useDecks();
  const { data: flashcards = [] } = useFlashcards();
  const updateDeck = useUpdateDeck();
  const updateCard = useUpdateFlashcard();
  const deleteCard = useDeleteFlashcard();
  const createCard = useCreateFlashcard();

  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [showJsonPanel, setShowJsonPanel] = useState(false);

  const deck = decks.find((d) => d.id === deckId);
  const cards = flashcards.filter((c) => c.deck_id === deckId).sort((a, b) => a.order - b.order);

  if (!deck) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">Deck not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const cycleMastery = (cardId: string, currentMastery: "red" | "orange" | "yellow" | "green") => {
    const currentIndex = masteryOrder.indexOf(currentMastery);
    const nextIndex = (currentIndex + 1) % masteryOrder.length;
    updateCard.mutate({ id: cardId, mastery: masteryOrder[nextIndex] });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowJsonPanel(!showJsonPanel)}>
                <FileJson className="w-4 h-4 mr-2" />
                {showJsonPanel ? "Hide" : "Import JSON"}
              </Button>
              <Button
                onClick={() =>
                  createCard.mutate({
                    deck_id: deckId!,
                    question: "New question",
                    answer: "New answer",
                    order: Date.now(),
                    mastery: "red",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>

          <Input
            value={deck.name}
            onChange={(e) => updateDeck.mutate({ id: deck.id, name: e.target.value })}
            className="text-2xl font-bold h-auto p-3 bg-card border-2"
            placeholder="Deck name..."
          />
        </motion.div>

        {showJsonPanel && <AddCardsModal open={true} onClose={() => setShowJsonPanel(false)} deckId={deckId!} />}

        <div className="space-y-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <MasteryBadge
                    mastery={card.mastery}
                    size="lg"
                    onClick={() => cycleMastery(card.id, card.mastery)}
                    className="flex-shrink-0 mt-1"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Card {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => deleteCard.mutate(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={card.question}
                      onChange={(e) => updateCard.mutate({ id: card.id, question: e.target.value })}
                      placeholder="Question (use [brackets] for cloze)"
                      className="min-h-[80px] resize-none"
                    />
                    <Textarea
                      value={card.answer}
                      onChange={(e) => updateCard.mutate({ id: card.id, answer: e.target.value })}
                      placeholder="Answer"
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {cards.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No cards yet. Add your first card!</p>
              <Button
                onClick={() =>
                  createCard.mutate({
                    deck_id: deckId!,
                    question: "What is [2+2]?",
                    answer: "4",
                    order: Date.now(),
                    mastery: "red",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}