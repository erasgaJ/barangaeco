import { useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

const DOC_LABELS = {
    barangay_clearance: 'Barangay Clearance',
    certificate_of_residency: 'Certificate of Residency',
    indigency_certificate: 'Indigency Certificate',
    business_permit: 'Business Permit',
};

/**
 * Read-only modal showing rejection feedback for a rejected document request.
 *
 * @param {object} request - The rejected document request object.
 * @param {function} onClose - Callback invoked when the modal should close.
 */
export default function ViewReasonModal({ request, onClose }) {
    const requestId = `#REQ-${String(request.id).padStart(5, '0')}`;

    useEffect(() => {
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                {requestId}
                            </h2>
                        </div>
                        <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-medium text-red-700">
                            Rejected
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-5 px-6 py-5">
                    {/* Rejection Feedback */}
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            Rejection Feedback
                        </p>
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-slate-700">
                            {request.rejection_feedback}
                        </div>
                    </div>

                    {/* Applicant Info */}
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            Applicant Info
                        </p>
                        <dl className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <dt className="w-20 shrink-0 text-xs text-slate-400">
                                    Name
                                </dt>
                                <dd className="font-medium text-slate-900">
                                    {request.resident?.full_name ?? '—'}
                                </dd>
                            </div>
                            <div className="flex items-start gap-2">
                                <dt className="w-20 shrink-0 text-xs text-slate-400">
                                    Address
                                </dt>
                                <dd className="text-slate-700">
                                    {request.resident?.address ?? '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Certificate Details */}
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            Certificate Details
                        </p>
                        <dl className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <dt className="w-28 shrink-0 text-xs text-slate-400">
                                    Document Type
                                </dt>
                                <dd className="text-slate-700">
                                    {DOC_LABELS[request.document_type] ??
                                        request.document_type}
                                </dd>
                            </div>
                            <div className="flex items-start gap-2">
                                <dt className="w-28 shrink-0 text-xs text-slate-400">
                                    Purpose
                                </dt>
                                <dd className="text-slate-700">
                                    {request.purpose ?? '—'}
                                </dd>
                            </div>
                            <div className="flex items-start gap-2">
                                <dt className="w-28 shrink-0 text-xs text-slate-400">
                                    Rejection ID
                                </dt>
                                <dd className="font-mono text-slate-700">
                                    {requestId}
                                </dd>
                            </div>
                            <div className="flex items-start gap-2">
                                <dt className="w-28 shrink-0 text-xs text-slate-400">
                                    Date
                                </dt>
                                <dd className="text-slate-700">
                                    {request.created_at
                                        ? format(
                                              new Date(request.created_at),
                                              'MMM d, yyyy',
                                          )
                                        : '—'}
                                </dd>
                            </div>
                            <div className="flex items-start gap-2">
                                <dt className="w-28 shrink-0 text-xs text-slate-400">
                                    Status
                                </dt>
                                <dd>
                                    <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-medium text-red-700">
                                        Rejected
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Submitted Attachments */}
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                            Submitted Attachments
                        </p>
                        <p className="text-sm text-slate-400">
                            No attachments submitted.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
