import { useEffect } from 'react';
import { addYears, format } from 'date-fns';
import { Printer, Download, X } from 'lucide-react';

const DOC_LABELS = {
    barangay_clearance: 'Barangay Clearance',
    certificate_of_residency: 'Certificate of Residency',
    indigency_certificate: 'Indigency Certificate',
    business_permit: 'Business Permit',
};

/**
 * Read-only modal showing a certificate preview for a resolved document request.
 * Includes print scoping so that only the certificate panel is printed.
 *
 * @param {object} request - The resolved document request object.
 * @param {function} onClose - Callback invoked when the modal should close.
 */
export default function ViewCopyModal({ request, onClose }) {
    const requestId = `#REQ-${String(request.id).padStart(5, '0')}`;
    const docLabel = DOC_LABELS[request.document_type] ?? request.document_type;
    const residentName = request.resident?.full_name ?? '—';
    const residentAddress = request.resident?.address ?? '—';
    const barangayName = request.resident?.barangay?.name ?? 'Barangay';
    const processedBy = request.resolvedBy?.name ?? '—';
    const purpose = request.purpose ?? '—';

    const issueDate = request.resolved_at
        ? new Date(request.resolved_at)
        : new Date();
    const issueDateFormatted = format(issueDate, 'MMMM d, yyyy');
    const expiryDateFormatted = format(addYears(issueDate, 1), 'MMMM d, yyyy');

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

    function handlePrint() {
        window.print();
    }

    function handleDownload() {
        window.alert('PDF download coming soon');
    }

    return (
        <>
            {/* Print scoping: show only the certificate panel when printing */}
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #certificate-preview { display: block !important; }
                }
            `}</style>

            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                onClick={handleBackdropClick}
            >
                <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Certificate of {docLabel}
                                </h2>
                                <p className="mt-0.5 font-mono text-xs text-slate-400">
                                    {requestId}
                                </p>
                            </div>
                            <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700">
                                Resolved
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

                    {/* Body — two-panel layout */}
                    <div className="flex gap-0 divide-x divide-slate-100">
                        {/* Left panel: Document Preview */}
                        <div className="flex-1 p-6">
                            <p className="mb-3 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                Document Preview
                            </p>

                            {/* Certificate letterhead */}
                            <div
                                id="certificate-preview"
                                className="rounded-lg border border-slate-200 bg-white p-6 text-slate-800"
                                style={{ fontFamily: 'serif' }}
                            >
                                {/* Header block */}
                                <div className="mb-4 text-center">
                                    <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                                        Republic of the Philippines
                                    </p>
                                    <p className="mt-1 text-lg font-bold tracking-wide text-slate-900 uppercase">
                                        {barangayName}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {residentAddress}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Office of the Barangay Captain
                                    </p>
                                </div>

                                <hr className="my-4 border-slate-300" />

                                {/* Title */}
                                <div className="mb-6 text-center">
                                    <p className="text-base font-bold tracking-widest text-slate-900 uppercase">
                                        {docLabel}
                                    </p>
                                </div>

                                {/* Body text */}
                                <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                                    <p>
                                        This is to certify that{' '}
                                        <strong className="text-slate-900">
                                            {residentName}
                                        </strong>
                                        , a bonafide resident of this barangay,
                                        has requested this{' '}
                                        <strong>{docLabel}</strong> for the
                                        purpose of{' '}
                                        <strong className="text-slate-900">
                                            {purpose}
                                        </strong>
                                        .
                                    </p>
                                    <p>
                                        This certification is issued upon the
                                        request of the above-named individual
                                        for whatever legal purpose it may serve.
                                    </p>
                                </div>

                                {/* Issue date */}
                                <div className="mt-5 text-sm text-slate-700">
                                    <p>
                                        Issued on:{' '}
                                        <strong>{issueDateFormatted}</strong>
                                    </p>
                                </div>

                                <hr className="my-6 border-slate-200" />

                                {/* Signature line */}
                                <div className="mt-4 text-center text-xs text-slate-500">
                                    <div className="mb-1 inline-block border-t border-slate-400 px-8 pt-1">
                                        Authorized by: Barangay Admin
                                    </div>
                                </div>

                                {/* Reference */}
                                <div className="mt-4 text-center">
                                    <p className="font-mono text-xs text-slate-400">
                                        Ref: {requestId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right panel: Info + Actions */}
                        <div className="w-72 shrink-0 p-6">
                            {/* Metadata */}
                            <div className="mb-6">
                                <p className="mb-3 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                    Certificate Details
                                </p>
                                <dl className="space-y-3 text-sm">
                                    <div>
                                        <dt className="text-xs text-slate-400">
                                            Resident Name
                                        </dt>
                                        <dd className="mt-0.5 font-medium text-slate-900">
                                            {residentName}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-400">
                                            Issue Date
                                        </dt>
                                        <dd className="mt-0.5 text-slate-700">
                                            {issueDateFormatted}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-400">
                                            Expiry Date
                                        </dt>
                                        <dd className="mt-0.5 text-slate-700">
                                            {expiryDateFormatted}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-400">
                                            Processed By
                                        </dt>
                                        <dd className="mt-0.5 text-slate-700">
                                            {processedBy}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-400">
                                            Purpose
                                        </dt>
                                        <dd className="mt-0.5 text-slate-700">
                                            {purpose}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Document Actions */}
                            <div>
                                <p className="mb-3 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                    Document Actions
                                </p>
                                <div className="space-y-2">
                                    <button
                                        onClick={handlePrint}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print Certificate
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
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
        </>
    );
}
