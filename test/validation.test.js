import { describe, it, expect } from 'vitest';
import { isValidUrl, validateProject, validateSlide, validateBlog } from '../src/utils/validation/index.js';

describe('validation helpers', () => {
  it('isValidUrl accepts http/https or empty', () => {
    expect(isValidUrl('')).toBe(true);
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('validateProject flags missing title and bad URLs', () => {
    const errs1 = validateProject({});
    expect(errs1.title).toBeTruthy();

    const errs2 = validateProject({ title: 'Ok', image: 'notaurl' });
    expect(errs2.image).toBeTruthy();

    const errs3 = validateProject({ title: 'Ok', image: 'https://img', github_url: 'https://github.com', live_url: '' });
    expect(errs3.image).toBeFalsy();
    expect(Object.keys(errs3).length).toBe(0);
  });

  it('validateSlide basics', () => {
    const errs1 = validateSlide({});
    expect(errs1.title).toBeTruthy();

    const errs2 = validateSlide({ title: 'Slide', backgroundImage: 'http://ok', ctaLink: 'notaurl', duration: 0, order: 0 });
    expect(errs2.ctaLink).toBeTruthy();
    expect(errs2.duration).toBeTruthy();
    expect(errs2.order).toBeTruthy();

    const errs3 = validateSlide({ title: 'S', backgroundImage: 'https://ok', ctaLink: 'https://ok', duration: 5, order: 1 });
    expect(Object.keys(errs3).length).toBe(0);
  });

  it('validateBlog basics', () => {
    const errs1 = validateBlog({});
    expect(errs1.title).toBeTruthy();

    const errs2 = validateBlog({ title: 'T', status: 'published', content: '' });
    expect(errs2.content).toBeTruthy();

    const errs3 = validateBlog({ title: 'T', status: 'draft', featuredImage: 'notaurl', readTime: 0 });
    expect(errs3.featuredImage).toBeTruthy();
    expect(errs3.readTime).toBeTruthy();

    const errs4 = validateBlog({ title: 'T', status: 'draft', content: 'x', featuredImage: 'https://ok', readTime: 3 });
    expect(Object.keys(errs4).length).toBe(0);
  });
});
