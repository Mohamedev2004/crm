import { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { auth } = usePage<
        SharedData & {
            auth: {
                user:
                    | {
                          role: 'admin' | 'client' | 'commercial';
                          name?: string;
                          email?: string;
                          // add other fields if needed
                      }
                    | null;
            };
        }
    >().props;

    // Redirect if not logged in
    useEffect(() => {
        if (!auth?.user) {
            window.location.href = route('login');
        }
    }, [auth?.user]);

    if (!auth?.user) {
        return null; // Don't render anything while redirecting
    }

    const user = auth.user; // TypeScript knows the role type now

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={user}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Appearance settings"
                        description="Update your account's appearance settings"
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
