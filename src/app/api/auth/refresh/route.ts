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

    if (!refreshToken) {
      return NextResponse.json(
        { error: { code: 'Auth.NoRefreshToken', message: 'Không tìm thấy phiên làm việc' } },
        { status: 401 },
      );
    }

    const response = await fetch(`${API_URL}/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Refresh thất bại -> xóa cookie
      cookieStore.delete('gymx_refresh_token');
      cookieStore.delete('gymx_authenticated');
      return NextResponse.json(data, { status: response.status });
    }

    const tokenData = data.data;

    // Cập nhật refreshToken mới vào HttpOnly Cookie
    if (tokenData?.refreshToken) {
      cookieStore.set('gymx_refresh_token', tokenData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        accessToken: tokenData.accessToken,
        expiresAt: tokenData.expiresAt,
        roles: tokenData.roles,
        userId: tokenData.userId,
        email: tokenData.email,
        fullName: tokenData.fullName,
        avatarUrl: tokenData.avatarUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'Auth.ServerError', message: error.message || 'Lỗi làm mới phiên' } },
      { status: 500 },
    );
  }
}
