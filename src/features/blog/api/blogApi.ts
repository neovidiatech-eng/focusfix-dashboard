import { BlogPost, BlogCategory, BlogTag, BlogAuthor, InternalLinkItem } from '../types/blog.types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1') + '/blog';

function getAdminAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('focusfix_admin_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

const isUuid = (val?: string | null) =>
  val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) : false;

// Initial Fallback categories
const initialCategories: BlogCategory[] = [
  {
    id: '74539e38-9d2a-4439-a8c9-3c14564c6498',
    nameAr: 'شاشات الآيفون',
    nameEn: 'iPhone Screens',
    slug: 'iphone-screens',
    descriptionAr: 'كل ما يخص تغيير وفحص شاشات أجهزة آبل الأصلية',
    postCount: 0,
  },
  {
    id: 'cdeb5805-0431-4cc5-86e1-bd2ae0c3b4a0',
    nameAr: 'بطاريات أبل',
    nameEn: 'Apple Batteries',
    slug: 'apple-batteries',
    descriptionAr: 'دليل عمر البطارية وتغيير البطاريات الفورية',
    postCount: 0,
  },
  {
    id: 'c87e65bd-1e02-4967-88e5-2926ca11306a',
    nameAr: 'أعطال وحلول',
    nameEn: 'Troubleshooting',
    slug: 'troubleshooting',
    descriptionAr: 'حلول مشاكل سقوط المياه واللوحة الأم والكاميرات',
    postCount: 0,
  },
  {
    id: '3708c2d9-b255-4eeb-a90d-828a2f838557',
    nameAr: 'خدمات FocusFix',
    nameEn: 'FocusFix Services',
    slug: 'focusfix-services',
    descriptionAr: 'خدمات الصيانة المنزلية والضمان وخصوصية العملاء',
    postCount: 0,
  },
];

const initialAuthors: BlogAuthor[] = [
  {
    id: '0c6d1d22-9a9f-474e-90f7-5b3b04b576c8',
    nameAr: 'فريق FocusFix التقني',
    nameEn: 'FocusFix Tech Team',
    slug: 'focusfix-team',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    roleTitle: 'مهندس صيانة معتمد',
    bioAr: 'خبراء معتمدون في صيانة أجهزة آبل الذكية واللوحات الأم',
    postCount: 0,
  },
];

const initialTags: BlogTag[] = [
  { id: 'tag-1', nameAr: 'صيانة آيفون 16', nameEn: 'iPhone 16 Repair', slug: 'iphone-16', postCount: 0 },
  { id: 'tag-2', nameAr: 'شاشة أصلية', nameEn: 'Original Screen', slug: 'original-screen', postCount: 0 },
  { id: 'tag-3', nameAr: 'صحة البطارية', nameEn: 'Battery Health', slug: 'battery-health', postCount: 0 },
  { id: 'tag-4', nameAr: 'ضمان سنة', nameEn: '1 Year Warranty', slug: 'warranty', postCount: 0 },
];

const initialPosts: BlogPost[] = [];

// Helper to store in localStorage for stateful updates
const getLocalPosts = (): BlogPost[] => {
  const cached = localStorage.getItem('focusfix_cms_posts');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
  }
  return initialPosts;
};

const saveLocalPosts = (posts: BlogPost[]) => {
  localStorage.setItem('focusfix_cms_posts', JSON.stringify(posts));
};

const getLocalCategories = (): BlogCategory[] => {
  const cached = localStorage.getItem('focusfix_cms_categories');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
  }
  return initialCategories;
};

const saveLocalCategories = (cats: BlogCategory[]) => {
  localStorage.setItem('focusfix_cms_categories', JSON.stringify(cats));
};

const getLocalTags = (): BlogTag[] => {
  const cached = localStorage.getItem('focusfix_cms_tags');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
  }
  return initialTags;
};

const saveLocalTags = (tags: BlogTag[]) => {
  localStorage.setItem('focusfix_cms_tags', JSON.stringify(tags));
};

const getLocalAuthors = (): BlogAuthor[] => {
  const cached = localStorage.getItem('focusfix_cms_authors');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
  }
  return initialAuthors;
};

const saveLocalAuthors = (authors: BlogAuthor[]) => {
  localStorage.setItem('focusfix_cms_authors', JSON.stringify(authors));
};

export const blogApi = {
  // 1. Articles CRUD
  async getAllPosts(params?: {
    status?: string;
    categoryId?: string;
    authorId?: string;
    search?: string;
    date?: string;
  }): Promise<{ posts: BlogPost[]; counts: Record<string, number> }> {
    try {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`${API_BASE_URL}/admin/all?${query}`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.posts)) {
          // Map backend snake_case to frontend BlogPost camelCase
          const mappedPosts: BlogPost[] = data.posts.map((p: any) => ({
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
            author: p.author ? { id: p.author.id, nameAr: p.author.name_ar, nameEn: p.author.name_en, slug: p.author.slug || p.author.id, avatarUrl: p.author.avatar_url } : undefined,
            tags: Array.isArray(p.tags) ? p.tags.map((t: any) => ({ id: t.id, nameAr: t.name_ar, nameEn: t.name_en, slug: t.slug })) : [],
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
            readingMinutes: p.reading_minutes || 4,
            viewsCount: p.views_count || 0,
            publishedAt: p.published_at,
            scheduledAt: p.scheduled_at,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            seoScore: 85,
          }));

          // Clear local fallback cache to prevent ghost articles
          localStorage.removeItem('focusfix_cms_posts');

          return {
            posts: mappedPosts,
            counts: data.counts || {
              all: mappedPosts.filter((x) => x.status !== 'archived').length,
              published: mappedPosts.filter((x) => x.status === 'published').length,
              draft: mappedPosts.filter((x) => x.status === 'draft').length,
              scheduled: mappedPosts.filter((x) => x.status === 'scheduled').length,
              trash: mappedPosts.filter((x) => x.status === 'archived').length,
            },
          };
        }
      }
    } catch (err) {
      console.error('Failed to load posts from server:', err);
    }

    let list = getLocalPosts();

    if (params?.status && params.status !== 'all') {
      list = list.filter((p) => p.status === params.status);
    }
    if (params?.categoryId && params.categoryId !== 'all') {
      list = list.filter((p) => p.categoryId === params.categoryId);
    }
    if (params?.authorId && params.authorId !== 'all') {
      list = list.filter((p) => p.authorId === params.authorId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.titleAr.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }

    const allPosts = getLocalPosts();
    return {
      posts: list,
      counts: {
        all: allPosts.filter((p) => p.status !== 'archived').length,
        published: allPosts.filter((p) => p.status === 'published').length,
        draft: allPosts.filter((p) => p.status === 'draft').length,
        scheduled: allPosts.filter((p) => p.status === 'scheduled').length,
        trash: allPosts.filter((p) => p.status === 'archived').length,
      },
    };
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const p = await res.json();
        return {
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
          author: p.author ? { id: p.author.id, nameAr: p.author.name_ar, nameEn: p.author.name_en, slug: p.author.slug || p.author.id, avatarUrl: p.author.avatar_url } : undefined,
          tags: Array.isArray(p.tags) ? p.tags.map((t: any) => ({ id: t.id, nameAr: t.name_ar, nameEn: t.name_en, slug: t.slug })) : [],
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
          readingMinutes: p.reading_minutes || 4,
          viewsCount: p.views_count || 0,
          publishedAt: p.published_at,
          scheduledAt: p.scheduled_at,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        };
      }
    } catch {
      // Fallback
    }
    const posts = getLocalPosts();
    return posts.find((p) => p.id === id) || null;
  },

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    // Resolve Category ID to real UUID if needed
    let validCatId = postData.categoryId;
    if (validCatId && !isUuid(validCatId)) {
      try {
        const liveCats = await blogApi.getCategories();
        const found = liveCats.find((c) => c.id === validCatId || c.slug === validCatId || c.nameAr === validCatId);
        validCatId = found && isUuid(found.id) ? found.id : undefined;
      } catch {
        validCatId = undefined;
      }
    }

    // Resolve Author ID to real UUID if needed
    let validAuthId = postData.authorId;
    if (validAuthId && !isUuid(validAuthId)) {
      try {
        const liveAuthors = await blogApi.getAuthors();
        const found = liveAuthors.find((a) => a.id === validAuthId || a.slug === validAuthId || a.nameAr === validAuthId);
        validAuthId = found && isUuid(found.id) ? found.id : undefined;
      } catch {
        validAuthId = undefined;
      }
    }

    const payload = {
      title_ar: postData.titleAr,
      title_en: postData.titleEn || postData.titleAr,
      slug: postData.slug,
      content_html: postData.contentHtml || '',
      content_html_en: postData.contentHtmlEn || '',
      excerpt_ar: postData.excerptAr,
      excerpt_en: postData.excerptEn,
      category_id: validCatId || null,
      author_id: validAuthId || null,
      featured_image: postData.featuredImage,
      featured_image_alt: postData.featuredImageAlt,
      featured_image_caption: postData.featuredImageCaption,
      focus_keyword: postData.focusKeyword,
      meta_title_ar: postData.seoTitle,
      meta_desc_ar: postData.seoDesc,
      canonical_url: postData.canonicalUrl,
      robots_index: postData.robotsIndex,
      robots_follow: postData.robotsFollow,
      status: postData.status || 'draft',
      scheduled_at: postData.scheduledAt,
      tags: postData.tags?.map((t) => t.id),
    };

    const res = await fetch(`${API_BASE_URL}/admin/posts`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `فشل في إنشاء المقال (كود: ${res.status})`);
    }

    const created = await res.json();
    return {
      ...postData,
      id: created.id,
      slug: created.slug,
      titleAr: created.title_ar,
      titleEn: created.title_en,
      status: created.status,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    } as BlogPost;
  },

  async updatePost(id: string, postData: Partial<BlogPost>): Promise<BlogPost> {
    const isRealUuid = isUuid(id);

    // Resolve Category ID to real UUID if needed
    let validCatId = postData.categoryId;
    if (validCatId && !isUuid(validCatId)) {
      try {
        const liveCats = await blogApi.getCategories();
        const found = liveCats.find((c) => c.id === validCatId || c.slug === validCatId || c.nameAr === validCatId);
        validCatId = found && isUuid(found.id) ? found.id : undefined;
      } catch {
        validCatId = undefined;
      }
    }

    // Resolve Author ID to real UUID if needed
    let validAuthId = postData.authorId;
    if (validAuthId && !isUuid(validAuthId)) {
      try {
        const liveAuthors = await blogApi.getAuthors();
        const found = liveAuthors.find((a) => a.id === validAuthId || a.slug === validAuthId || a.nameAr === validAuthId);
        validAuthId = found && isUuid(found.id) ? found.id : undefined;
      } catch {
        validAuthId = undefined;
      }
    }

    if (isRealUuid) {
      const payload = {
        title_ar: postData.titleAr,
        title_en: postData.titleEn,
        slug: postData.slug,
        content_html: postData.contentHtml,
        content_html_en: postData.contentHtmlEn,
        excerpt_ar: postData.excerptAr,
        excerpt_en: postData.excerptEn,
        category_id: validCatId !== undefined ? validCatId : undefined,
        author_id: validAuthId !== undefined ? validAuthId : undefined,
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

      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
        method: 'PUT',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل في تحديث المقال (كود: ${res.status})`);
      }

      const updated = await res.json();
      return {
        ...postData,
        id: updated.id,
        slug: updated.slug,
        titleAr: updated.title_ar,
        titleEn: updated.title_en,
        status: updated.status,
        updatedAt: updated.updated_at,
      } as BlogPost;
    }

    const posts = getLocalPosts();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Article not found');

    posts[index] = {
      ...posts[index],
      ...postData,
      updatedAt: new Date().toISOString(),
    };

    saveLocalPosts(posts);
    return posts[index];
  },

  async duplicatePost(id: string): Promise<BlogPost> {
    if (isUuid(id)) {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/duplicate`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    }

    const posts = getLocalPosts();
    const original = posts.find((p) => p.id === id);
    if (!original) throw new Error('Article not found');

    const copy: BlogPost = {
      ...original,
      id: `post-${Date.now()}`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      titleAr: `${original.titleAr} (نسخة مسودة)`,
      titleEn: `${original.titleEn} (Draft Copy)`,
      status: 'draft',
      publishedAt: null,
      scheduledAt: null,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(copy);
    saveLocalPosts(posts);
    return copy;
  },

  async moveToTrash(id: string): Promise<void> {
    if (isUuid(id)) {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/trash`, {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to move to trash');
      }
    }
    const posts = getLocalPosts().filter((p) => p.id !== id);
    saveLocalPosts(posts);
  },

  async restoreFromTrash(id: string): Promise<void> {
    if (isUuid(id)) {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/restore`, {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to restore post');
      }
    }
    const posts = getLocalPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.status = 'draft';
      saveLocalPosts(posts);
    }
  },

  async permanentlyDelete(id: string): Promise<void> {
    if (isUuid(id)) {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to delete post');
      }
    }
    const posts = getLocalPosts().filter((p) => p.id !== id);
    saveLocalPosts(posts);
  },

  async bulkAction(ids: string[], action: 'trash' | 'restore' | 'delete' | 'publish' | 'draft'): Promise<void> {
    const realUuids = ids.filter((id) => isUuid(id));
    if (realUuids.length > 0) {
      await fetch(`${API_BASE_URL}/admin/bulk`, {
        method: 'PATCH',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ids: realUuids,
          action: action === 'delete' ? 'delete' : action === 'trash' ? 'trash' : 'change_status',
          value: action === 'publish' ? 'published' : action === 'draft' || action === 'restore' ? 'draft' : undefined,
        }),
      });
    }

    const posts = getLocalPosts().filter((p) => !ids.includes(p.id));
    saveLocalPosts(posts);
  },

  // 2. Categories CRUD
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: BlogCategory[] = data.map((c: any) => ({
            id: c.id,
            nameAr: c.name_ar,
            nameEn: c.name_en || c.name_ar,
            slug: c.slug,
            descriptionAr: c.description_ar,
            descriptionEn: c.description_en,
            parentId: c.parent_id,
            postCount: c._count?.posts || 0,
          }));
          saveLocalCategories(mapped);
          return mapped;
        }
      }
    } catch {
      // Fallback
    }
    return getLocalCategories();
  },

  async createCategory(cat: Partial<BlogCategory>): Promise<BlogCategory> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name_ar: cat.nameAr,
          name_en: cat.nameEn || cat.nameAr,
          slug: cat.slug || cat.nameEn?.toLowerCase().replace(/\s+/g, '-') || `category-${Date.now()}`,
          description_ar: cat.descriptionAr,
          description_en: cat.descriptionEn,
          parent_id: cat.parentId || null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const obj: BlogCategory = {
          id: created.id,
          nameAr: created.name_ar,
          nameEn: created.name_en,
          slug: created.slug,
          descriptionAr: created.description_ar,
          descriptionEn: created.description_en,
          parentId: created.parent_id,
          postCount: 0,
        };
        const local = getLocalCategories();
        local.push(obj);
        saveLocalCategories(local);
        return obj;
      }
    } catch {
      // Fallback
    }

    const categories = getLocalCategories();
    const newCat: BlogCategory = {
      id: `cat-${Date.now()}`,
      nameAr: cat.nameAr || '',
      nameEn: cat.nameEn || cat.nameAr || '',
      slug: cat.slug || `category-${Date.now()}`,
      descriptionAr: cat.descriptionAr,
      descriptionEn: cat.descriptionEn,
      parentId: cat.parentId || null,
      postCount: 0,
    };
    categories.push(newCat);
    saveLocalCategories(categories);
    return newCat;
  },

  async deleteCategory(id: string): Promise<void> {
    if (isUuid(id)) {
      await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      }).catch(() => {});
    }
    const categories = getLocalCategories().filter((c) => c.id !== id);
    saveLocalCategories(categories);
  },

  // 3. Tags CRUD
  async getTags(query?: string): Promise<BlogTag[]> {
    try {
      const url = query ? `${API_BASE_URL}/admin/tags?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/admin/tags`;
      const res = await fetch(url, { headers: getAdminAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((t: any) => ({
            id: t.id,
            nameAr: t.name_ar,
            nameEn: t.name_en,
            slug: t.slug,
            postCount: t._count?.posts || 0,
          }));
        }
      }
    } catch {
      // Fallback
    }
    let tags = getLocalTags();
    if (query) {
      const q = query.toLowerCase();
      tags = tags.filter((t) => t.nameAr.toLowerCase().includes(q) || t.nameEn.toLowerCase().includes(q));
    }
    return tags;
  },

  async createTag(nameAr: string, nameEn?: string): Promise<BlogTag> {
    const slug = nameAr.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tags`, {
        method: 'POST',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name_ar: nameAr, name_en: nameEn || nameAr, slug }),
      });
      if (res.ok) {
        const created = await res.json();
        return {
          id: created.id,
          nameAr: created.name_ar,
          nameEn: created.name_en,
          slug: created.slug,
          postCount: 0,
        };
      }
    } catch {
      // Fallback
    }

    const tags = getLocalTags();
    const existing = tags.find((t) => t.nameAr === nameAr || t.slug === slug);
    if (existing) return existing;

    const newTag: BlogTag = {
      id: `tag-${Date.now()}`,
      nameAr,
      nameEn: nameEn || nameAr,
      slug,
      postCount: 1,
    };
    tags.push(newTag);
    saveLocalTags(tags);
    return newTag;
  },

  // 4. Authors CRUD
  async getAuthors(): Promise<BlogAuthor[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/authors`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: BlogAuthor[] = data.map((a: any) => ({
            id: a.id,
            nameAr: a.name_ar,
            nameEn: a.name_en || a.name_ar,
            slug: a.slug,
            avatarUrl: a.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            roleTitle: a.role_title || 'كاتب محتوى معتمد',
            bioAr: a.bio_ar,
            bioEn: a.bio_en,
            postCount: a._count?.posts || 0,
          }));
          saveLocalAuthors(mapped);
          return mapped;
        }
      }
    } catch {
      // Fallback
    }
    return getLocalAuthors();
  },

  async createAuthor(authorData: Partial<BlogAuthor>): Promise<BlogAuthor> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/authors`, {
        method: 'POST',
        headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name_ar: authorData.nameAr,
          name_en: authorData.nameEn || authorData.nameAr,
          slug: authorData.slug || `author-${Date.now()}`,
          avatar_url: authorData.avatarUrl,
          role_title: authorData.roleTitle,
          bio_ar: authorData.bioAr,
          bio_en: authorData.bioEn,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const obj: BlogAuthor = {
          id: created.id,
          nameAr: created.name_ar,
          nameEn: created.name_en,
          slug: created.slug,
          avatarUrl: created.avatar_url || '',
          roleTitle: created.role_title,
          bioAr: created.bio_ar,
          bioEn: created.bio_en,
          postCount: 0,
        };
        const local = getLocalAuthors();
        local.push(obj);
        saveLocalAuthors(local);
        return obj;
      }
    } catch {
      // Fallback
    }

    const authors = getLocalAuthors();
    const newAuthor: BlogAuthor = {
      id: `auth-${Date.now()}`,
      nameAr: authorData.nameAr || '',
      nameEn: authorData.nameEn || authorData.nameAr || '',
      slug: authorData.slug || `author-${Date.now()}`,
      avatarUrl: authorData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      roleTitle: authorData.roleTitle || 'كاتب محتوى معتمد',
      bioAr: authorData.bioAr || '',
      bioEn: authorData.bioEn || '',
      postCount: 0,
    };
    authors.push(newAuthor);
    saveLocalAuthors(authors);
    return newAuthor;
  },

  // 5. Internal Links Assistant
  async searchInternalLinks(q: string): Promise<InternalLinkItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/internal-links?q=${encodeURIComponent(q)}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const basePages: InternalLinkItem[] = [
      { title: 'الرئيسية (Home)', url: '/', type: 'page' },
      { title: 'حجز صيانة أبل (Book Apple Repair)', url: '/booking', type: 'page' },
      { title: 'مصفوفة الأسعار (Pricing Matrix)', url: '/pricing', type: 'page' },
      { title: 'كتالوج الأجهزة والموديلات (Devices Catalog)', url: '/catalog', type: 'page' },
      { title: 'المناطق ومواعيد التغطية (Coverage Areas)', url: '/areas', type: 'page' },
      { title: 'المدونة ومقالات الصيانة (Blog & Guides)', url: '/blog', type: 'page' },
      { title: 'عن FocusFix وضمان الصيانة (About Us)', url: '/about', type: 'page' },
      { title: 'تواصل معنا والدعم الفني (Contact)', url: '/contact', type: 'page' },
    ];

    const posts = getLocalPosts().map((p) => ({
      title: `${p.titleAr} (${p.titleEn})`,
      url: `/blog/${p.slug}`,
      type: 'article' as const,
    }));

    const combined = [...basePages, ...posts];
    if (!q) return combined;
    return combined.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()) || i.url.toLowerCase().includes(q.toLowerCase()));
  },
};
