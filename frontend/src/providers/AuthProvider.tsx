'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const publicPaths = ['/', '/login', '/register'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { token } = useAuthStore();
    const isPublicPath = publicPaths.includes(pathname);

    useEffect(() => {
        // Only run this effect once when the component mounts
        const initialRedirect = () => {
            if (!token && !isPublicPath) {
                router.replace('/login');
            } else if (token && pathname === '/login') {
                router.replace('/dashboard');
            }
        };
        initialRedirect();
    }, []); // Empty dependency array

    return children;
} 