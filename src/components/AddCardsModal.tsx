import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBulkCreateFlashcards } from "@/hooks/useFlashcards";
import { toast } from "sonner";

interface AddCardsModalProps {
  open: boolean;
  onClose: () => void;
  deckId: string;
}

export const AddCardsModal = ({ open, onClose, deckId }: AddCardsModalProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const bulkCreate = useBulkCreateFlashcards();

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const cardsArray = Array.isArray(parsed) ? parsed : [parsed];

      const flashcards = cardsArray.map((card: any, index: number) => ({
        question: card.q || card.question,
        answer: card.a || card.answer,
        deck_id: deckId,
        order: Date.now() + index,
        mastery: "red" as const,
      }));

      // Validate
      const invalid = flashcards.some((c) => !c.question || !c.answer);
      if (invalid) {
        toast.error("All cards must have question and answer");
        return;
      }

      bulkCreate.mutate(flashcards, {
        onSuccess: () => {
          setJsonInput("");
          onClose();
        },
      });
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Cards via JSON</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste JSON with cards. Use [brackets] for cloze deletion.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {`[{"q": "What is [2+2]?", "a": "4"}]`}
          </p>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[{"question": "What is [2+2]?", "answer": "4"}]'
            className="min-h-[300px] font-mono"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={bulkCreate.isPending}>
              {bulkCreate.isPending ? "Importing..." : "Import Cards"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};