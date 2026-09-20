import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS and use Admin API
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbGx0YWlnb2hlbWphZ2Z6eHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTgwNzE0NiwiZXhwIjoyMTA1MzgzMTQ2fQ.R_Q4p01oU5gg9GUpn3TL2SPt7L2brq2kqwy6SnR9row'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, business_id } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Thiếu email hoặc mật khẩu' }, { status: 400 });
    }

    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: role || 'owner' }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. If it's a Business Owner and business_id is provided, link them
    if (role === 'owner' && business_id) {
      const { error: linkError } = await supabase.from('businesses')
        .update({ owner_id: userId })
        .eq('id', business_id);
        
      if (linkError) {
        return NextResponse.json({ error: 'Tạo tài khoản thành công nhưng lỗi khi liên kết doanh nghiệp: ' + linkError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
