import { Head, Link } from '@inertiajs/react';
import { Bell, ClipboardList, MessageCircleWarning, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import ResidentLayout from '@/layouts/resident-layout';

function ScheduleStatusBadge({ status }) {
    const styles = {
        pending: 'bg-amber-100 text-amber-700',
        in_progress: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-slate-100 text-slate-600',
    };
    const labels = {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                styles[status] ?? 'bg-slate-100 text-slate-600',
            )}
        >
            {labels[status] ?? status}
        </span>
    );
}

export default function ResidentDashboard({
    resident,
    pending_document_requests,
    open_complaints,
    today_schedule,
    announcements,
}) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="p-6">
                {/* Greeting */}
                <h1 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">
                    Welcome back
                    {resident?.full_name ? `, ${resident.full_name}` : ''}!
                </h1>

                {/* Stat cards */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                    {/* Pending Requests */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-3 flex items-start justify-between">
                            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                                <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <Link
                                href="/resident/document-requests"
                                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                View all
                            </Link>
                        </div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Pending Requests
                        </p>
                        <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {pending_document_requests}
                        </p>
                    </div>

                    {/* Open Complaints */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-3 flex items-start justify-between">
                            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                                <MessageCircleWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <Link
                                href="/resident/complaints"
                                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                View all
                            </Link>
                        </div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Open Complaints
                        </p>
                        <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {open_complaints}
                        </p>
                    </div>
                </div>

                {/* Bottom panels */}
                <div className="grid grid-cols-5 gap-4">
                    {/* Today's Collection */}
                    <div className="col-span-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                                Today's Collection
                            </h2>
                        </div>
                        <div className="p-5">
                            {today_schedule ? (
                                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                        <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {today_schedule.zone_name ??
                                                'Your Zone'}
                                        </p>
                                        {today_schedule.scheduled_time && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {today_schedule.scheduled_time}
                                            </p>
                                        )}
                                    </div>
                                    <ScheduleStatusBadge
                                        status={
                                            today_schedule.status ?? 'pending'
                                        }
                                    />
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">
                                    No collection scheduled today
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recent Announcements */}
                    <div className="col-span-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                                <Bell className="h-4 w-4 text-green-600" />
                                Recent Announcements
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {announcements.length > 0 ? (
                                announcements.slice(0, 5).map((item) => (
                                    <div key={item.id} className="px-5 py-4">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {item.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(
                                                item.published_at,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                                    No announcements yet
                                </p>
                            )}
                        </div>
                        <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                            <Link
                                href="/resident/announcements"
                                className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            >
                                View all announcements →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ResidentDashboard.layout = (page) => <ResidentLayout>{page}</ResidentLayout>;
