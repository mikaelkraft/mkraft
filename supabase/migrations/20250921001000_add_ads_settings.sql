-- Add ads_settings JSONB to store AdSense and monetization preferences
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS ads_settings JSONB DEFAULT '{}'::jsonb;

-- Seed defaults
UPDATE public.site_settings
SET ads_settings = COALESCE(ads_settings, '{}'::jsonb) || jsonb_build_object(
  'enabled', false,
  'provider', 'adsense',
  'publisher_id', null,
  'auto_ads', true,
  'grid_interval', 6,
  'ad_slot', null
)
WHERE ads_settings IS NULL OR jsonb_typeof(ads_settings) <> 'object';
