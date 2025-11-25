import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, FolderPlus, GripVertical, Play, Edit, Trash2, FolderPlus as SubfolderIcon, Plus, FileJson, Folder as FolderIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useFolders,
  useDecks,
  useFlashcards,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useCreateDeck,
  useDeleteDeck,
  type Folder,
  type Deck,
  type Flashcard,
} from "@/hooks/useFlashcards";
import { ContextMenu, ContextMenuItem } from "@/components/ContextMenu";
import { RenameModal } from "@/components/RenameModal";
import { AddCardsModal } from "@/components/AddCardsModal";
import { MasteryBadge } from "@/components/MasteryBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StreakCounter } from "@/components/StreakCounter";
import { TodoList } from "@/components/TodoList";

interface FolderNode extends Folder {
  children: FolderNode[];
  decks: (Deck & { cardCount: number })[];
}

export default function Home() {
  const navigate = useNavigate();
  const { data: folders = [] } = useFolders();
  const { data: decks = [] } = useDecks();
  const { data: flashcards = [] } = useFlashcards();

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const createDeck = useCreateDeck();
  const deleteDeck = useDeleteDeck();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);
  const [renameModal, setRenameModal] = useState<{
    open: boolean;
    type: "folder" | "deck";
    id: string;
    currentName: string;
  } | null>(null);
  const [addCardsModal, setAddCardsModal] = useState<{ open: boolean; deckId: string } | null>(null);

  // Build folder tree
  const folderTree = useMemo(() => {
    const decksWithCount = decks.map((deck) => ({
      ...deck,
      cardCount: flashcards.filter((c) => c.deck_id === deck.id).length,
    }));

    const tree: FolderNode[] = [];
    const map: Record<string, FolderNode> = {};

    folders.forEach((folder) => {
      map[folder.id] = {
        ...folder,
        children: [],
        decks: decksWithCount.filter((d) => d.folder_id === folder.id),
      };
    });

    folders.forEach((folder) => {
      if (folder.parent_id && map[folder.parent_id]) {
        map[folder.parent_id].children.push(map[folder.id]);
      } else if (!folder.parent_id) {
        tree.push(map[folder.id]);
      }
    });

    return tree;
  }, [folders, decks, flashcards]);

  const handleFolderContext = (e: React.MouseEvent, folder: FolderNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: "Practice All",
          icon: <Play className="w-4 h-4" />,
          onClick: () => {
            const allCards = getAllCardsInFolder(folder);
            if (allCards.length > 0) {
              navigate("/practice", { state: { cards: allCards, deckName: folder.name } });
            }
          },
        },
        {
          label: "Add Subfolder",
          icon: <SubfolderIcon className="w-4 h-4" />,
          onClick: () => {
            createFolder.mutate({ name: "New Subfolder", parent_id: folder.id, order: Date.now() });
          },
        },
        {
          label: "Add Deck",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {
            createDeck.mutate({ name: "New Deck", folder_id: folder.id, order: Date.now() });
          },
        },
        {
          label: "Rename",
          icon: <Edit className="w-4 h-4" />,
          onClick: () => {
            setRenameModal({ open: true, type: "folder", id: folder.id, currentName: folder.name });
          },
        },
        {
          label: "Delete",
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => deleteFolder.mutate(folder.id),
          danger: true,
        },
      ],
    });
  };

  const handleDeckContext = (e: React.MouseEvent, deck: Deck & { cardCount: number }) => {
    e.preventDefault();
    e.stopPropagation();
    const deckCards = flashcards.filter((c) => c.deck_id === deck.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: "Practice",
          icon: <Play className="w-4 h-4" />,
          onClick: () => {
            if (deckCards.length > 0) {
              navigate("/practice", { state: { cards: deckCards, deckName: deck.name } });
            }
          },
        },
        {
          label: "Edit Cards",
          icon: <Edit className="w-4 h-4" />,
          onClick: () => navigate(`/deck/${deck.id}`),
        },
        {
          label: "Add Cards (JSON)",
          icon: <FileJson className="w-4 h-4" />,
          onClick: () => setAddCardsModal({ open: true, deckId: deck.id }),
        },
        {
          label: "Rename",
          icon: <Edit className="w-4 h-4" />,
          onClick: () => {
            setRenameModal({ open: true, type: "deck", id: deck.id, currentName: deck.name });
          },
        },
        {
          label: "Delete",
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => deleteDeck.mutate(deck.id),
          danger: true,
        },
      ],
    });
  };

  const getAllCardsInFolder = (folder: FolderNode): Flashcard[] => {
    let cards: Flashcard[] = [];
    folder.decks.forEach((deck) => {
      cards.push(...flashcards.filter((c) => c.deck_id === deck.id));
    });
    folder.children.forEach((child) => {
      cards.push(...getAllCardsInFolder(child));
    });
    return cards;
  };

  const renderFolder = (folder: FolderNode, level = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const totalCards = folder.decks.reduce((acc, d) => acc + d.cardCount, 0);
    
    return (
      <motion.div
        key={folder.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="select-none"
        style={{ marginLeft: level * 20 }}
      >
        <div
          className="flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-lg cursor-pointer group border border-transparent hover:border-border transition-all"
          onClick={() => setExpandedFolders({ ...expandedFolders, [folder.id]: !isExpanded })}
          onContextMenu={(e) => handleFolderContext(e, folder)}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <FolderIcon className={`w-5 h-5 ${isExpanded ? "text-primary" : "text-muted-foreground"}`} />
          <span className="font-medium flex-1">{folder.name}</span>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
            {totalCards} cards
          </span>
        </div>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {folder.decks.map((deck) => {
              const deckCards = flashcards.filter((c) => c.deck_id === deck.id);
              const hasPracticeableCards = deckCards.length > 0;
              
              return (
                <div
                  key={deck.id}
                  className="relative flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-lg cursor-pointer group border border-transparent hover:border-border transition-all"
                  onClick={() => navigate(`/deck/${deck.id}`)}
                  onContextMenu={(e) => handleDeckContext(e, deck)}
                  style={{ marginLeft: 20 }}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <BookOpen className="w-5 h-5 text-accent" />
                  <span className="flex-1">{deck.name}</span>
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                    {deck.cardCount} cards
                  </span>
                  {hasPracticeableCards && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/practice", { state: { cards: deckCards, deckName: deck.name } });
                      }}
                      className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </motion.button>
                  )}
                </div>
              );
            })}
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">
              GPT Flasshy C's
            </h1>
          </div>
          <Button onClick={() => createFolder.mutate({ name: "New Folder", order: Date.now() })}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodoList />
          </div>
          <div>
            <StreakCounter />
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-2xl font-bold mb-4">My Decks</h2>
          {folderTree.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Start Learning!</h2>
              <p className="text-muted-foreground mb-6">Create your first folder to organize flashcards</p>
              <Button onClick={() => createFolder.mutate({ name: "My First Folder", order: Date.now() })}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">{folderTree.map((folder) => renderFolder(folder))}</div>
          )}
        </div>
      </motion.div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {renameModal && (
        <RenameModal
          open={renameModal.open}
          onClose={() => setRenameModal(null)}
          currentName={renameModal.currentName}
          title={`Rename ${renameModal.type === "folder" ? "Folder" : "Deck"}`}
          onRename={(newName) => {
            if (renameModal.type === "folder") {
              updateFolder.mutate({ id: renameModal.id, name: newName });
            }
          }}
        />
      )}

      {addCardsModal && (
        <AddCardsModal
          open={addCardsModal.open}
          onClose={() => setAddCardsModal(null)}
          deckId={addCardsModal.deckId}
        />
      )}

      <ThemeToggle />
    </div>
  );
}