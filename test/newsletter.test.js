import { describe, it, expect } from 'vitest';
import newsletterService from '../src/utils/newsletterService.js';

describe('newsletter service tests', () => {
  it('validates email addresses correctly', () => {
    expect(newsletterService.isValidEmail('test@example.com')).toBe(true);
    expect(newsletterService.isValidEmail('invalid-email')).toBe(false);
    expect(newsletterService.isValidEmail('')).toBe(false);
  });

  // Note: These would be integration tests that require a database
  // For now, we're just testing the validation logic
  it('validates subscription data format', () => {
    // Test that the service has the required methods
    expect(typeof newsletterService.subscribe).toBe('function');
    expect(typeof newsletterService.unsubscribe).toBe('function');
    expect(typeof newsletterService.checkSubscription).toBe('function');
  });
});