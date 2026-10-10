'use client';

import { useActionState, useState } from 'react';
import { createBusinessAction } from './actions';

export default function CreateBusinessForm({
  categories = []
}: {
  categories?: { slug: string; name: string }[]
}) {
  const [state, formAction, pending] = useActionState(createBusinessAction, null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [category, setCategory] = useState('');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isSlugEdited) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugEdited(true);
  };

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4 text-left">
      <div className="border-t border-border pt-6">
        <h2 className="text-lg font-bold mb-4">Tạo gian hàng mới</h2>
        
        {state?.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên gian hàng</label>
            <input 
              name="name" 
              required 
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="Vd: Tên doanh nghiệp / Cửa hàng của bạn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Đường dẫn (Slug)</label>
            <input 
              name="slug" 
              required 
              value={slug}
              onChange={handleSlugChange}
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="Vd: ten-doanh-nghiep-cua-ban"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Điện thoại</label>
            <input 
              name="phone" 
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="Vd: 0901234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <input 
              name="address" 
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="Vd: 123 Đường ABC, Quận 1, TP.HCM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ngành nghề kinh doanh <span className="text-red-500">*</span></label>
            <select
              name="category_slug"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground"
            >
              <option value="" disabled>-- Chọn ngành nghề --</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={pending}
          className="mt-6 w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Đang tạo..." : "Tạo gian hàng"}
        </button>
      </div>
    </form>
  );
}
