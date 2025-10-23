/* eslint-disable react-hooks/rules-of-hooks */
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Form, usePage } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { enable, disable, show } from '@/routes/two-factor';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({ requiresConfirmation = false, twoFactorEnabled = false }: { requiresConfirmation?: boolean; twoFactorEnabled?: boolean }) {
    const { auth } = usePage<SharedData & { auth: { user: { role: 'admin' | 'client' | 'commercial'; name: string; email: string; email_verified_at?: string | null } | null } }>().props;

    if (!auth?.user) {
        window.location.href = route('login');
        return null;
    }

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();

    const [showSetupModal, setShowSetupModal] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Two-Factor Authentication" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Two-Factor Authentication"
                        description="Manage your two-factor authentication settings"
                    />

                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start space-y-4">
                            <Badge variant="default">Enabled</Badge>
                            <p className="text-muted-foreground">
                                With two-factor authentication enabled, you will
                                be prompted for a secure, random PIN during
                                login. Retrieve it from your TOTP app.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <Form {...disable.form()}>
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2"
                                    >
                                        <ShieldBan /> Disable 2FA
                                    </Button>
                                )}
                            </Form>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start space-y-4">
                            <Badge variant="destructive">Disabled</Badge>
                            <p className="text-muted-foreground">
                                When enabled, two-factor authentication will
                                require a secure PIN from a TOTP app at login.
                            </p>

                            {hasSetupData ? (
                                <Button
                                    onClick={() => setShowSetupModal(true)}
                                    className="flex items-center gap-2"
                                >
                                    <ShieldCheck /> Continue Setup
                                </Button>
                            ) : (
                                <Form
                                    {...enable.form()}
                                    onSuccess={() => setShowSetupModal(true)}
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2"
                                        >
                                            <ShieldCheck /> Enable 2FA
                                        </Button>
                                    )}
                                </Form>
                            )}
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
