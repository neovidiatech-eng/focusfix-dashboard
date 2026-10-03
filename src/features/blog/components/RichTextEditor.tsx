import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Youtube,
  Code2,
  Eye,
  Search,
  X,
} from 'lucide-react';
import { blogApi } from '../api/blogApi';
import { InternalLinkItem } from '../types/blog.types';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'ابدأ بكتابة محتوى المقال التفاعلي هنا...',
  minHeight = '420px',
}: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);
  const [linkRel, setLinkRel] = useState<'follow' | 'nofollow' | 'sponsored' | 'ugc'>('follow');
  const [internalSearch, setInternalSearch] = useState('');
  const [internalResults, setInternalResults] = useState<InternalLinkItem[]>([]);
  const [isSearchingInternal, setIsSearchingInternal] = useState(false);

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [imageWidth, setImageWidth] = useState<'100%' | '75%' | '50%' | '25%'>('100%');

  // Embed Modal State
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [embedType, setEmbedType] = useState<'youtube' | 'map'>('youtube');

  // Table Modal State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);

  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          // STRICT RULE: No H1 inside the editor! Title is the only H1!
          levels: [2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-600 underline font-medium hover:text-emerald-700 transition-colors',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-slate max-w-none focus:outline-none min-h-[${minHeight}] p-5 text-slate-800 leading-relaxed font-sans text-base`,
      },
    },
    onUpdate: ({ editor }) => {
      if (!isUpdatingRef.current) {
        const html = editor.getHTML();
        setHtmlContent(html);
        onChange(html);
      }
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      isUpdatingRef.current = true;
      editor.commands.setContent(value || '<p></p>');
      setHtmlContent(value || '');
      isUpdatingRef.current = false;
    }
  }, [value, editor]);

  // Handle Internal Link Search
  useEffect(() => {
    if (!isLinkModalOpen) return;
    const timer = setTimeout(async () => {
      setIsSearchingInternal(true);
      const results = await blogApi.searchInternalLinks(internalSearch);
      setInternalResults(results);
      setIsSearchingInternal(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [internalSearch, isLinkModalOpen]);

  // Open Link Modal with selected text
  const openLinkDialog = () => {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );
    const existingLink = editor.getAttributes('link');
    setLinkText(selectedText || '');
    setLinkUrl(existingLink.href || '');
    setLinkOpenNewTab(existingLink.target === '_blank');
    if (existingLink.rel?.includes('nofollow')) setLinkRel('nofollow');
    else if (existingLink.rel?.includes('sponsored')) setLinkRel('sponsored');
    else if (existingLink.rel?.includes('ugc')) setLinkRel('ugc');
    else setLinkRel('follow');

    setIsLinkModalOpen(true);
  };

  // Submit Link
  const applyLink = () => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      setIsLinkModalOpen(false);
      return;
    }

    let relString = '';
    if (linkRel === 'nofollow') relString = 'nofollow';
    else if (linkRel === 'sponsored') relString = 'sponsored';
    else if (linkRel === 'ugc') relString = 'ugc';

    if (linkOpenNewTab) {
      relString = relString ? `${relString} noopener noreferrer` : 'noopener noreferrer';
    }

    if (linkText && editor.state.selection.empty) {
      // Insert new link with text
      const targetAttr = linkOpenNewTab ? ' target="_blank"' : '';
      const relAttr = relString ? ` rel="${relString}"` : '';
      const linkTag = `<a href="${linkUrl}"${targetAttr}${relAttr} class="text-emerald-600 underline font-medium">${linkText}</a>`;
      editor.commands.insertContent(linkTag);
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: linkUrl,
          target: linkOpenNewTab ? '_blank' : null,
          rel: relString || null,
        })
        .run();
    }

    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Apply Inline Image
  const applyImage = () => {
    if (!editor || !imageUrl) return;

    const alignClass =
      imageAlign === 'center'
        ? 'mx-auto text-center'
        : imageAlign === 'left'
        ? 'mr-auto text-left'
        : 'ml-auto text-right';

    const cleanAlt = imageAlt ? imageAlt.replace(/"/g, '&quot;') : '';
    const captionHtml = imageCaption
      ? `<figcaption class="text-center text-xs text-slate-500 mt-2 italic">${imageCaption}</figcaption>`
      : '';

    const figureHtml = `
      <figure class="my-6 ${alignClass}" style="max-width: ${imageWidth};">
        <img src="${imageUrl}" alt="${cleanAlt}" class="rounded-xl shadow-md w-full object-cover border border-slate-100" loading="lazy" />
        ${captionHtml}
      </figure>
    `;

    editor.commands.insertContent(figureHtml);
    setIsImageModalOpen(false);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
  };

  // Apply Table
  const applyTable = () => {
    if (!editor) return;
    let tableHtml = `<table class="min-w-full my-6 border-collapse border border-slate-200 rounded-lg overflow-hidden text-sm">`;

    if (hasHeader) {
      tableHtml += `<thead class="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200"><tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<th class="border border-slate-200 p-3 text-right">عنوان ${c + 1}</th>`;
      }
      tableHtml += `</tr></thead>`;
    }

    tableHtml += `<tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr class="hover:bg-slate-50 border-b border-slate-100">`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td class="border border-slate-200 p-3">بيانات ${r + 1}-${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p></p>`;

    editor.commands.insertContent(tableHtml);
    setIsTableModalOpen(false);
  };

  // Apply Embed
  const applyEmbed = () => {
    if (!editor || !embedCode) return;
    let embedHtml = '';

    if (embedType === 'youtube') {
      let videoId = embedCode;
      if (embedCode.includes('v=')) {
        videoId = embedCode.split('v=')[1]?.split('&')[0] || embedCode;
      } else if (embedCode.includes('youtu.be/')) {
        videoId = embedCode.split('youtu.be/')[1]?.split('?')[0] || embedCode;
      }

      embedHtml = `
        <div class="my-6 aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-slate-200">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            title="فيديو شرح صيانة FocusFix" 
            class="w-full h-full"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div><p></p>
      `;
    } else {
      // Map or raw iframe
      embedHtml = `<div class="my-6 rounded-xl overflow-hidden shadow-md border border-slate-200 aspect-video">${embedCode}</div><p></p>`;
    }

    editor.commands.insertContent(embedHtml);
    setIsEmbedModalOpen(false);
    setEmbedCode('');
  };

  // Toggle HTML code view
  const handleHtmlCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlContent(val);
    onChange(val);
    if (editor) {
      editor.commands.setContent(val);
    }
  };

  if (!editor) {
    return (
      <div className="border border-slate-200 rounded-xl p-8 bg-slate-50 text-center text-slate-400">
        جاري تحميل المحرر المتقدم...
      </div>
    );
  }

  return (
    <div className="border border-slate-300 rounded-2xl bg-white shadow-sm overflow-hidden transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
      {/* Top Toolbar */}
      <div className="bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 p-2 flex flex-wrap items-center gap-1.5 select-none sticky top-0 z-10">
        {/* Headings - STRICTLY H2, H3, H4 (No H1!) */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
          <button
            type="button"
            title="عنوان رئيسي (H2)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-xs font-bold transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="عنوان فرعي (H3)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded text-xs font-bold transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="قسم داخلي (H4)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`p-1.5 rounded text-xs font-bold transition-colors ${
              editor.isActive('heading', { level: 4 })
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heading4 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Styles */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
          <button
            type="button"
            title="عريض (Bold)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('bold') ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="مائل (Italic)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('italic') ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="يتوسطه خط (Strikethrough)"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('strike') ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
          <button
            type="button"
            title="قائمة نقطية (Bullet List)"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="قائمة رقمية (Numbered List)"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="اقتباس مخصص (Blockquote)"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="كود برمجي (Code Block)"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive('codeBlock')
                ? 'bg-emerald-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Rich Media Inserts */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
          <button
            type="button"
            title="إدراج رابط خارجي أو داخلي ذكي (Insert Link)"
            onClick={openLinkDialog}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
              editor.isActive('link') ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="إدراج صورة داخل المقال مع Alt Text و Caption"
            onClick={() => setIsImageModalOpen(true)}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="إدراج جدول مقارنة فنية (Insert Table)"
            onClick={() => setIsTableModalOpen(true)}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="تضمين فيديو يوتيوب أو خريطة فرع (Embed Video / Map)"
            onClick={() => setIsEmbedModalOpen(true)}
            className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Youtube className="w-4 h-4 text-rose-500" />
          </button>
        </div>

        {/* Code / Visual View Mode */}
        <div className="mr-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isHtmlMode
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isHtmlMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>المعاينة المرئية</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5" />
                <span>شفرة HTML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      {isHtmlMode ? (
        <div className="p-4 bg-slate-950 font-mono text-sm text-emerald-400 min-h-[420px]">
          <textarea
            value={htmlContent}
            onChange={handleHtmlCodeChange}
            className="w-full h-full min-h-[400px] bg-transparent text-emerald-300 focus:outline-none resize-y font-mono text-sm leading-relaxed"
            placeholder="<p>اكتب كود HTML المباشر هنا...</p>"
          />
        </div>
      ) : (
        <div className="relative">
          <EditorContent editor={editor} />
          {editor.isEmpty && (
            <div className="absolute top-5 right-5 pointer-events-none text-slate-400 text-base select-none">
              {placeholder}
            </div>
          )}
        </div>
      )}

      {/* Bottom Status Info */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>الكلمات: {editor.storage.characterCount?.words?.() || editor.state.doc.textContent.split(/\s+/).filter(Boolean).length}</span>
          <span>الحروف: {editor.state.doc.textContent.length}</span>
        </div>
        <div className="text-emerald-700 font-medium">
          ✓ محرر متوافق مع معايير SEO (H1 العنوان الرئيسي فقط - ترويسات داخلية H2 / H3 / H4)
        </div>
      </div>

      {/* 1. LINK MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span>إدراج وتخصيص الرابط (Link SEO)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Link Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص الرابط (Anchor Text)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="مثال: تعرف على أسعار شاشات الآيفون الأصلية"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الرابط المستهدف (URL)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com أو /pricing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left ltr"
                />
              </div>

              {/* Target & Attributes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={linkOpenNewTab}
                    onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>فتح في علامة تبويب جديدة (target="_blank" + noopener noreferrer)</span>
                </label>
              </div>

              {/* SEO Rel Attribute */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  نوع الرابط لمحركات البحث (SEO Link Type):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      linkRel === 'follow'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rel"
                      value="follow"
                      checked={linkRel === 'follow'}
                      onChange={() => setLinkRel('follow')}
                      className="sr-only"
                    />
                    <div>طبيعي (Follow)</div>
                    <p className="text-[10px] text-slate-500 font-normal">الرابط الطبيعي ينقل ثقة الموقع</p>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      linkRel === 'nofollow'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rel"
                      value="nofollow"
                      checked={linkRel === 'nofollow'}
                      onChange={() => setLinkRel('nofollow')}
                      className="sr-only"
                    />
                    <div>لا تتبع (Nofollow)</div>
                    <p className="text-[10px] text-slate-500 font-normal">تنبيه محركات البحث بعدم تمرير PageRank</p>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      linkRel === 'sponsored'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rel"
                      value="sponsored"
                      checked={linkRel === 'sponsored'}
                      onChange={() => setLinkRel('sponsored')}
                      className="sr-only"
                    />
                    <div>إعلاني (Sponsored)</div>
                    <p className="text-[10px] text-slate-500 font-normal">لأي رابط مدفوع أو رعاية تجارية</p>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      linkRel === 'ugc'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rel"
                      value="ugc"
                      checked={linkRel === 'ugc'}
                      onChange={() => setLinkRel('ugc')}
                      className="sr-only"
                    />
                    <div>محتوى مستخدم (UGC)</div>
                    <p className="text-[10px] text-slate-500 font-normal">روابط التعليقات والمنتديات</p>
                  </label>
                </div>
              </div>

              {/* Internal Link Picker Assistant */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>البحث في صفحات ومقالات الموقع الداخلية (Internal Links Picker)</span>
                  <span className="text-[10px] text-emerald-600 font-normal">ربط داخلي مثالي لـ SEO</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={internalSearch}
                    onChange={(e) => setInternalSearch(e.target.value)}
                    placeholder="ابحث عن صفحة (الرئيسية، الأسعار، بطاريات...)"
                    className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="mt-2 max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs">
                  {isSearchingInternal ? (
                    <div className="p-3 text-center text-slate-400 text-xs">جاري البحث...</div>
                  ) : internalResults.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">لا توجد نتائج مطابقة</div>
                  ) : (
                    internalResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLinkUrl(item.url);
                          if (!linkText) setLinkText(item.title);
                          setLinkOpenNewTab(false); // Internal link stays on same tab
                          setLinkRel('follow');
                        }}
                        className="w-full p-2 text-right hover:bg-emerald-50 flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium text-slate-800 truncate">{item.title}</span>
                        <span className="font-mono text-[10px] text-slate-400 ltr px-1.5 py-0.5 bg-slate-100 rounded">
                          {item.url}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={applyLink}
                disabled={!linkUrl}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                تطبيق الرابط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. IMAGE MODAL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>إدراج صورة داخل المقال (Image SEO)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رابط الصورة (URL أو من مكتبة الوسائط)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left ltr"
                />
              </div>

              {/* Live Preview */}
              {imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 flex items-center justify-center bg-slate-100">
                  <img src={imageUrl} alt="preview" className="max-h-48 object-contain" />
                </div>
              )}

              {/* Alt Text with SEO Guidance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>النص البديل (Alt Text) — إلزامي لـ SEO</span>
                  <span className="text-[10px] text-amber-600">صف المشهد بذكاء دون حشو كلمات</span>
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="مثال: مهندس فوكس فيكس يقوم باستبدال شاشة آيفون 16 برو في سيارة الخدمة"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تعليق توضيحي أسفل الصورة (Caption)
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="مثال: جهاز فحص البيكسلات الرقمي أثناء المعايرة"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Alignment & Width */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المحاذاة</label>
                  <select
                    value={imageAlign}
                    onChange={(e) => setImageAlign(e.target.value as 'center' | 'left' | 'right')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="center">في المنتصف (Center)</option>
                    <option value="right">يمين (Right)</option>
                    <option value="left">يسار (Left)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">عرض الصورة</label>
                  <select
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value as '100%' | '75%' | '50%' | '25%')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="100%">كامل العرض (100%)</option>
                    <option value="75%">متوسط كبير (75%)</option>
                    <option value="50%">نصف العرض (50%)</option>
                    <option value="25%">صغيرة (25%)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={applyImage}
                disabled={!imageUrl}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                إدراج الصورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TABLE MODAL */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-emerald-600" />
              <span>إدراج جدول مقارنة فنية</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عدد الصفوف</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عدد الأعمدة</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-center"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 w-4 h-4"
              />
              <span>تضمين صف ترويسة رئيسي (Table Header)</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={applyTable}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                إدراج الجدول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EMBED MODAL */}
      {isEmbedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Youtube className="w-4 h-4 text-rose-500" />
              <span>تضمين وسائط خارجية (Video / Maps)</span>
            </h3>

            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setEmbedType('youtube')}
                className={`px-3 py-1 text-xs rounded-lg font-bold ${
                  embedType === 'youtube' ? 'bg-rose-500 text-white' : 'text-slate-600'
                }`}
              >
                YouTube Video
              </button>
              <button
                type="button"
                onClick={() => setEmbedType('map')}
                className={`px-3 py-1 text-xs rounded-lg font-bold ${
                  embedType === 'map' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Google Maps Iframe
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {embedType === 'youtube' ? 'رابط الفيديو على يوتيوب' : 'كود تضمين الخريطة (iframe)'}
              </label>
              <textarea
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                placeholder={
                  embedType === 'youtube'
                    ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                    : '<iframe src="https://www.google.com/maps/embed...">'
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-left ltr"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEmbedModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={applyEmbed}
                disabled={!embedCode}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                تضمين العنصر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
