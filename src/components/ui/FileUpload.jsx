import React, { useRef, useState } from 'react';
import Button from './Button';
import Icon from '../AppIcon';
import storageService from '../../utils/storageService';

const ACCEPT_MAP = {
  image: 'image/*',
  icon: '.ico,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml',
  video: 'video/*',
  document: '.pdf,.doc,.docx',
};

const FileUpload = ({
  label = 'Upload file',
  value,
  onChange,
  bucket = 'media',
  pathPrefix = 'uploads',
  accept = 'image',
  disabled = false,
  helperText,
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    const res = await storageService.uploadFile(file, { bucket, pathPrefix });
    setUploading(false);
    if (!res.success) {
      setError(res.error || 'Upload failed');
      return;
    }
    onChange?.(res.data.url, res.data);
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`flex items-center gap-3 p-3 border rounded-lg bg-surface ${uploading ? 'opacity-70' : ''} border-border-accent/20`}
      >
        <input ref={inputRef} type="file" accept={ACCEPT_MAP[accept] || accept} className="hidden" onChange={onInputChange} />
        <div className="w-24 h-16 rounded bg-background/40 border border-border-accent/20 flex items-center justify-center overflow-hidden">
          {value ? (
            (() => {
              const isVideo = (accept === 'video') || /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(value));
              const isDocument = (accept === 'document') || /\.(pdf|doc|docx)(\?|#|$)/i.test(String(value));
              if (isVideo) {
                return (
                  <video
                    src={value}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    loop
                  />
                );
              }
              if (isDocument) {
                return (
                  <Icon name="FileText" size={20} className="text-primary" />
                );
              }
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="preview" className="w-full h-full object-cover" />
              );
            })()
          ) : (
            <Icon name={accept === 'video' ? 'Video' : accept === 'document' ? 'FileText' : 'Image'} size={20} className="text-text-secondary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-secondary truncate">{value || 'No file selected'}</div>
          {helperText && <div className="text-[11px] text-text-secondary/70">{helperText}</div>}
          {error && <div className="text-[11px] text-error mt-1">{error}</div>}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={handlePick} disabled={disabled || uploading}>
            {uploading ? 'Uploading…' : 'Choose File'}
          </Button>
          {value && (
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Open</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
