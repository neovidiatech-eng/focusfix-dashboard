export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface BlogCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  parentId?: string | null;
  parentName?: string | null;
  postCount?: number;
  children?: BlogCategory[];
  createdAt?: string;
}

export interface BlogTag {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  postCount?: number;
}

export interface BlogAuthor {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  avatarUrl?: string;
  bioAr?: string;
  bioEn?: string;
  roleTitle?: string;
  postCount?: number;
}

export interface BlogRevision {
  id: string;
  postId: string;
  contentJson?: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  contentHtml: string;
  contentHtmlEn?: string;
  contentJson?: Record<string, unknown>;
  excerptAr: string;
  excerptEn: string;
  categoryId: string;
  category?: BlogCategory;
  authorId: string;
  author?: BlogAuthor;
  tags: BlogTag[];
  featuredImage: string;
  featuredImageAlt?: string;
  featuredImageCaption?: string;
  focusKeyword?: string;
  seoTitle?: string;
  seoDesc?: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  status: PostStatus;
  readingMinutes: number;
  viewsCount: number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  seoScore?: number;
  relatedPostIds?: string[];
}

export interface InternalLinkItem {
  title: string;
  url: string;
  type: 'page' | 'article';
}

export interface SeoCheckResult {
  id: string;
  titleAr: string;
  titleEn: string;
  passed: boolean;
  importance: 'critical' | 'recommended' | 'optional';
  messageAr: string;
  messageEn: string;
}

export interface SeoAuditReport {
  score: number;
  checks: SeoCheckResult[];
}
