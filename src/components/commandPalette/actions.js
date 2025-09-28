// Central action registry for the command palette.
// Each action: { id, title, keywords?: string[], run(navigate) }

export const coreActions = [
  {
    id: 'new-post',
    title: 'New Blog Post',
    keywords: ['blog','post','create'],
    run: (nav) => nav('/admin-dashboard-content-management')
  },
  {
    id: 'media-library',
    title: 'Open Media Library',
    keywords: ['media','assets','images'],
    run: (nav) => nav('/admin/media')
  },
  {
    id: 'projects',
    title: 'Projects Dashboard',
    keywords: ['project','portfolio'],
    run: (nav) => nav('/projects-portfolio-grid')
  },
  {
    id: 'home',
    title: 'Go Home',
    keywords: ['root','landing','home'],
    run: (nav) => nav('/')
  }
];

export function buildEphemeralActions(query) {
  const actions = [];
  if (/^(post:|p:)/i.test(query)) {
    const title = query.replace(/^(post:|p:)/i, '').trim();
    if (title.length >= 3) {
      actions.push({
        id: 'inline-create-post',
        title: `Create Post: “${title}”`,
        run: (nav) => nav(`/admin-dashboard-content-management?new=post&title=${encodeURIComponent(title)}`)
      });
    }
  }
  return actions;
}
