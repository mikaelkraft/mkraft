-- Migration: Add ui_settings JSONB to store UI preferences (e.g., toast duration)
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS ui_settings JSONB DEFAULT '{}'::jsonb;

-- Optional: seed default toast duration if column exists but empty
UPDATE public.site_settings
SET ui_settings = COALESCE(ui_settings, '{}'::jsonb) || jsonb_build_object('toast_duration_ms', 3500)
WHERE (ui_settings IS NULL) OR (ui_settings ? 'toast_duration_ms' = false);
