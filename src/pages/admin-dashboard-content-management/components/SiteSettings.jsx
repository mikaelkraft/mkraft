import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SiteSettings = ({ settings, onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'appearance', label: 'Appearance', icon: 'Palette' },
    { id: 'social', label: 'Social Media', icon: 'Share2' },
    { id: 'seo', label: 'SEO', icon: 'Search' },
    { id: 'monetization', label: 'Monetization', icon: 'DollarSign' },
    { id: 'advanced', label: 'Advanced', icon: 'Code' }
  ];

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleUiSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      ui: { ...(prev.ui || {}), [key]: value }
    }));
    setHasChanges(true);
  };

  const handleAdsSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      ads: { ...(prev.ads || {}), [key]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Site Title</label>
          <Input
            type="text"
            value={localSettings.siteTitle}
            onChange={(e) => handleSettingChange('siteTitle', e.target.value)}
            placeholder="WisdomInTech"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Site Tagline</label>
          <Input
            type="text"
            value={localSettings.siteTagline}
            onChange={(e) => handleSettingChange('siteTagline', e.target.value)}
            placeholder="Neo-Cyberpunk Experience"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Site Description</label>
        <textarea
          value={localSettings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="A futuristic portfolio showcasing cutting-edge development work..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Contact Email</label>
          <Input
            type="email"
            value={localSettings.contactEmail}
            onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
            placeholder="mikael@cyberkraft.dev"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Admin Email</label>
          <Input
            type="email"
            value={localSettings.adminEmail}
            onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
            placeholder="admin@cyberkraft.dev"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Toast Duration (ms)</label>
          <Input
            type="number"
            min="1000"
            step="500"
            value={(localSettings.ui?.toast_duration_ms ?? 3500)}
            onChange={(e) => handleUiSettingChange('toast_duration_ms', Math.max(0, Number(e.target.value) || 0))}
            placeholder="3500"
          />
          <div className="text-xs text-text-secondary font-caption mt-1">How long to show notifications. Set to 0 to require manual dismissal.</div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-3">
          <Icon name="Video" size={20} className="text-primary" />
          <div>
            <div className="font-medium text-text-primary">Video Display</div>
            <div className="text-sm text-text-secondary font-caption">Enable video backgrounds and media</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.enableVideo}
            onChange={(e) => handleSettingChange('enableVideo', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-4">Default Theme</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['cyberpunk', 'neural', 'futuristic', 'light'].map((theme) => (
            <button
              key={theme}
              onClick={() => handleSettingChange('defaultTheme', theme)}
              className={`p-4 rounded-lg border-2 transition-all duration-fast ${
                localSettings.defaultTheme === theme
                  ? 'border-primary bg-primary/10' :'border-border-accent/20 hover:border-primary/50'
              }`}
            >
              <div className={`w-full h-16 rounded-lg mb-3 ${
                theme === 'cyberpunk' ? 'bg-gradient-to-br from-primary to-secondary' :
                theme === 'neural' ? 'bg-gradient-to-br from-accent to-primary' :
                theme === 'futuristic'? 'bg-gradient-to-br from-secondary to-accent' : 'bg-gradient-to-br from-gray-300 to-gray-500'
              }`}></div>
              <div className="text-sm font-medium text-text-primary capitalize">{theme}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-4">Font Size Options</label>
        <div className="flex items-center space-x-4">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              onClick={() => handleSettingChange('defaultFontSize', size)}
              className={`px-4 py-2 rounded-lg border transition-all duration-fast ${
                localSettings.defaultFontSize === size
                  ? 'border-primary bg-primary/10 text-primary' :'border-border-accent/20 text-text-secondary hover:border-primary/50'
              }`}
            >
              <span className={`${
                size === 'small' ? 'text-sm' :
                size === 'large' ? 'text-lg' : 'text-base'
              }`}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Logo URL</label>
          <Input
            type="url"
            value={localSettings.logoUrl}
            onChange={(e) => handleSettingChange('logoUrl', e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Favicon URL</label>
          <Input
            type="url"
            value={localSettings.faviconUrl}
            onChange={(e) => handleSettingChange('faviconUrl', e.target.value)}
            placeholder="https://example.com/favicon.ico"
          />
        </div>
      </div>
    </div>
  );

  const renderSocialSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Twitter" size={16} className="inline mr-2" />
            X (Twitter) Username
          </label>
          <Input
            type="text"
            value={localSettings.socialMedia.twitter}
            onChange={(e) => handleSettingChange('socialMedia', { ...localSettings.socialMedia, twitter: e.target.value })}
            placeholder="mikael_kraft"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Linkedin" size={16} className="inline mr-2" />
            LinkedIn Profile
          </label>
          <Input
            type="text"
            value={localSettings.socialMedia.linkedin}
            onChange={(e) => handleSettingChange('socialMedia', { ...localSettings.socialMedia, linkedin: e.target.value })}
            placeholder="in/mikael-kraft"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Github" size={16} className="inline mr-2" />
            GitHub Username
          </label>
          <Input
            type="text"
            value={localSettings.socialMedia.github}
            onChange={(e) => handleSettingChange('socialMedia', { ...localSettings.socialMedia, github: e.target.value })}
            placeholder="mikaelkraft"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Mail" size={16} className="inline mr-2" />
            Contact Email Display
          </label>
          <Input
            type="email"
            value={localSettings.socialMedia.email}
            onChange={(e) => handleSettingChange('socialMedia', { ...localSettings.socialMedia, email: e.target.value })}
            placeholder="contact@cyberkraft.dev"
          />
        </div>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Meta Keywords</label>
        <Input
          type="text"
          value={localSettings.seo.keywords}
          onChange={(e) => handleSettingChange('seo', { ...localSettings.seo, keywords: e.target.value })}
          placeholder="portfolio, developer, cyberpunk, react, javascript"
        />
        <div className="text-xs text-text-secondary font-caption mt-1">
          Separate keywords with commas
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Open Graph Image</label>
        <Input
          type="url"
          value={localSettings.seo.ogImage}
          onChange={(e) => handleSettingChange('seo', { ...localSettings.seo, ogImage: e.target.value })}
          placeholder="https://example.com/og-image.jpg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Google Analytics ID</label>
          <Input
            type="text"
            value={localSettings.seo.googleAnalytics}
            onChange={(e) => handleSettingChange('seo', { ...localSettings.seo, googleAnalytics: e.target.value })}
            placeholder="GA-XXXXXXXXX-X"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Google Search Console</label>
          <Input
            type="text"
            value={localSettings.seo.searchConsole}
            onChange={(e) => handleSettingChange('seo', { ...localSettings.seo, searchConsole: e.target.value })}
            placeholder="verification-code"
          />
        </div>
      </div>
    </div>
  );

  const renderMonetizationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Ad Provider</label>
        <select
          className="w-full px-4 py-2 bg-surface border border-border-accent/20 rounded-lg text-text-primary"
          value={localSettings.ads?.provider || 'adsense'}
          onChange={(e) => handleAdsSettingChange('provider', e.target.value)}
        >
          <option value="adsense">Google AdSense</option>
          <option value="yllix">Yllix</option>
          <option value="custom">Custom Script</option>
        </select>
      </div>
      <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/20">
        <div className="flex items-center space-x-3">
          <Icon name="BadgeDollarSign" size={20} className="text-accent" />
          <div>
            <div className="font-medium text-text-primary">Enable Blog Ads (AdSense)</div>
            <div className="text-sm text-text-secondary font-caption">Show ads in the blog grid and optionally enable Auto Ads</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!localSettings.ads?.enabled}
            onChange={(e) => handleAdsSettingChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface rounded-full peer peer-checked:bg-accent"></div>
        </label>
      </div>

      {(!localSettings.ads?.provider || localSettings.ads?.provider === 'adsense') && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">AdSense Publisher ID</label>
          <Input
            type="text"
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            value={localSettings.ads?.publisher_id || ''}
            onChange={(e) => handleAdsSettingChange('publisher_id', e.target.value)}
          />
          <div className="text-xs text-text-secondary font-caption mt-1">Required by AdSense. Copy from your AdSense account.</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Ad Slot ID (optional)</label>
          <Input
            type="text"
            placeholder="1234567890"
            value={localSettings.ads?.ad_slot || ''}
            onChange={(e) => handleAdsSettingChange('ad_slot', e.target.value)}
          />
          <div className="text-xs text-text-secondary font-caption mt-1">If empty, only Auto Ads are used (if enabled).</div>
        </div>
      </div>
      )}

      {localSettings.ads?.provider === 'yllix' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Yllix Publisher ID</label>
            <Input
              type="text"
              placeholder="Your Yllix publisher id"
              value={localSettings.ads?.yllix_publisher_id || ''}
              onChange={(e) => handleAdsSettingChange('yllix_publisher_id', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Yllix Ad Unit Code</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Paste the ad unit script snippet provided by Yllix"
              value={localSettings.ads?.yllix_unit_code || ''}
              onChange={(e) => handleAdsSettingChange('yllix_unit_code', e.target.value)}
            />
            <div className="text-xs text-text-secondary font-caption mt-1">We will inject this safely into the blog grid at your interval.</div>
          </div>
        </div>
      )}

      {localSettings.ads?.provider === 'custom' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Custom Script URL</label>
            <Input
              type="url"
              placeholder="https://cdn.example.com/ads.js"
              value={localSettings.ads?.custom_script_url || ''}
              onChange={(e) => handleAdsSettingChange('custom_script_url', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Custom Ad HTML</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="<div class='your-ad'></div>"
              value={localSettings.ads?.custom_ad_html || ''}
              onChange={(e) => handleAdsSettingChange('custom_ad_html', e.target.value)}
            />
            <div className="text-xs text-text-secondary font-caption mt-1">Custom HTML placed as ad content. Use responsibly.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-2">
          <input id="auto-ads" type="checkbox" className="w-4 h-4" checked={!!localSettings.ads?.auto_ads} onChange={(e) => handleAdsSettingChange('auto_ads', e.target.checked)} />
          <label htmlFor="auto-ads" className="text-sm text-text-secondary">Enable Auto Ads</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Grid Ad Interval</label>
          <Input
            type="number"
            min="3"
            step="1"
            value={localSettings.ads?.grid_interval ?? 6}
            onChange={(e) => handleAdsSettingChange('grid_interval', Math.max(1, Number(e.target.value) || 6))}
          />
          <div className="text-xs text-text-secondary font-caption mt-1">Insert an ad after this many posts (requires Ad Slot ID).</div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
        <div className="flex items-center space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning" />
          <div>
            <div className="font-medium text-text-primary">Maintenance Mode</div>
            <div className="text-sm text-text-secondary font-caption">Temporarily disable public access</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.maintenanceMode}
            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warning/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Custom CSS</label>
        <textarea
          value={localSettings.customCSS}
          onChange={(e) => handleSettingChange('customCSS', e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none font-code text-sm"
          placeholder="/* Add your custom CSS here */"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Custom JavaScript</label>
        <textarea
          value={localSettings.customJS}
          onChange={(e) => handleSettingChange('customJS', e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none font-code text-sm"
          placeholder="// Add your custom JavaScript here"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Site Settings</h1>
          <p className="text-text-secondary font-caption mt-2">
            Configure your portfolio website settings and preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              iconName="Save"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-border-accent/20 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-fast ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10 border-b-2 border-primary' :'text-text-secondary hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}
          {activeTab === 'social' && renderSocialSettings()}
          {activeTab === 'seo' && renderSEOSettings()}
          {activeTab === 'monetization' && renderMonetizationSettings()}
          {activeTab === 'advanced' && renderAdvancedSettings()}
        </div>
      </div>

      {/* Save Notice */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-primary text-background px-6 py-3 rounded-lg shadow-glow-primary">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm font-medium">You have unsaved changes</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteSettings;