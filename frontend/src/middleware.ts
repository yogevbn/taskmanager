import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = ['/', '/login', '/register'];

// Define paths that should be completely ignored by middleware
const ignoredPaths = [
    '/api/',
    '/auth/',
    '/_next/',
    '/favicon.ico',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware completely for ignored paths
    if (ignoredPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;
    const isPublicPath = publicPaths.includes(pathname);

    // Allow access to public paths
    if (isPublicPath) {
        // If user is logged in and tries to access login/register, redirect to dashboard
        if (token && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Handle protected routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Only run middleware on specific paths
        '/',
        '/login',
        '/register',
        '/dashboard/:path*',
        '/profile/:path*',
    ],
}; 