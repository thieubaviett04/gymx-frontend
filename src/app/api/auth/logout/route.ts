import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5113/api')
  .replace(/\/+$/, '')
  .replace(/\/v1$/, '');
const API_URL = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('gymx_refresh_token')?.value;

    if (refreshToken) {
      try {
        await fetch(`${API_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Backend có thể offline hoặc token hết hạn, tiếp tục xóa cookie
      }
    }

    cookieStore.delete('gymx_refresh_token');
    cookieStore.delete('gymx_authenticated');

    return NextResponse.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'Auth.ServerError', message: error.message || 'Lỗi đăng xuất' } },
      { status: 500 },
    );
  }
}
