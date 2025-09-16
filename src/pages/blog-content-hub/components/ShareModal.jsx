import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ShareModal = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const shareUrl = `${window.location.origin}/blog/${post.id}`;
  const shareText = `Check out this blog post: ${post.title}`;

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-400 hover:text-blue-300'
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-600 hover:text-blue-500'
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-500 hover:text-blue-400'
    },
    {
      name: 'Reddit',
      icon: 'MessageSquare',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`,
      color: 'text-orange-500 hover:text-orange-400'
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (url) => {
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-surface rounded-lg border border-border-accent/20 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-accent/20">
            <h3 className="font-heading font-semibold text-lg text-text-primary">
              Share Post
            </h3>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
              className="text-text-secondary hover:text-primary"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Post Preview */}
            <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border-accent/20">
              <h4 className="font-medium text-text-primary text-sm mb-2 line-clamp-2">
                {post.title}
              </h4>
              <p className="text-text-secondary text-xs line-clamp-2">
                {post.excerpt}
              </p>
            </div>

            {/* Copy Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Copy Link
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-background/50 text-text-secondary text-sm"
                />
                <Button
                  variant={copied ? "success" : "outline"}
                  size="sm"
                  iconName={copied ? "Check" : "Copy"}
                  onClick={handleCopyLink}
                  className="min-w-[80px]"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Social Platforms */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Share on Social Media
              </label>
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare(platform.url)}
                    className={`
                      justify-start space-x-2 hover:border-primary/40 transition-all duration-fast
                      ${platform.color}
                    `}
                  >
                    <Icon name={platform.icon} size={18} />
                    <span>{platform.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Email Share */}
            <div className="mt-6 pt-6 border-t border-border-accent/20">
              <Button
                variant="ghost"
                size="sm"
                iconName="Mail"
                onClick={() => {
                  const subject = encodeURIComponent(`Check out: ${post.title}`);
                  const body = encodeURIComponent(`I thought you might be interested in this blog post:\n\n${post.title}\n${shareUrl}`);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
                className="w-full justify-center text-text-secondary hover:text-primary hover:bg-primary/10"
              >
                Share via Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;