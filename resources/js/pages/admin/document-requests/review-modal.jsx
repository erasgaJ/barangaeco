import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import documentRequestRoutes from '@/routes/admin/document-requests';

const DOC_LABELS = {
    barangay_clearance: 'Barangay Clearance',
    certificate_of_residency: 'Certificate of Residency',
    indigency_certificate: 'Indigency Certificate',
    business_permit: 'Business Permit',
};

/**
 * Two-column review modal for pending document requests.
 *
 * @param {object} request - The document request object.
 * @param {function} onClose - Callback invoked when the modal should close.
 * @param {function} onReject - Callback invoked when "Reject Request" is clicked.
 */
export default function ReviewModal({ request, onClose, onReject }) {
    const [adminRemarks, setAdminRemarks] = useState('');

    const requestId = `#REQ-${String(request.id).padStart(5, '0')}`;
    const attachments = Array.isArray(request.attachments)
        ? request.attachments
        : [];
    const firstAttachment = attachments.length > 0 ? attachments[0] : null;

    useEffect(() => {
        setAdminRemarks('');

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [request.id, onClose]);

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleApprove() {
        router.post(
            documentRequestRoutes.approve(request.id).url,
            { admin_remarks: adminRemarks },
            { onSuccess: onClose },
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Review Certificate Request
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">
                            {requestId}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Two-column body */}
                <div className="grid grid-cols-2 divide-x divide-slate-100 px-0">
                    {/* Left column — Request Details */}
                    <div className="px-6 py-5">
                        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            Request Details
                        </p>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs text-slate-400">
                                    Applicant Name
                                </dt>
                                <dd className="mt-0.5 font-medium text-slate-900">
                                    {request.resident?.full_name ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-400">
                                    Address
                                </dt>
                                <dd className="mt-0.5 text-slate-700">
                                    {request.resident?.address ??
                                        request.resident?.barangay?.name ??
                                        '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-400">
                                    Purpose
                                </dt>
                                <dd className="mt-0.5 text-slate-700">
                                    {request.purpose ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-400">
                                    Document Type
                                </dt>
                                <dd className="mt-0.5 text-slate-700">
                                    {DOC_LABELS[request.document_type] ??
                                        request.document_type}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-400">
                                    Date Submitted
                                </dt>
                                <dd className="mt-0.5 text-slate-700">
                                    {request.created_at
                                        ? format(
                                              new Date(request.created_at),
                                              'MMM d, yyyy',
                                          )
                                        : '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Right column — Submitted Document */}
                    <div className="px-6 py-5">
                        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            Submitted Document
                        </p>

                        {firstAttachment ? (
                            <img
                                src={'/storage/' + firstAttachment}
                                alt="Submitted attachment"
                                className="mb-3 max-h-40 rounded object-contain"
                            />
                        ) : (
                            <div className="mb-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                                No attachment uploaded
                            </div>
                        )}

                        {firstAttachment && (
                            <a
                                href={'/storage/' + firstAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mb-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                                View Receipt ↗
                            </a>
                        )}

                        <p className="mb-3 text-xs text-slate-500">
                            Paid - PHP 50.00
                        </p>

                        <div>
                            <p className="mb-1 text-xs text-slate-400">Notes</p>
                            <p className="text-sm text-slate-700">
                                {request.notes ||
                                    request.reason ||
                                    'No notes provided.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admin Remarks */}
                <div className="border-t border-slate-100 px-6 py-4">
                    <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Admin Remarks (Optional)
                    </label>
                    <textarea
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                        rows={3}
                        placeholder="Add any internal notes before approving..."
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onReject}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        Reject Request
                    </button>
                    <button
                        onClick={handleApprove}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Approve &amp; Issue
                    </button>
                </div>
            </div>
        </div>
    );
}
