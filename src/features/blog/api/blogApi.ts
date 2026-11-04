import { BlogPost, BlogCategory, BlogTag, BlogAuthor, InternalLinkItem } from '../types/blog.types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1') + '/blog';

function getAdminAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('focusfix_admin_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    localStorage.removeItem('focusfix_admin_token');
    localStorage.removeItem('focusfix_admin_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.');
  }
  return res;
}

/** Every blog call goes to the server; failures throw so the UI never shows unsaved data as saved */
async function request<T = any>(path: string, init: RequestInit = {}, fallbackError = 'فشل الطلب'): Promise<T> {
  const res = await authFetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: getAdminAuthHeaders(init.body ? { 'Content-Type': 'application/json' } : {}),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `${fallbackError} (${res.status})`);
  return body as T;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-|-$/g, '');

/** Quick SEO health score for the articles list (the editor shows the detailed checklist) */
function seoScore(p: any): number {
  const title = String(p.meta_title_ar || p.title_ar || '');
  const desc = String(p.meta_desc_ar || p.excerpt_ar || '');
  const text = String(p.content_html || '').replace(/<[^>]*>/g, ' ');
  const keyword = String(p.focus_keyword || '').trim().toLowerCase();
  const checks = [
    title.length >= 30 && title.length <= 65,
    desc.length >= 70 && desc.length <= 160,
    !!keyword,
    !!keyword && title.toLowerCase().includes(keyword),
    !!keyword && text.toLowerCase().includes(keyword),
    text.split(/\s+/).filter(Boolean).length >= 300,
    !!p.featured_image,
    !!p.featured_image_alt,
    /<h2[\s>]/i.test(String(p.content_html || '')),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function mapPost(p: any): BlogPost {
  return {
    seoScore: seoScore(p),
    id: p.id,
    slug: p.slug,
    titleAr: p.title_ar,
    titleEn: p.title_en,
    excerptAr: p.excerpt_ar,
    excerptEn: p.excerpt_en,
    contentHtml: p.content_html,
    contentHtmlEn: p.content_html_en,
    categoryId: p.category_id,
    category: p.category ? { id: p.category.id, nameAr: p.category.name_ar, nameEn: p.category.name_en, slug: p.category.slug } : undefined,
    authorId: p.author_id,
    author: p.author
      ? { id: p.author.id, nameAr: p.author.name_ar, nameEn: p.author.name_en, slug: p.author.slug || p.author.id, avatarUrl: p.author.avatar_url }
      : undefined,
    tags: Array.isArray(p.tags)
      ? p.tags.map((t: any) => {
          const tag = t.tag || t;
          return { id: tag.id, nameAr: tag.name_ar, nameEn: tag.name_en, slug: tag.slug };
        })
      : [],
    featuredImage: p.featured_image,
    featuredImageAlt: p.featured_image_alt,
    featuredImageCaption: p.featured_image_caption,
    focusKeyword: p.focus_keyword,
    seoTitle: p.meta_title_ar,
    seoDesc: p.meta_desc_ar,
    canonicalUrl: p.canonical_url,
    robotsIndex: p.robots_index,
    robotsFollow: p.robots_follow,
    status: p.status,
    readingMinutes: p.reading_minutes || 1,
    viewsCount: p.views_count || 0,
    publishedAt: p.published_at,
    scheduledAt: p.scheduled_at,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  } as BlogPost;
}

function toPostPayload(postData: Partial<BlogPost>) {
  return {
    title_ar: postData.titleAr,
    title_en: postData.titleEn || postData.titleAr,
    slug: postData.slug,
    content_html: postData.contentHtml,
    content_html_en: postData.contentHtmlEn,
    excerpt_ar: postData.excerptAr,
    excerpt_en: postData.excerptEn,
    category_id: postData.categoryId || null,
    author_id: postData.authorId || null,
    featured_image: postData.featuredImage,
    featured_image_alt: postData.featuredImageAlt,
    featured_image_caption: postData.featuredImageCaption,
    focus_keyword: postData.focusKeyword,
    meta_title_ar: postData.seoTitle,
    meta_desc_ar: postData.seoDesc,
    canonical_url: postData.canonicalUrl,
    robots_index: postData.robotsIndex,
    robots_follow: postData.robotsFollow,
    status: postData.status,
    scheduled_at: postData.scheduledAt,
    tags: postData.tags?.map((t) => t.id),
  };
}

const mapCategory = (c: any): BlogCategory => ({
  id: c.id,
  nameAr: c.name_ar,
  nameEn: c.name_en || c.name_ar,
  slug: c.slug,
  descriptionAr: c.description_ar,
  descriptionEn: c.description_en,
  parentId: c.parent_id,
  postCount: c._count?.posts || 0,
});

const mapAuthor = (a: any): BlogAuthor => ({
  id: a.id,
  nameAr: a.name_ar,
  nameEn: a.name_en || a.name_ar,
  slug: a.slug,
  avatarUrl: a.avatar_url || '',
  roleTitle: a.role_title || '',
  bioAr: a.bio_ar,
  bioEn: a.bio_en,
  postCount: a._count?.posts || 0,
});

const mapTag = (t: any): BlogTag => ({
  id: t.id,
  nameAr: t.name_ar,
  nameEn: t.name_en,
  slug: t.slug,
  postCount: t._count?.posts || 0,
});

export const blogApi = {
  // 1. Articles CRUD
  async getAllPosts(params?: {
    status?: string;
    categoryId?: string;
    authorId?: string;
    search?: string;
    date?: string;
  }): Promise<{ posts: BlogPost[]; counts: Record<string, number> }> {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '') as Array<[string, string]>
    ).toString();
    const data = await request(`/admin/all?${query}`, {}, 'تعذر تحميل المقالات');
    return {
      posts: (data.posts || []).map(mapPost),
      counts: data.counts || { all: 0, published: 0, draft: 0, scheduled: 0, trash: 0 },
    };
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      return mapPost(await request(`/admin/posts/${id}`));
    } catch {
      return null;
    }
  },

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    const created = await request(
      '/admin/posts',
      { method: 'POST', body: JSON.stringify({ ...toPostPayload(postData), status: postData.status || 'draft' }) },
      'فشل في إنشاء المقال'
    );
    return { ...postData, ...mapPost(created) } as BlogPost;
  },

  async updatePost(id: string, postData: Partial<BlogPost>): Promise<BlogPost> {
    const updated = await request(`/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(toPostPayload(postData)) }, 'فشل في تحديث المقال');
    return { ...postData, ...mapPost(updated) } as BlogPost;
  },

  async duplicatePost(id: string): Promise<BlogPost> {
    return mapPost(await request(`/admin/posts/${id}/duplicate`, { method: 'POST' }, 'فشل نسخ المقال'));
  },

  async moveToTrash(id: string): Promise<void> {
    await request(`/admin/posts/${id}/trash`, { method: 'PATCH' }, 'فشل نقل المقال للمهملات');
  },

  async restoreFromTrash(id: string): Promise<void> {
    await request(`/admin/posts/${id}/restore`, { method: 'PATCH' }, 'فشل استرجاع المقال');
  },

  async permanentlyDelete(id: string): Promise<void> {
    await request(`/admin/posts/${id}`, { method: 'DELETE' }, 'فشل حذف المقال');
  },

  async bulkAction(ids: string[], action: 'trash' | 'restore' | 'delete' | 'publish' | 'draft'): Promise<void> {
    if (ids.length === 0) return;
    await request(
      '/admin/bulk',
      {
        method: 'PATCH',
        body: JSON.stringify({
          ids,
          action: action === 'delete' ? 'delete' : action === 'trash' ? 'trash' : 'change_status',
          value: action === 'publish' ? 'published' : action === 'draft' || action === 'restore' ? 'draft' : undefined,
        }),
      },
      'فشل تنفيذ الإجراء'
    );
  },

  // 2. Categories CRUD
  async getCategories(): Promise<BlogCategory[]> {
    const data = await request('/admin/categories', {}, 'تعذر تحميل التصنيفات');
    return Array.isArray(data) ? data.map(mapCategory) : [];
  },

  async createCategory(cat: Partial<BlogCategory>): Promise<BlogCategory> {
    const created = await request(
      '/admin/categories',
      {
        method: 'POST',
        body: JSON.stringify({
          name_ar: cat.nameAr,
          name_en: cat.nameEn || cat.nameAr,
          slug: cat.slug || slugify(cat.nameEn || cat.nameAr || ''),
          description_ar: cat.descriptionAr,
          description_en: cat.descriptionEn,
          parent_id: cat.parentId || null,
        }),
      },
      'فشل إنشاء التصنيف'
    );
    return mapCategory(created);
  },

  async updateCategory(id: string, cat: Partial<BlogCategory>): Promise<BlogCategory> {
    const updated = await request(
      `/admin/categories/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name_ar: cat.nameAr,
          name_en: cat.nameEn || cat.nameAr,
          slug: cat.slug,
          description_ar: cat.descriptionAr,
          description_en: cat.descriptionEn,
          parent_id: cat.parentId || null,
        }),
      },
      'فشل تحديث التصنيف'
    );
    return mapCategory(updated);
  },

  async deleteCategory(id: string): Promise<void> {
    await request(`/admin/categories/${id}`, { method: 'DELETE' }, 'فشل حذف التصنيف');
  },

  // 3. Tags CRUD
  async getTags(query?: string): Promise<BlogTag[]> {
    const data = await request(query ? `/admin/tags?q=${encodeURIComponent(query)}` : '/admin/tags', {}, 'تعذر تحميل الوسوم');
    return Array.isArray(data) ? data.map(mapTag) : [];
  },

  async createTag(nameAr: string, nameEn?: string): Promise<BlogTag> {
    const created = await request(
      '/admin/tags',
      { method: 'POST', body: JSON.stringify({ name_ar: nameAr, name_en: nameEn || nameAr, slug: slugify(nameEn || nameAr) }) },
      'فشل إنشاء الوسم'
    );
    return mapTag(created);
  },

  async deleteTag(id: string): Promise<void> {
    await request(`/admin/tags/${id}`, { method: 'DELETE' }, 'فشل حذف الوسم');
  },

  // 4. Authors CRUD
  async getAuthors(): Promise<BlogAuthor[]> {
    const data = await request('/admin/authors', {}, 'تعذر تحميل الكتّاب');
    return Array.isArray(data) ? data.map(mapAuthor) : [];
  },

  async createAuthor(authorData: Partial<BlogAuthor>): Promise<BlogAuthor> {
    const created = await request(
      '/admin/authors',
      {
        method: 'POST',
        body: JSON.stringify({
          name_ar: authorData.nameAr,
          name_en: authorData.nameEn || authorData.nameAr,
          slug: authorData.slug || slugify(authorData.nameEn || authorData.nameAr || `author-${Date.now()}`),
          avatar_url: authorData.avatarUrl,
          role_title: authorData.roleTitle,
          bio_ar: authorData.bioAr,
          bio_en: authorData.bioEn,
        }),
      },
      'فشل إضافة الكاتب'
    );
    return mapAuthor(created);
  },

  async updateAuthor(id: string, authorData: Partial<BlogAuthor>): Promise<BlogAuthor> {
    const updated = await request(
      `/admin/authors/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name_ar: authorData.nameAr,
          name_en: authorData.nameEn || authorData.nameAr,
          slug: authorData.slug,
          avatar_url: authorData.avatarUrl,
          role_title: authorData.roleTitle,
          bio_ar: authorData.bioAr,
          bio_en: authorData.bioEn,
        }),
      },
      'فشل تحديث الكاتب'
    );
    return mapAuthor(updated);
  },

  async deleteAuthor(id: string): Promise<void> {
    await request(`/admin/authors/${id}`, { method: 'DELETE' }, 'فشل حذف الكاتب');
  },

  // 5. Internal Links Assistant
  async searchInternalLinks(q: string): Promise<InternalLinkItem[]> {
    const res = await fetch(`${API_BASE_URL}/internal-links?q=${encodeURIComponent(q)}`);
    return res.ok ? res.json() : [];
  },
};
