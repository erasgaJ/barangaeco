import { usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import ResidentLayout from '@/layouts/resident-layout';

export default function RoleAwareLayout({ children }) {
    const { auth } = usePage().props;
    const role = auth?.user?.role;

    if (role === 'resident') {
        return <ResidentLayout>{children}</ResidentLayout>;
    }

    return <AdminLayout>{children}</AdminLayout>;
}
