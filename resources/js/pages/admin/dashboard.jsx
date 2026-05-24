import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    MoreVertical,
    Truck,
    Users,
    Waves,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-amber-100 text-amber-700',
        resolved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
        pending: 'Pending',
        resolved: 'Approved',
        rejected: 'Rejected',
    };
    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                styles[status],
            )}
        >
            {labels[status]}
        </span>
    );
}

function RouteIcon({ schedule }) {
    const status = schedule.status_update?.status ?? 'pending';
    if (status === 'completed') {
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Truck className="h-4 w-4 text-blue-600" />
        </div>
    );
}

export default function Dashboard({
    stats,
    recent_document_requests,
    today_schedules,
}) {
    const completedRoutes = today_schedules.filter(
        (s) => s.status_update?.status === 'completed',
    ).length;
    const totalRoutes = today_schedules.length;
    const progressPct =
        totalRoutes > 0 ? Math.round((completedRoutes / totalRoutes) * 100) : 0;

    const statCards = [
        {
            label: 'Residents',
            value: stats.total_residents.toLocaleString(),
            icon: Users,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            badge: '+24 this mo',
            badgeStyle: 'bg-green-100 text-green-700',
        },
        {
            label: 'Pending Requests',
            value: stats.pending_document_requests,
            icon: ClipboardList,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            badge: 'View all',
            badgeStyle: 'bg-slate-100 text-slate-600',
            badgeHref: '/admin/document-requests',
        },
        {
            label: 'Active Routes',
            value: stats.active_routes,
            icon: Waves,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            badge: "Today's",
            badgeStyle: 'bg-green-100 text-green-700',
        },
        {
            label: 'Open Complaints',
            value: stats.open_complaints,
            icon: AlertTriangle,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            badge: 'Resolve',
            badgeStyle: 'bg-red-100 text-red-600',
            badgeHref: '/admin/complaints',
        },
    ];

    return (
        <>
            <Head title="Overview" />
            <div className="p-6">
                {/* Stat Cards */}
                <div className="mb-6 grid grid-cols-4 gap-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div
                                    className={cn(
                                        'rounded-full p-2',
                                        card.iconBg,
                                    )}
                                >
                                    <card.icon
                                        className={cn(
                                            'h-5 w-5',
                                            card.iconColor,
                                        )}
                                    />
                                </div>
                                {card.badgeHref ? (
                                    <a
                                        href={card.badgeHref}
                                        className={cn(
                                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                            card.badgeStyle,
                                        )}
                                    >
                                        {card.badge}
                                    </a>
                                ) : (
                                    <span
                                        className={cn(
                                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                            card.badgeStyle,
                                        )}
                                    >
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                {card.label}
                            </p>
                            <p className="mt-0.5 text-2xl font-bold text-slate-900">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom panels */}
                <div className="grid grid-cols-5 gap-4">
                    {/* Recent Certificate Requests */}
                    <div className="col-span-3 rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h2 className="font-semibold text-slate-900">
                                Recent Certificate Requests
                            </h2>
                            <button className="rounded p-1 text-slate-400 hover:bg-slate-100">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                    <th className="px-5 py-3 text-left">
                                        Resident Name
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Type
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Date
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_document_requests.map((req) => (
                                    <tr
                                        key={req.id}
                                        className="border-b border-slate-50 last:border-0"
                                    >
                                        <td className="px-5 py-3 font-medium text-slate-900">
                                            {req.resident_name}
                                        </td>
                                        <td className="px-5 py-3 text-slate-600">
                                            {req.document_type}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">
                                            {new Date(
                                                req.created_at,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={req.status} />
                                        </td>
                                    </tr>
                                ))}
                                {recent_document_requests.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-5 py-8 text-center text-slate-400"
                                        >
                                            No recent requests
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Today's Waste Collection */}
                    <div className="col-span-2 rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="font-semibold text-slate-900">
                                Today's Waste Collection
                            </h2>
                        </div>
                        <div className="p-5">
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">
                                    Overall Progress
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                    {progressPct}%
                                </span>
                            </div>
                            <div className="mb-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-green-500 transition-all"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                            <p className="mb-4 text-xs text-slate-500">
                                {completedRoutes} of {totalRoutes} routes
                                completed
                            </p>

                            <div className="flex flex-col gap-2">
                                {today_schedules.map((schedule) => {
                                    const isInProgress =
                                        schedule.status_update?.status ===
                                        'in_progress';
                                    const isCompleted =
                                        schedule.status_update?.status ===
                                        'completed';
                                    return (
                                        <div
                                            key={schedule.id}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg border p-3',
                                                isInProgress
                                                    ? 'border-blue-300 bg-blue-50'
                                                    : 'border-slate-200 bg-white',
                                            )}
                                        >
                                            <RouteIcon schedule={schedule} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-900">
                                                    {schedule.route_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {isCompleted
                                                        ? `Done ${schedule.status_update?.time ?? ''}`
                                                        : isInProgress
                                                          ? 'In Progress'
                                                          : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {today_schedules.length === 0 && (
                                    <p className="py-4 text-center text-sm text-slate-400">
                                        No routes scheduled today
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
