"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProtectedRouteProps } from '@/types';
import Loading from './loading';

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/');
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <Loading size="large" fullScreen={true} />
            </div>
        );
    }

    return <>{children}</>;
}