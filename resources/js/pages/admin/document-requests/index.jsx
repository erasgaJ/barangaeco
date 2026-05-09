import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CheckCircle2, FileText, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import documentRequestRoutes from '@/routes/admin/document-requests';

const STATUS_STYLES = {
    pending: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const DOC_LABELS = {
    barangay_clearance: 'Barangay Clearance',
    certificate_of_residency: 'Certificate of Residency',
    indigency_certificate: 'Indigency Certificate',
    business_permit: 'Business Permit',
};

function ApproveModal({ request, onClose }) {
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    function submit() {
        setLoading(true);
        router.post(
            documentRequestRoutes.approve(request.id).url,
            { admin_remarks: remarks },
            { onFinish: () => { setLoading(false); onClose(); } },
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-1 text-base font-semibold text-slate-900">Approve Request</h2>
                <p className="mb-4 text-sm text-slate-500">
                    Approving <span className="font-medium">{DOC_LABELS[request.document_type] ?? request.document_type}</span> for{' '}
                    <span className="font-medium">{request.resident?.full_name}</span>
                </p>
                <label className="mb-1 block text-xs font-medium text-slate-600">Admin Remarks (optional)</label>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Add any notes..."
                />
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? 'Approving…' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function RejectModal({ request, onClose }) {
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    function submit() {
        if (!feedback.trim()) return;
        setLoading(true);
        router.post(
            documentRequestRoutes.reject(request.id).url,
            { rejection_feedback: feedback },
            { onFinish: () => { setLoading(false); onClose(); } },
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-1 text-base font-semibold text-slate-900">Reject Request</h2>
                <p className="mb-4 text-sm text-slate-500">
                    Rejecting <span className="font-medium">{DOC_LABELS[request.document_type] ?? request.document_type}</span> for{' '}
                    <span className="font-medium">{request.resident?.full_name}</span>
                </p>
                <label className="mb-1 block text-xs font-medium text-slate-600">Reason for rejection <span className="text-red-500">*</span></label>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Explain why this request is being rejected..."
                />
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading || !feedback.trim()}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? 'Rejecting…' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DocumentRequestsIndex({ requests, filters }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [approveTarget, setApproveTarget] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);

    const filtered = requests.data.filter((r) => {
        const matchSearch =
            !search ||
            r.resident?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            (DOC_LABELS[r.document_type] ?? r.document_type).toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <Head title="Document Requests" />
            {approveTarget && <ApproveModal request={approveTarget} onClose={() => setApproveTarget(null)} />}
            {rejectTarget && <RejectModal request={rejectTarget} onClose={() => setRejectTarget(null)} />}

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Document Requests</h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Review and process certificate requests from residents.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="relative max-w-xs flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by resident or document type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                                <th className="px-5 py-3 text-left">Resident</th>
                                <th className="px-5 py-3 text-left">Document Type</th>
                                <th className="px-5 py-3 text-left">Purpose</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Submitted</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((req) => (
                                <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{req.resident?.full_name ?? '—'}</p>
                                                <p className="text-xs text-slate-400">{req.resident?.barangay?.name ?? ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-slate-700">
                                        {DOC_LABELS[req.document_type] ?? req.document_type}
                                    </td>
                                    <td className="max-w-[200px] truncate px-5 py-3 text-slate-600">
                                        {req.purpose}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={cn('rounded-full px-3 py-0.5 text-xs font-medium capitalize', STATUS_STYLES[req.status])}>
                                            {req.status === 'resolved' ? 'Approved' : req.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-slate-500">
                                        {format(new Date(req.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-5 py-3">
                                        {req.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setApproveTarget(req)}
                                                    className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectTarget(req)}
                                                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {req.status !== 'pending' && (
                                            <p className="text-right text-xs text-slate-400">
                                                {req.resolved_by ? `by ${req.resolved_by.name}` : '—'}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                                        No document requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Showing {requests.data.length} of {requests.total} entries
                        </p>
                        <div className="flex items-center gap-1">
                            {requests.links.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={cn(
                                        'flex h-7 min-w-7 items-center justify-center rounded px-2 text-xs',
                                        link.active ? 'bg-blue-600 font-medium text-white' : 'text-slate-500 hover:bg-slate-100',
                                        !link.url && 'pointer-events-none opacity-40',
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
