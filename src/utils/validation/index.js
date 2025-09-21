// Shared validation helpers

export const isValidUrl = (v = '') => !v || /^https?:\/\//i.test(v);

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
  return errs;
};

export default {
  isValidUrl,
  validateProject,
  validateSlide,
  validateBlog,
};
