-- 1. Remove duplicate entries, keeping only the one with the smallest ID
DELETE FROM public.posts_sermons
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.posts_sermons
  GROUP BY youtube_url
);

-- 2. Add unique constraint to youtube_url in posts_sermons table
ALTER TABLE public.posts_sermons
ADD CONSTRAINT posts_sermons_youtube_url_key UNIQUE (youtube_url);
