import { describe, it, expect } from 'vitest';
import { sanitize } from '../api/_lib/sanitize.js';

describe('sanitize video embedding', () => {
  const yt = '<p>Intro</p><iframe src="https://www.youtube.com/embed/abc123" width="560" height="315" allowfullscreen title="Video"></iframe><p>After</p>';
  const vimeo = '<iframe src="https://player.vimeo.com/video/987654" frameborder="0"></iframe>';
  const bad = '<iframe src="https://evil.com/embed/malware" allow="autoplay"></iframe>';

  it('removes iframes when allowVideo=false (default)', () => {
    const out = sanitize(yt);
    expect(out).not.toContain('iframe');
  });

  it('keeps whitelisted YouTube iframe when allowVideo=true', () => {
    const out = sanitize(yt, { allowVideo: true });
    expect(out).toContain('youtube.com/embed/abc123');
    // ensures tag remains
    expect(out.match(/<iframe/g)?.length).toBe(1);
  });

  it('keeps whitelisted Vimeo iframe when allowVideo=true', () => {
    const out = sanitize(vimeo, { allowVideo: true });
    expect(out).toContain('player.vimeo.com');
  });

  it('strips non-whitelisted iframe even when allowVideo=true', () => {
    const out = sanitize(bad, { allowVideo: true });
    expect(out).not.toContain('evil.com');
    expect(out).not.toContain('<iframe');
  });
});
