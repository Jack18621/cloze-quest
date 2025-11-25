-- Create mastery enum
CREATE TYPE public.mastery_level AS ENUM ('red', 'orange', 'yellow', 'green');

-- Create folders table with hierarchical support
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  "order" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create decks table
CREATE TABLE public.decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  "order" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  front_side TEXT NOT NULL DEFAULT 'question',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create flashcards table with mastery tracking
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  "order" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  mastery mastery_level NOT NULL DEFAULT 'red',
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies for folders (public access for now - can add auth later)
CREATE POLICY "Anyone can view folders" ON public.folders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert folders" ON public.folders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update folders" ON public.folders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete folders" ON public.folders FOR DELETE USING (true);

-- Create policies for decks
CREATE POLICY "Anyone can view decks" ON public.decks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert decks" ON public.decks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update decks" ON public.decks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete decks" ON public.decks FOR DELETE USING (true);

-- Create policies for flashcards
CREATE POLICY "Anyone can view flashcards" ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "Anyone can insert flashcards" ON public.flashcards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update flashcards" ON public.flashcards FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete flashcards" ON public.flashcards FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_folders_order ON public.folders("order");
CREATE INDEX idx_decks_folder_id ON public.decks(folder_id);
CREATE INDEX idx_decks_order ON public.decks("order");
CREATE INDEX idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX idx_flashcards_order ON public.flashcards("order");
CREATE INDEX idx_flashcards_mastery ON public.flashcards(mastery);
CREATE INDEX idx_flashcards_last_reviewed ON public.flashcards(last_reviewed_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON public.decks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();