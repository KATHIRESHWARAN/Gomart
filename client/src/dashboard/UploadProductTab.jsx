import React, { useState } from 'react';
import { productService } from '../services/api';
import { 
  Upload, 
  Image, 
  FileText, 
  DollarSign, 
  Layers, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const CATEGORIES = [
  'E-books',
  'Tutorials',
  'Study Materials',
  'Templates',
  'PDFs',
  'Design Resources',
  'Notes & Guides'
];

const UploadProductTab = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('E-books');
  const [fileType, setFileType] = useState('PDF Document');
  const [fileSize, setFileSize] = useState('15.4 MB');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [digitalFileUrl, setDigitalFileUrl] = useState('');
  const [tags, setTags] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [digitalFile, setDigitalFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleDigitalFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDigitalFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('E-books');
    setFileType('PDF Document');
    setFileSize('15.4 MB');
    setThumbnailUrl('');
    setDigitalFileUrl('');
    setTags('');
    setThumbnailFile(null);
    setDigitalFile(null);
  };

  const fillSampleData = () => {
    setName('Modern Next.js 15 Full Stack Starter Kit');
    setDescription('Production-ready boilerplate including Next.js 15 App Router, Tailwind CSS, PostgreSQL Prisma ORM, NextAuth v5 authentication, Stripe/UPI mock webhook handlers, and responsive dark mode UI.');
    setPrice('29.99');
    setCategory('Templates');
    setFileType('Full Source Code ZIP');
    setFileSize('48.5 MB');
    setThumbnailUrl('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80');
    setDigitalFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setTags('Next.js, React, Tailwind, SaaS, Starter');
    setThumbnailFile(null);
    setDigitalFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || price === '' || isNaN(Number(price))) {
      toast.error('Please fill in title, description, valid price, and category.');
      return;
    }

    if (Number(price) < 0) {
      toast.error('Price cannot be negative.');
      return;
    }

    setUploading(true);

    try {
      let res;
      // If actual files selected from disk, use multipart FormData
      if (thumbnailFile || digitalFile) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('title', name.trim());
        formData.append('description', description.trim());
        formData.append('price', String(Number(price)));
        formData.append('category', category.trim());
        formData.append('fileType', fileType || 'Digital Deliverable');
        formData.append('fileSize', fileSize || 'N/A');
        formData.append('tags', tags);

        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        } else if (thumbnailUrl.trim()) {
          formData.append('thumbnailUrl', thumbnailUrl.trim());
        }

        if (digitalFile) {
          formData.append('digitalFile', digitalFile);
        } else if (digitalFileUrl.trim()) {
          formData.append('digitalFileUrl', digitalFileUrl.trim());
        }

        res = await productService.create(formData);
      } else {
        // Otherwise send clean JSON payload
        const payload = {
          name: name.trim(),
          title: name.trim(),
          description: description.trim(),
          price: Number(price),
          category: category.trim(),
          fileType: fileType || 'Digital Deliverable',
          fileSize: fileSize || 'N/A',
          thumbnailUrl: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          digitalFileUrl: digitalFileUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          tags
        };
        res = await productService.create(payload);
      }

      if (res.data.success) {
        toast.success(`"${name}" listed successfully on E-Products Marketplace!`);
        resetForm();
        if (onComplete) onComplete();
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to list product.';
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-200 dark:border-brand-800">
            <Sparkles className="w-3.5 h-3.5" /> Seller Studio
          </div>
          <h2 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">Upload New Digital Product</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            List your guides, templates, e-books or tutorials for instant global discovery.
          </p>
        </div>

        <button
          type="button"
          onClick={fillSampleData}
          className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-brand-700 dark:text-brand-300 transition-colors"
        >
          Auto-fill Sample Product
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Product Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Complete System Design & Microservices Handbook"
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Price (USD $) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Deliverable Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              File Format (e.g. PDF, ZIP, Figma)
            </label>
            <input
              type="text"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              placeholder="e.g. PDF + Source Code ZIP"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              File Size
            </label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="e.g. 24.5 MB"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Thumbnail (File upload or URL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Thumbnail (Direct Image URL)
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Or Upload Thumbnail File
            </label>
            {thumbnailFile ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300">
                <span className="truncate max-w-[200px] font-semibold">{thumbnailFile.name}</span>
                <button
                  type="button"
                  onClick={() => setThumbnailFile(null)}
                  className="p-1 hover:bg-brand-100 dark:hover:bg-brand-900 rounded-lg text-rose-500"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 dark:file:bg-brand-950 file:text-brand-700 dark:file:text-brand-300 hover:file:bg-brand-100 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Digital Deliverable File (Upload or URL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Downloadable File URL (Google Drive / S3 / Demo)
            </label>
            <input
              type="url"
              value={digitalFileUrl}
              onChange={(e) => setDigitalFileUrl(e.target.value)}
              placeholder="https://.../download.pdf"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Or Upload Digital File
            </label>
            {digitalFile ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300">
                <span className="truncate max-w-[200px] font-semibold">{digitalFile.name}</span>
                <button
                  type="button"
                  onClick={() => setDigitalFile(null)}
                  className="p-1 hover:bg-brand-100 dark:hover:bg-brand-900 rounded-lg text-rose-500"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <input
                type="file"
                onChange={handleDigitalFileChange}
                className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 dark:file:bg-brand-950 file:text-brand-700 dark:file:text-brand-300 hover:file:bg-brand-100 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what the buyer will learn, build, or receive in this package..."
            required
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Search Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. React, Fullstack, Architecture, Guide"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Publishing Digital Asset...' : 'Publish Product to Marketplace'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default UploadProductTab;
