-- Creează tabelă pentru ture
CREATE TABLE public.shifts (
  id TEXT PRIMARY KEY,
  dispatcher TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  final_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Creează tabelă pentru tranzacții
CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('intrare', 'iesire')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dispatcher TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexuri pentru performanță
CREATE INDEX idx_shifts_dispatcher ON public.shifts(dispatcher);
CREATE INDEX idx_shifts_start_time ON public.shifts(start_time DESC);
CREATE INDEX idx_transactions_shift_id ON public.transactions(shift_id);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp DESC);

-- Activează Row Level Security
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politici RLS - acces public pentru sistem intern de dispecerat
CREATE POLICY "Toată lumea poate vizualiza turele"
  ON public.shifts FOR SELECT
  USING (true);

CREATE POLICY "Toată lumea poate crea ture"
  ON public.shifts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Toată lumea poate actualiza turele"
  ON public.shifts FOR UPDATE
  USING (true);

CREATE POLICY "Toată lumea poate vizualiza tranzacțiile"
  ON public.transactions FOR SELECT
  USING (true);

CREATE POLICY "Toată lumea poate crea tranzacții"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- Activează realtime pentru sincronizare automată
ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;