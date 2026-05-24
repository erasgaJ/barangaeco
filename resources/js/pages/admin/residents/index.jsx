import { Head } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-teal-500',
];

function getInitials(name) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function getAvatarColor(name) {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function StatusBadge({ status }) {
    const styles = {
        verified: 'bg-green-100 text-green-700',
        pending: 'bg-amber-100 text-amber-700',
        rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
        verified: 'Active',
        pending: 'Pending',
        rejected: 'Rejected',
    };
    return (
        <span
            className={cn(
                'rounded-full px-3 py-0.5 text-xs font-medium',
                styles[status],
            )}
        >
            {labels[status]}
        </span>
    );
}

export default function ResidentsIndex({ residents, barangays }) {
    const [search, setSearch] = useState('');
    const [barangayFilter, setBarangayFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filtered = residents.data.filter((r) => {
        const matchSearch =
            !search ||
            r.full_name.toLowerCase().includes(search.toLowerCase()) ||
            r.address.toLowerCase().includes(search.toLowerCase());
        const matchBarangay =
            !barangayFilter || String(r.barangay.id) === barangayFilter;
        const matchStatus =
            !statusFilter || r.verification_status === statusFilter;
        return matchSearch && matchBarangay && matchStatus;
    });

    return (
        <>
            <Head title="Residents" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Resident Records
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Manage and view all registered barangay residents.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                        <Plus className="h-4 w-4" />
                        Add Resident
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="relative max-w-xs flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Name, ID, Address..."
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
                        <option value="">All Zones</option>
                        {barangays.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                    >
                        <option value="">All Statuses</option>
                        <option value="verified">Active</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                <th className="px-5 py-3 text-left">ID</th>
                                <th className="px-5 py-3 text-left">
                                    Resident Name
                                </th>
                                <th className="px-5 py-3 text-left">Address</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((resident) => (
                                <tr
                                    key={resident.id}
                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                >
                                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                                        {`BR-${String(resident.id).padStart(3, '0')}`}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={cn(
                                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                                                    getAvatarColor(
                                                        resident.full_name,
                                                    ),
                                                )}
                                            >
                                                {getInitials(
                                                    resident.full_name,
                                                )}
                                            </div>
                                            <span className="font-medium text-slate-900">
                                                {resident.full_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-slate-600">
                                        {resident.address}
                                    </td>
                                    <td className="px-5 py-3">
                                        <StatusBadge
                                            status={
                                                resident.verification_status
                                            }
                                        />
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-10 text-center text-slate-400"
                                    >
                                        No residents found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Showing {residents.data.length} of {residents.total}{' '}
                            entries
                        </p>
                        <div className="flex items-center gap-1">
                            {residents.links.map((link, i) => (
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
