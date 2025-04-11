import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Add public paths that don't require authentication
const publicPaths = ['/', '/signin', '/signup', '/api/auth', '/explore', '/api/public-notes', '/profile', '/api/users', '/api/users/[id]', '/api/folders', '/api/folders/[id]', '/api/notes/[id]', '/api/bookmarks/[noteId]', '/api/public/folders', '/api/public/notes', '/folders/[id]', '/notes/[id]', '/bookmarks/[noteId]', '/notes/folders/[id]', '/notes/folders'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Check if the path is public
    const isPublicPath = publicPaths.some(publicPath =>
        path === publicPath || path.startsWith(`${publicPath}/`)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Check for authentication token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // Redirect to signin if no token and trying to access protected route
    if (!token) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

// Match all routes except for static files, API routes that don't need auth, etc.
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/public-notes|images).*)',
    ],
};