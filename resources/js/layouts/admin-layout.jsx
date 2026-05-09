import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageCircleWarning,
    Recycle,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { title: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Residents', href: '/admin/residents', icon: Users },
    { title: 'Waste Management', href: '/admin/waste-management/schedules', icon: Recycle },
    { title: 'Document Requests', href: '/admin/document-requests', icon: FileText },
    { title: 'Complaint Management', href: '/admin/complaints', icon: MessageCircleWarning },
    { title: 'Announcements', href: '/admin/announcements', icon: Bell },
];

export default function AdminLayout({ children }) {
    const { url } = usePage();

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="flex w-[185px] shrink-0 flex-col border-r border-slate-200 bg-white">
                {/* Brand */}
                <div className="flex items-center gap-2.5 px-4 py-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
                        B
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none text-slate-900">BarangaECO</p>
                        <p className="mt-0.5 text-[10px] leading-none text-slate-500">Admin Portal</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
                    {navItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'border-l-[3px] border-blue-600 bg-blue-50 pl-[9px] font-medium text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                )}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="border-t border-slate-100 px-2 py-3">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
