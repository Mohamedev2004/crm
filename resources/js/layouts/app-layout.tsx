import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    user: {
        role: 'admin' | 'client' | 'commercial';
        name?: string;
        // add other user fields if needed
    };
}

export default ({ children, breadcrumbs, user }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} user={user}>
        {children}
    </AppLayoutTemplate>
);
