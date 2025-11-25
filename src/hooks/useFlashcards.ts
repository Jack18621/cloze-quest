import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Deck {
  id: string;
  name: string;
  folder_id: string | null;
  order: number;
  front_side: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deck_id: string;
  order: number;
  mastery: "red" | "orange" | "yellow" | "green";
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useFolders = () => {
  return useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as Folder[];
    },
  });
};

export const useDecks = () => {
  return useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as Deck[];
    },
  });
};

export const useFlashcards = () => {
  return useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return data as Flashcard[];
    },
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (folder: Partial<Folder>) => {
      const { data, error } = await supabase
        .from("folders")
        .insert([folder] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder created!");
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Folder> & { id: string }) => {
      const { data, error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("folders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder deleted!");
    },
  });
};

export const useCreateDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deck: Partial<Deck>) => {
      const { data, error } = await supabase
        .from("decks")
        .insert([deck] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast.success("Deck created!");
    },
  });
};

export const useUpdateDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deck> & { id: string }) => {
      const { data, error } = await supabase
        .from("decks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export const useDeleteDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("decks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast.success("Deck deleted!");
    },
  });
};

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flashcard: Partial<Flashcard>) => {
      const { data, error } = await supabase
        .from("flashcards")
        .insert([flashcard] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Flashcard> & { id: string }) => {
      const { data, error } = await supabase
        .from("flashcards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
};

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("flashcards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
};

export const useBulkCreateFlashcards = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flashcards: Partial<Flashcard>[]) => {
      const { data, error } = await supabase
        .from("flashcards")
        .insert(flashcards as any)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      toast.success(`${data.length} cards imported!`);
    },
  });
};