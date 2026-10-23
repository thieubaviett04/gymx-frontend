import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5113/api')
  .replace(/\/+$/, '')
  .replace(/\/v1$/, '');
const API_URL = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const tokenData = data.data;
    const cookieStore = await cookies();

    // Lưu refreshToken trong HttpOnly Cookie — bảo vệ chống tấn công XSS
    if (tokenData?.refreshToken) {
      cookieStore.set('gymx_refresh_token', tokenData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 ngày
      });
    }

    // Lưu cookie đánh dấu phiên xác thực cho Middleware/SSR
    cookieStore.set('gymx_authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    // Trả về data cho client lưu accessToken in-memory và user info trong Zustand
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
      { error: { code: 'Auth.ServerError', message: error.message || 'Lỗi kết nối máy chủ' } },
      { status: 500 },
    );
  }
}
