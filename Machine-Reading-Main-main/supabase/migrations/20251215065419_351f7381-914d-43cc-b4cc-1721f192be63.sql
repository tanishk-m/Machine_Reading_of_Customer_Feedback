-- Create reviews table for storing analyzed reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'amazon',
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create insights table for storing generated actionable insights
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  impact_area TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_sessions table for batch uploads
CREATE TABLE public.analysis_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  total_reviews INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  avg_sentiment_score DECIMAL(3,2),
  platform TEXT NOT NULL DEFAULT 'amazon',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (but allow public access for demo purposes)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo - no auth required)
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert to reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to insights" ON public.insights FOR SELECT USING (true);
CREATE POLICY "Allow public insert to insights" ON public.insights FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to sessions" ON public.analysis_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to sessions" ON public.analysis_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to sessions" ON public.analysis_sessions FOR UPDATE USING (true);