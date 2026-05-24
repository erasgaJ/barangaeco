import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import documentRequestRoutes from '@/routes/admin/document-requests';

/**
 * Modal for collecting a rejection reason before rejecting a document request.
 *
 * @param {object} request - The document request object.
 * @param {function} onClose - Callback invoked when the modal should close.
 */
export default function RejectModal({ request, onClose }) {
    const [feedback, setFeedback] = useState('');

    const requestId = `#REQ-${String(request.id).padStart(5, '0')}`;
    const isValid = feedback.trim().length >= 10;

    useEffect(() => {
        setFeedback('');

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

    function handleSubmit() {
        if (!isValid) {
            return;
        }

        router.post(
            documentRequestRoutes.reject(request.id).url,
            { rejection_feedback: feedback },
            { onSuccess: onClose },
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Reject Request
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

                {/* Body */}
                <div className="px-6 py-5">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Reason for Rejection{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        placeholder="Explain why this request is being rejected..."
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        Minimum 10 characters
                        {feedback.length > 0 && (
                            <span
                                className={
                                    isValid
                                        ? 'ml-1 text-green-600'
                                        : 'ml-1 text-red-400'
                                }
                            >
                                ({feedback.trim().length} entered)
                            </span>
                        )}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Submit Rejection
                    </button>
                </div>
            </div>
        </div>
    );
}
