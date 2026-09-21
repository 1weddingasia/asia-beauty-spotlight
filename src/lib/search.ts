/**
 * search.ts — Legacy file (không còn được dùng)
 *
 * Chức năng tìm kiếm đã được chuyển sang Supabase Server Actions:
 * @see src/app/actions/search.ts → searchBusinessesAction()
 *
 * File này được giữ lại để tham khảo logic normalize tiếng Việt.
 */

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
