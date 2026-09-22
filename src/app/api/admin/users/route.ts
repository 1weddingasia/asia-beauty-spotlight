import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

// Helper to get supabase client inside request handlers to avoid build-time errors
const getAdminSupabase = () => createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = getAdminSupabase();
    const body = await request.json();
    const { email, password, role, business_id } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Thiếu email hoặc mật khẩu' }, { status: 400 });
    }

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: role || 'owner' }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    if (role === 'owner' && business_id) {
      const { error: linkError } = await adminSupabase.from('businesses')
        .update({ owner_id: userId })
        .eq('id', business_id);
        
      if (linkError) {
        return NextResponse.json({ error: 'Tạo tài khoản thành công nhưng lỗi liên kết: ' + linkError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = getAdminSupabase();
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu user ID' }, { status: 400 });
    }

    // Unlink business first
    await adminSupabase.from('businesses').update({ owner_id: null }).eq('owner_id', userId);

    // Delete user from auth
    const { error } = await adminSupabase.auth.admin.deleteUser(userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Profile table trigger handles deletion automatically, or we just leave it.
    // Actually, deleting from auth.users usually cascades to public.profiles if configured, 
    // or we can manually delete from profiles.
    await adminSupabase.from('profiles').delete().eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
