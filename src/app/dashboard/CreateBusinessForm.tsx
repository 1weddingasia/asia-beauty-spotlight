'use client';

import { useActionState } from 'react';
import { createBusinessAction } from './actions';

export default function CreateBusinessForm() {
  const [state, formAction, pending] = useActionState(createBusinessAction, null);

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
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="Vd: Thẩm Mỹ Viện Ngọc Dung"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Đường dẫn (Slug)</label>
            <input 
              name="slug" 
              required 
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="Vd: tham-my-vien-ngoc-dung"
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
