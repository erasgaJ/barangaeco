import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle2, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import complaintRoutes from '@/routes/admin/complaints';

const PRIORITY_STYLES = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
};

const STATUS_STYLES = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    resolved: 'bg-green-100 text-green-700',
};

const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-teal-500',
];

function getAvatarColor(name) {
    return AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

function getInitials(name) {
    return (name ?? '?')
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function formatComplaintId(complaint) {
    const year = new Date(complaint.created_at).getFullYear();
    return `CMP-${year}-${String(complaint.id).padStart(3, '0')}`;
}

function StatusModal({ complaint, onClose }) {
    const [status, setStatus] = useState(complaint.status);
    const [loading, setLoading] = useState(false);

    function submit() {
        setLoading(true);
        router.patch(
            complaintRoutes.updateStatus(complaint.id).url,
            { status },
            {
                onFinish: () => {
                    setLoading(false);
                    onClose();
                },
            },
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-base font-semibold text-slate-900">
                    Update Status
                </h2>
                <div className="flex flex-col gap-2">
                    {['open', 'in_progress', 'resolved'].map((s) => (
                        <label
                            key={s}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
                        >
                            <input
                                type="radio"
                                name="status"
                                value={s}
                                checked={status === s}
                                onChange={() => setStatus(s)}
                                className="accent-blue-600"
                            />
                            <span
                                className={cn(
                                    'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                    STATUS_STYLES[s],
                                )}
                            >
                                {s.replace('_', ' ')}
                            </span>
                        </label>
                    ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? 'Saving…' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ComplaintDetailModal({ complaint, onClose, onUpdateStatus }) {
    const residentName =
        complaint.resident?.name ?? complaint.resident_name ?? 'Anonymous';
    const barangayName = complaint.barangay?.name ?? '—';

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-base font-semibold text-slate-900">
                            {formatComplaintId(complaint)}
                        </span>
                        <span
                            className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                STATUS_STYLES[complaint.status],
                            )}
                        >
                            {complaint.status.replace('_', ' ')}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body — two columns */}
                <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100 px-0 py-0">
                    {/* Left: Resident Information */}
                    <div className="px-6 py-5">
                        <p className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                            Resident Information
                        </p>
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                                    getAvatarColor(residentName),
                                )}
                            >
                                {getInitials(residentName)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">
                                    {residentName}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Verified Resident
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-slate-600">
                            <span className="font-medium text-slate-700">
                                Barangay:{' '}
                            </span>
                            {barangayName}
                        </div>
                    </div>

                    {/* Right: Complaint Details */}
                    <div className="px-6 py-5">
                        <p className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                            Complaint Details
                        </p>
                        <div className="mb-3">
                            <span
                                className={cn(
                                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                    'bg-slate-100 text-slate-700',
                                )}
                            >
                                {complaint.complaint_type}
                            </span>
                        </div>
                        <p className="mb-4 text-sm text-slate-600">
                            <span className="font-medium text-slate-700">
                                Against:{' '}
                            </span>
                            {complaint.complaint_against}
                        </p>
                        <p className="mb-1 text-xs font-medium text-slate-500">
                            Description
                        </p>
                        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                            {complaint.description}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">
                                Priority:
                            </span>
                            <span
                                className={cn(
                                    'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                    PRIORITY_STYLES[complaint.priority],
                                )}
                            >
                                {complaint.priority}
                            </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            Filed:{' '}
                            {format(
                                new Date(complaint.created_at),
                                'MMM d, yyyy',
                            )}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onUpdateStatus(complaint)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ComplaintsIndex({ complaints, barangays, filters }) {
    const [search, setSearch] = useState('');
    const [barangayFilter, setBarangayFilter] = useState(
        filters?.barangay_id ?? '',
    );
    const [priorityFilter, setPriorityFilter] = useState(
        filters?.priority ?? '',
    );
    const [statusTarget, setStatusTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);

    const filtered = complaints.data.filter((c) => {
        const matchSearch =
            !search ||
            c.complaint_type.toLowerCase().includes(search.toLowerCase()) ||
            c.complaint_against.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase());
        const matchBarangay =
            !barangayFilter || String(c.barangay?.id) === barangayFilter;
        const matchPriority = !priorityFilter || c.priority === priorityFilter;
        return matchSearch && matchBarangay && matchPriority;
    });

    return (
        <>
            <Head title="Complaints" />
            {statusTarget && (
                <StatusModal
                    complaint={statusTarget}
                    onClose={() => setStatusTarget(null)}
                />
            )}
            {detailTarget && (
                <ComplaintDetailModal
                    complaint={detailTarget}
                    onClose={() => setDetailTarget(null)}
                    onUpdateStatus={(c) => {
                        setDetailTarget(null);
                        setStatusTarget(c);
                    }}
                />
            )}

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Complaints
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Track and manage resident complaints and issues.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                        <Plus className="h-4 w-4" />
                        Log Complaint
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="relative max-w-xs flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <select
                        value={barangayFilter}
                        onChange={(e) => setBarangayFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                    >
                        <option value="">All Barangays</option>
                        {barangays.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                    >
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                <th className="px-5 py-3 text-left">
                                    Type / Against
                                </th>
                                <th className="px-5 py-3 text-left">
                                    Barangay
                                </th>
                                <th className="px-5 py-3 text-left">
                                    Priority
                                </th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Filed</th>
                                <th className="px-5 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr
                                    key={c.id}
                                    onClick={() => setDetailTarget(c)}
                                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {c.complaint_type}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Against:{' '}
                                                    {c.complaint_against}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-slate-600">
                                        {c.barangay?.name ?? '—'}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={cn(
                                                'rounded-full px-3 py-0.5 text-xs font-medium capitalize',
                                                PRIORITY_STYLES[c.priority],
                                            )}
                                        >
                                            {c.priority}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={cn(
                                                'rounded-full px-3 py-0.5 text-xs font-medium capitalize',
                                                STATUS_STYLES[c.status],
                                            )}
                                        >
                                            {c.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-slate-500">
                                        {format(
                                            new Date(c.created_at),
                                            'MMM d, yyyy',
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusTarget(c);
                                            }}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                        >
                                            Update Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-slate-400"
                                    >
                                        No complaints found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Showing {complaints.data.length} of{' '}
                            {complaints.total} entries
                        </p>
                        <div className="flex items-center gap-1">
                            {complaints.links.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={cn(
                                        'flex h-7 min-w-7 items-center justify-center rounded px-2 text-xs',
                                        link.active
                                            ? 'bg-blue-600 font-medium text-white'
                                            : 'text-slate-500 hover:bg-slate-100',
                                        !link.url &&
                                            'pointer-events-none opacity-40',
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
