import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageCircleWarning,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { title: 'Dashboard', href: '/resident/dashboard', icon: LayoutDashboard },
    {
        title: 'Document Requests',
        href: '/resident/document-requests',
        icon: FileText,
    },
    {
        title: 'Complaints',
        href: '/resident/complaints',
        icon: MessageCircleWarning,
    },
    { title: 'Announcements', href: '/resident/announcements', icon: Bell },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
        activePrefix: '/settings',
    },
];

export default function ResidentLayout({ children }) {
    const { url } = usePage();

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside className="flex w-[185px] shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {/* Brand */}
                <div className="flex items-center gap-2.5 px-4 py-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 text-sm font-bold text-white">
                        B
                    </div>
                    <div>
                        <p className="text-sm leading-none font-bold text-slate-900 dark:text-slate-100">
                            BarangaECO
                        </p>
                        <p className="mt-0.5 text-[10px] leading-none text-slate-500 dark:text-slate-400">
                            Resident Portal
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
                    {navItems.map((item) => {
                        const isActive = url.startsWith(
                            item.activePrefix ?? item.href,
                        );
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'border-l-[3px] border-green-600 bg-green-50 pl-[9px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                                )}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="border-t border-slate-100 px-2 py-3 dark:border-slate-800">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
