// Shared validation helpers

export const isValidUrl = (v = '') => !v || /^https?:\/\//i.test(v);
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email = '') => EMAIL_REGEX.test(email);
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const validateProject = (data = {}) => {
  const errs = {};
  if (!data.title?.trim()) errs.title = 'Title is required';
  if (!isValidUrl(data.image)) errs.image = 'Image must be a valid URL';
  if (!isValidUrl(data.github_url)) errs.github_url = 'GitHub URL must be valid';
  if (!isValidUrl(data.live_url)) errs.live_url = 'Live URL must be valid';
  return errs;
};

export const validateSlide = (data = {}) => {
  const errs = {};
  if (!data.title?.trim()) errs.title = 'Title is required';
  if (!isValidUrl(data.backgroundImage)) errs.backgroundImage = 'Background Image must be a valid URL';
  if (data.ctaLink && !isValidUrl(data.ctaLink)) errs.ctaLink = 'CTA Link must be a valid URL';
  if (data.duration !== undefined && data.duration !== null && Number(data.duration) < 1) errs.duration = 'Duration must be at least 1 second';
  if (data.order !== undefined && data.order !== null && Number(data.order) < 1) errs.order = 'Order must be >= 1';
  return errs;
};

export const validateBlog = (data = {}) => {
  const errs = {};
  if (!data.title?.trim()) errs.title = 'Title is required';
  if (data.status === 'published' && !data.content?.trim()) errs.content = 'Content is required to publish';
  if (!isValidUrl(data.featuredImage)) errs.featuredImage = 'Featured Image must be a valid URL';
  if (data.readTime !== undefined && data.readTime !== null && Number(data.readTime) < 1) errs.readTime = 'Read time must be at least 1 minute';
  if (data.slug && !SLUG_REGEX.test(String(data.slug))) errs.slug = 'Slug can only contain lowercase letters, numbers and dashes';
  if ((data.metaTitle || '').length > 70) errs.metaTitle = 'Meta title should be 70 characters or less';
  if ((data.metaDescription || '').length > 160) errs.metaDescription = 'Meta description should be 160 characters or less';
  return errs;
};

export const validateNewsletter = (data = {}) => {
  const errs = {};
  if (!data.email?.trim()) errs.email = 'Email is required';
  if (data.email && !isValidEmail(data.email)) errs.email = 'Email must be a valid email address';
  if ((data.name || '').length > 100) errs.name = 'Name should be 100 characters or less';
  return errs;
};

export default {
  isValidUrl,
  isValidEmail,
  validateProject,
  validateSlide,
  validateBlog,
  validateNewsletter,
  SLUG_REGEX,
};
