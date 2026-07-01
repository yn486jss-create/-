create extension if not exists pgcrypto;

create table if not exists public.sentiment_analysis_logs (
  id uuid primary key default gen_random_uuid(),
  input_text text not null check (char_length(input_text) between 1 and 1000),
  sentiment text check (sentiment in ('positive', 'negative', 'neutral')),
  confidence numeric(5, 2) check (confidence >= 0 and confidence <= 100),
  reason text,
  request_status text not null check (request_status in ('success', 'failed')),
  error_code text,
  error_message text,
  openai_model text,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sentiment_analysis_logs_created_at
on public.sentiment_analysis_logs (created_at desc);

create index if not exists idx_sentiment_analysis_logs_sentiment
on public.sentiment_analysis_logs (sentiment);

alter table public.sentiment_analysis_logs enable row level security;
