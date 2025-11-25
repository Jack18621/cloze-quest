import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameModalProps {
  open: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
  title: string;
}

export const RenameModal = ({
  open,
  onClose,
  currentName,
  onRename,
  title,
}: RenameModalProps) => {
  const [name, setName] = useState(currentName);

  const handleSubmit = () => {
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter name..."
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};