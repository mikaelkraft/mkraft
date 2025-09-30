// Auth modal (login only)

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-md">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-surface border border-border-accent rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary transition-all shadow-glow-primary"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Auth Form */}
          <Login onClose={onClose} onSuccess={handleSuccess} />

          {/* Mode Switch */}
          <div className="mt-4 text-center text-sm text-text-secondary">
            Signup is disabled. Only the site owner can access the admin
            dashboard.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
