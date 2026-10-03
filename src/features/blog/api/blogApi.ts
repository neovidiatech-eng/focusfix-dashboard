import { BlogPost, BlogCategory, BlogTag, BlogAuthor, InternalLinkItem } from '../types/blog.types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1') + '/blog';

// In-memory demo data with realistic data for FocusFix
const initialCategories: BlogCategory[] = [
  {
    id: 'cat-1',
    nameAr: 'نصائح صيانة أبل',
    nameEn: 'Apple Maintenance Tips',
    slug: 'apple-maintenance',
    descriptionAr: 'أدلة إرشادية ونصائح للحفاظ على أجهزة آبل في أفضل كفاءة',
    descriptionEn: 'Guides and tips to maintain Apple devices at peak performance',
    postCount: 5,
    children: [
      {
        id: 'cat-1-1',
        nameAr: 'حيل إطالة عمر البطارية',
        nameEn: 'Battery Life Hacks',
        slug: 'battery-hacks',
        parentId: 'cat-1',
        parentName: 'نصائح صيانة أبل',
        postCount: 2,
      },
    ],
  },
  {
    id: 'cat-2',
    nameAr: 'شاشات الآيفون الأصلية',
    nameEn: 'Original iPhone Screens',
    slug: 'iphone-screens',
    descriptionAr: 'مقارنات تقنية وضمانات شاشات OLED و Super Retina XDR',
    descriptionEn: 'Technical comparisons and warranties for OLED screens',
    postCount: 4,
  },
  {
    id: 'cat-3',
    nameAr: 'بطاريات أبل المعتمدة',
    nameEn: 'Certified Apple Batteries',
    slug: 'apple-batteries',
    descriptionAr: 'معايير فحص كفاءة البطاريات والشحن السريع',
    descriptionEn: 'Battery health assessment and fast charging standards',
    postCount: 3,
  },
  {
    id: 'cat-4',
    nameAr: 'أعطال البوردة والآي سي',
    nameEn: 'Logic Board & IC Repairs',
    slug: 'logic-board-repairs',
    descriptionAr: 'إصلاح الدوائر المعقدة ومشاكل الشحن والشبكة',
    descriptionEn: 'Micro-soldering and logic board diagnosis',
    postCount: 2,
  },
];

const initialTags: BlogTag[] = [
  { id: 'tag-1', nameAr: 'صيانة آيفون 16', nameEn: 'iPhone 16 Repair', slug: 'iphone-16', postCount: 4 },
  { id: 'tag-2', nameAr: 'شاشة أصلية', nameEn: 'Original Screen', slug: 'original-screen', postCount: 6 },
  { id: 'tag-3', nameAr: 'صحة البطارية', nameEn: 'Battery Health', slug: 'battery-health', postCount: 5 },
  { id: 'tag-4', nameAr: 'ضمان سنة', nameEn: '1 Year Warranty', slug: 'warranty', postCount: 8 },
  { id: 'tag-5', nameAr: 'صيانة منزلية', nameEn: 'Home Repair', slug: 'home-repair', postCount: 9 },
  { id: 'tag-6', nameAr: 'Apple Care', nameEn: 'Apple Care', slug: 'apple-care', postCount: 3 },
];

const initialAuthors: BlogAuthor[] = [
  {
    id: 'auth-1',
    nameAr: 'م. أحمد الشريف',
    nameEn: 'Eng. Ahmed El-Sherif',
    slug: 'ahmed-elsherif',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    roleTitle: 'خبير صيانة معتمد من Apple',
    bioAr: 'مهندس إلكترونيات متخصص في صيانة أجهزة iOS والأجهزة اللوحية بخبرة تتجاوز 9 سنوات في مصر.',
    bioEn: 'Certified hardware engineer specializing in Apple logic boards and screen calibration.',
    postCount: 8,
  },
  {
    id: 'auth-2',
    nameAr: 'سارة عبد الرحمن',
    nameEn: 'Sara Abdelrahman',
    slug: 'sara-abdelrahman',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    roleTitle: 'أخصائية أمن وخصوصية بيانات',
    bioAr: 'باحثة تقنية متخصصة في حماية بيانات مستخدمي الهواتف الذكية وضمان سرية الملفات أثناء الصيانة.',
    bioEn: 'Cybersecurity researcher focused on mobile data privacy and zero-access repairs.',
    postCount: 4,
  },
];

const initialPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'when-to-replace-iphone-battery',
    titleAr: 'متى يجب عليك تغيير بطارية الآيفون؟ 5 علامات مؤكدة وحلول عملية',
    titleEn: 'When Should You Replace Your iPhone Battery? 5 Sure Signs and Practical Solutions',
    excerptAr: 'هل لاحظت هبوط صحة البطارية أسفل 80%؟ تعرف على المؤشرات الحقيقية لتلف البطارية وكيف تتم الصيانة المنزلية بضمان رسمي.',
    excerptEn: 'Did battery health drop below 80%? Discover key symptoms of degradation and certified on-site replacement solutions.',
    contentHtml: `
      <h2>أهمية مراقبة صحة بطارية الآيفون</h2>
      <p>تعتبر بطارية الآيفون المصنوعة من الليثيوم أيون عنصرًا كيميائيًا قابلاً للاستهلاك بمرور الوقت، ومع زيادة دورات الشحن تقل قدرتها على الاحتفاظ بالطاقة.</p>
      
      <h2>العلامات الخمس المؤكدة لتلف البطارية</h2>
      <ul>
        <li>هبوط مؤشر صحة البطارية (Maximum Capacity) إلى ما دون 80%.</li>
        <li>انخفاض مفاجئ في نسبة الشحن من 40% إلى 10% خلال دقائق معدودة.</li>
        <li>ارتفاع ملحوظ في حرارة الجهاز أثناء التصفح العادي أو الشحن.</li>
        <li>تباطؤ استجابة التطبيقات وتهنيج النظام لحماية المعالج.</li>
        <li>انتفاخ خفيف في الشاشة نتيجة تمدد خلايا البطارية (حالة طارئة).</li>
      </ul>

      <blockquote>"لا تؤجل استبدال البطارية المنتفخة أبدًا، لأنها تشكل خطرًا مباشرًا على الشاشة ولوحة الأم."</blockquote>

      <h2>كيف تحجز صيانة بطارية فورية أمام منزلك؟</h2>
      <p>مع خدمة FocusFix، يصلك الفني المعتمد في سيارة مجهزة بالكامل لفك البطارية القديمة وتركيب قطعة أصلية جديدة مع اختبار برمجي وضمان كامل 180 يومًا دون مساس ببياناتك.</p>
    `,
    contentHtmlEn: `
      <h2>The Importance of iPhone Battery Health</h2>
      <p>Lithium-ion batteries are consumable components that chemically age over charge cycles, reducing run time.</p>
      <h2>5 Sure Signs Your Battery Needs Replacement</h2>
      <ul>
        <li>Battery Health capacity falls below 80%.</li>
        <li>Sudden drops in battery percentage within minutes.</li>
        <li>Unusual device heating during standard use.</li>
        <li>Performance throttling causing UI lag.</li>
        <li>Physical swelling pushing against the display.</li>
      </ul>
    `,
    categoryId: 'cat-3',
    category: initialCategories[2],
    authorId: 'auth-1',
    author: initialAuthors[0],
    tags: [initialTags[2], initialTags[3], initialTags[4]],
    featuredImage: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'فني FocusFix يقوم بفحص بطارية هاتف آيفون حديثة',
    featuredImageCaption: 'فحص دوري لبطارية الآيفون بجهاز الفحص الإلكتروني المتطور',
    focusKeyword: 'تغيير بطارية الآيفون',
    seoTitle: 'متى يجب تغيير بطارية الآيفون؟ 5 علامات مؤكدة | FocusFix',
    seoDesc: 'تعرف على علامات تلف بطارية الآيفون وكيفية استبدالها أمام منزلك بقطع أصلية وضمان رسمي 180 يومًا من فوكس فيكس.',
    canonicalUrl: 'https://focusfix.net/blog/when-to-replace-iphone-battery',
    robotsIndex: true,
    robotsFollow: true,
    status: 'published',
    readingMinutes: 4,
    viewsCount: 1420,
    publishedAt: '2026-03-20T10:00:00.000Z',
    createdAt: '2026-03-18T10:00:00.000Z',
    updatedAt: '2026-03-20T10:00:00.000Z',
    seoScore: 94,
    relatedPostIds: ['post-2'],
  },
  {
    id: 'post-2',
    slug: 'original-vs-copy-iphone-screen',
    titleAr: 'الفرق بين شاشة الآيفون الأصلية والتقليد: دليلك الكامل قبل الصيانة',
    titleEn: 'Original vs Replica iPhone Screen: Complete Guide Before Repair',
    excerptAr: 'تعرف على الفروقات الجوهرية في ألوان OLED ومعدل التحديث 120Hz وسطوع الشاشة تحت الشمس وكيف تتجنب الغش التجاري.',
    excerptEn: 'Learn the critical differences in OLED color fidelity, 120Hz ProMotion refresh rate, and outdoor brightness.',
    contentHtml: `
      <h2>لماذا تعتبر الشاشة أهم مكون في الآيفون؟</h2>
      <p>شاشات الآيفون الحديثة تعتمد تقنية Super Retina XDR مع دعم ProMotion بتردد 120 هرتز وتقنية True Tone لمطابقة حرارة الإضاءة المحيطة.</p>

      <h2>الفروق الفنية بين الشاشات الأصلية والتجارية</h2>
      <ul>
        <li><strong>دقة الألوان والتباين:</strong> الشاشات الأصلية تقدم لون أسود حقيقي بنسبة تباين لا نهائية.</li>
        <li><strong>مستشعر True Tone:</strong> يفقد العمل تمامًا مع الشاشات التجارية دون جهاز نقل البيانات البرمجية.</li>
        <li><strong>استهلاك البطارية:</strong> الشاشات المقلدة تستهلك طاقة أعلى بنسبة 35% بسبب إضاءة الخلفية الرديئة.</li>
      </ul>
    `,
    categoryId: 'cat-2',
    category: initialCategories[1],
    authorId: 'auth-1',
    author: initialAuthors[0],
    tags: [initialTags[0], initialTags[1], initialTags[3]],
    featuredImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'مقارنة دقيقة بين شاشة آيفون أصلية وأخرى مقلدة',
    featuredImageCaption: 'فحص مصفوفة البيكسلات في شاشات FocusFix الأصلية',
    focusKeyword: 'شاشة الآيفون الأصلية',
    seoTitle: 'الفرق بين شاشة الآيفون الأصلية والتقليد | FocusFix دليلك الكامل',
    seoDesc: 'مقارنة فنية شاملة توضح الفروق بين شاشة الآيفون الأصلية والشاشة التجارية المقلدة لتتجنب الوقوع في فخ الغش.',
    canonicalUrl: 'https://focusfix.net/blog/original-vs-copy-iphone-screen',
    robotsIndex: true,
    robotsFollow: true,
    status: 'published',
    readingMinutes: 5,
    viewsCount: 980,
    publishedAt: '2026-03-22T14:30:00.000Z',
    createdAt: '2026-03-21T14:00:00.000Z',
    updatedAt: '2026-03-22T14:30:00.000Z',
    seoScore: 89,
    relatedPostIds: ['post-1'],
  },
  {
    id: 'post-3',
    slug: 'data-privacy-during-phone-repair',
    titleAr: 'كيف تضمن سرية بياناتك وصورك أثناء صيانة الهاتف أمام منزلك؟',
    titleEn: 'How to Ensure Complete Data Privacy During At-Home Phone Repair',
    excerptAr: 'تخاف من تسريب صورك أو محادثاتك أثناء ترك هاتفك في ورشة الصيانة؟ تعرف كيف تمنحك الصيانة المنزلية راحة البال الكاملة.',
    excerptEn: 'Worried about your private photos and chats during phone repair? Learn why on-site repair offers 100% security.',
    contentHtml: `
      <h2>المعضلة الكبرى: ترك الهاتف في الورش التقليدية</h2>
      <p>يتعرض الآلاف سنويًا لخطر سرقة البيانات والصور الخاصة عند تسليم الهواتف لورش مجهولة بدون رقابة أو معرفة بالرمز السري.</p>

      <h2>مزايا خدمة FocusFix في الحفاظ على الخصوصية</h2>
      <ul>
        <li>لا نطلب أبدًا كلمة المرور أو رمز القفل (Passcode) الخاص بك.</li>
        <li>تتم جميع مراحل الصيانة أمام عينيك مباشرة داخل بيتك أو في سيارة الخدمة.</li>
        <li>فحص الوظائف الأساسية يتم بوجود العميل دون الدخول للتطبيقات الشخصية.</li>
      </ul>
    `,
    categoryId: 'cat-1',
    category: initialCategories[0],
    authorId: 'auth-2',
    author: initialAuthors[1],
    tags: [initialTags[4], initialTags[5]],
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'حماية بيانات الهاتف المحمول وأمان المعلومات',
    featuredImageCaption: 'أمان بياناتك وخصوصيتك خط أحمر مع FocusFix',
    focusKeyword: 'سرية بيانات صيانة الهاتف',
    seoTitle: 'كيف تضمن سرية بياناتك وصورك أثناء صيانة الهاتف؟ | FocusFix',
    seoDesc: 'دليل حماية الخصوصية ومزايا الصيانة المنزلية المعتمدة التي تضمن بقاء صورك ومحادثاتك في أمان تام.',
    canonicalUrl: 'https://focusfix.net/blog/data-privacy-during-phone-repair',
    robotsIndex: true,
    robotsFollow: true,
    status: 'draft',
    readingMinutes: 3,
    viewsCount: 0,
    publishedAt: null,
    createdAt: '2026-03-28T09:15:00.000Z',
    updatedAt: '2026-03-28T09:15:00.000Z',
    seoScore: 78,
  },
  {
    id: 'post-4',
    slug: 'guide-apple-fast-charging-risks',
    titleAr: 'مخاطر الشواحن التجارية غير الأصلية على آي سي الشحن في الآيفون',
    titleEn: 'Risks of Counterfeit Chargers on iPhone Tristar/Charging IC',
    excerptAr: 'احذر من الشواحن الرخيصة التي تسبب تلف رقاقة الشحن وارتفاع حرارة الجهاز المستمر.',
    excerptEn: 'Beware of cheap adapters causing motherboard charging IC failures and persistent overheating.',
    contentHtml: `
      <h2>كيف يعمل نظام إدارة الطاقة في أجهزة آبل؟</h2>
      <p>تحتوي هواتف آبل على دوائر حماية دقيقة تنظم الجهد الكهربائي وتحمي البطارية من الترددات غير المستقرة.</p>
    `,
    categoryId: 'cat-4',
    category: initialCategories[3],
    authorId: 'auth-1',
    author: initialAuthors[0],
    tags: [initialTags[0], initialTags[3]],
    featuredImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'شاحن وكابل شحن أصلي معتمد من أبل',
    featuredImageCaption: 'استخدم دائمًا كابلات MFi المعتمدة لحماية هاتفك',
    focusKeyword: 'مخاطر شواحن الآيفون التجارية',
    seoTitle: 'مخاطر الشواحن غير الأصلية على آي سي الآيفون | FocusFix',
    seoDesc: 'أضرار استخدام شواحن غير معتمدة على دوائر الطاقة في هاتف آبل وكيف تحافظ على جهازك.',
    canonicalUrl: 'https://focusfix.net/blog/guide-apple-fast-charging-risks',
    robotsIndex: true,
    robotsFollow: true,
    status: 'scheduled',
    readingMinutes: 4,
    viewsCount: 0,
    publishedAt: null,
    scheduledAt: '2026-04-10T12:00:00.000Z',
    createdAt: '2026-03-29T11:00:00.000Z',
    updatedAt: '2026-03-29T11:00:00.000Z',
    seoScore: 82,
  },
];

// Helper to store in localStorage for stateful updates
const getLocalPosts = (): BlogPost[] => {
  const cached = localStorage.getItem('focusfix_cms_posts');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('focusfix_cms_posts', JSON.stringify(initialPosts));
  return initialPosts;
};

const saveLocalPosts = (posts: BlogPost[]) => {
  localStorage.setItem('focusfix_cms_posts', JSON.stringify(posts));
};

const getLocalCategories = (): BlogCategory[] => {
  const cached = localStorage.getItem('focusfix_cms_categories');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('focusfix_cms_categories', JSON.stringify(initialCategories));
  return initialCategories;
};

const saveLocalCategories = (cats: BlogCategory[]) => {
  localStorage.setItem('focusfix_cms_categories', JSON.stringify(cats));
};

const getLocalTags = (): BlogTag[] => {
  const cached = localStorage.getItem('focusfix_cms_tags');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('focusfix_cms_tags', JSON.stringify(initialTags));
  return initialTags;
};

const saveLocalTags = (tags: BlogTag[]) => {
  localStorage.setItem('focusfix_cms_tags', JSON.stringify(tags));
};

const getLocalAuthors = (): BlogAuthor[] => {
  const cached = localStorage.getItem('focusfix_cms_authors');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('focusfix_cms_authors', JSON.stringify(initialAuthors));
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
      const res = await fetch(`${API_BASE_URL}/admin/all?${query}`, { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local store
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
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const posts = getLocalPosts();
    return posts.find((p) => p.id === id) || null;
  },

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const posts = getLocalPosts();
    const categories = getLocalCategories();
    const authors = getLocalAuthors();

    const category = categories.find((c) => c.id === postData.categoryId);
    const author = authors.find((a) => a.id === postData.authorId);

    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      slug: postData.slug || `post-${Date.now()}`,
      titleAr: postData.titleAr || '',
      titleEn: postData.titleEn || postData.titleAr || '',
      contentHtml: postData.contentHtml || '',
      contentHtmlEn: postData.contentHtmlEn || '',
      excerptAr: postData.excerptAr || '',
      excerptEn: postData.excerptEn || '',
      categoryId: postData.categoryId || (categories[0]?.id ?? ''),
      category,
      authorId: postData.authorId || (authors[0]?.id ?? ''),
      author,
      tags: postData.tags || [],
      featuredImage: postData.featuredImage || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
      featuredImageAlt: postData.featuredImageAlt,
      featuredImageCaption: postData.featuredImageCaption,
      focusKeyword: postData.focusKeyword,
      seoTitle: postData.seoTitle,
      seoDesc: postData.seoDesc,
      canonicalUrl: postData.canonicalUrl,
      robotsIndex: postData.robotsIndex ?? true,
      robotsFollow: postData.robotsFollow ?? true,
      status: postData.status || 'draft',
      readingMinutes: 4,
      viewsCount: 0,
      publishedAt: postData.status === 'published' ? new Date().toISOString() : null,
      scheduledAt: postData.status === 'scheduled' ? postData.scheduledAt : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seoScore: postData.seoScore || 85,
      relatedPostIds: postData.relatedPostIds,
    };

    posts.unshift(newPost);
    saveLocalPosts(posts);
    return newPost;
  },

  async updatePost(id: string, postData: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const posts = getLocalPosts();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Article not found');

    const categories = getLocalCategories();
    const authors = getLocalAuthors();

    const category = postData.categoryId
      ? categories.find((c) => c.id === postData.categoryId)
      : posts[index].category;

    const author = postData.authorId
      ? authors.find((a) => a.id === postData.authorId)
      : posts[index].author;

    posts[index] = {
      ...posts[index],
      ...postData,
      category,
      author,
      updatedAt: new Date().toISOString(),
      publishedAt:
        postData.status === 'published' && !posts[index].publishedAt
          ? new Date().toISOString()
          : posts[index].publishedAt,
    };

    saveLocalPosts(posts);
    return posts[index];
  },

  async duplicatePost(id: string): Promise<BlogPost> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
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
    try {
      await fetch(`${API_BASE_URL}/admin/posts/${id}/trash`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch {
      // Fallback
    }
    const posts = getLocalPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.status = 'archived';
      saveLocalPosts(posts);
    }
  },

  async restoreFromTrash(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/admin/posts/${id}/restore`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch {
      // Fallback
    }
    const posts = getLocalPosts();
    const post = posts.find((p) => p.id === id);
    if (post) {
      post.status = 'draft';
      saveLocalPosts(posts);
    }
  },

  async permanentlyDelete(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      // Fallback
    }
    const posts = getLocalPosts().filter((p) => p.id !== id);
    saveLocalPosts(posts);
  },

  async bulkAction(ids: string[], action: 'trash' | 'restore' | 'delete' | 'publish' | 'draft'): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/admin/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ids,
          action: action === 'delete' ? 'delete' : action === 'trash' ? 'trash' : 'change_status',
          value: action === 'publish' ? 'published' : action === 'draft' || action === 'restore' ? 'draft' : undefined,
        }),
      });
    } catch {
      // Fallback
    }

    const posts = getLocalPosts();
    if (action === 'delete') {
      const remaining = posts.filter((p) => !ids.includes(p.id));
      saveLocalPosts(remaining);
    } else {
      posts.forEach((p) => {
        if (ids.includes(p.id)) {
          if (action === 'trash') p.status = 'archived';
          else if (action === 'restore') p.status = 'draft';
          else if (action === 'publish') {
            p.status = 'published';
            if (!p.publishedAt) p.publishedAt = new Date().toISOString();
          } else if (action === 'draft') p.status = 'draft';
        }
      });
      saveLocalPosts(posts);
    }
  },

  // 2. Categories CRUD
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocalCategories();
  },

  async createCategory(cat: Partial<BlogCategory>): Promise<BlogCategory> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cat),
      });
      if (res.ok) return await res.json();
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
    try {
      await fetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch {
      // Fallback
    }
    const categories = getLocalCategories().filter((c) => c.id !== id);
    saveLocalCategories(categories);
  },

  // 3. Tags CRUD
  async getTags(query?: string): Promise<BlogTag[]> {
    try {
      const url = query ? `${API_BASE_URL}/admin/tags?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/admin/tags`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) return await res.json();
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name_ar: nameAr, name_en: nameEn || nameAr, slug }),
      });
      if (res.ok) return await res.json();
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
      const res = await fetch(`${API_BASE_URL}/admin/authors`, { credentials: 'include' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocalAuthors();
  },

  async createAuthor(authorData: Partial<BlogAuthor>): Promise<BlogAuthor> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(authorData),
      });
      if (res.ok) return await res.json();
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
