import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import ResidentLayout from '@/layouts/resident-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import documentRequests from '@/routes/resident/document-requests';

const DOCUMENT_TYPE_LABELS = {
    barangay_clearance: 'Barangay Clearance',
    certificate_of_residency: 'Certificate of Residency',
    indigency_certificate: 'Indigency Certificate',
    business_permit: 'Business Permit',
    good_moral_certificate: 'Good Moral Certificate',
};

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    resolved: {
        label: 'Resolved',
        className: 'bg-green-100 text-green-700 border-green-200',
    },
    approved: {
        label: 'Approved',
        className: 'bg-green-100 text-green-700 border-green-200',
    },
    rejected: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-700 border-red-200',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
};

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] ?? {
        label: status,
        className: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ResidentDocumentRequestsIndex({ requests }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        document_type: '',
        purpose: '',
        reason: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(documentRequests.store.url(), {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    }

    function handleCancel(documentRequest) {
        if (!confirm('Are you sure you want to cancel this request?')) {
            return;
        }
        router.delete(documentRequests.cancel.url(documentRequest.id));
    }

    return (
        <>
            <Head title="Document Requests" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Document Requests
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Submit and track your barangay document requests.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Request
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {requests.data.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center">
                            <FileText className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                No document requests yet
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                Click "New Request" to submit your first
                                request.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Type
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Purpose
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Date
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {requests.data.map((request) => (
                                    <tr
                                        key={request.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {DOCUMENT_TYPE_LABELS[
                                                request.document_type
                                            ] ?? request.document_type}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                            {request.purpose}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={request.status}
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                                            {formatDate(request.created_at)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {request.status === 'pending' && (
                                                <button
                                                    onClick={() =>
                                                        handleCancel(request)
                                                    }
                                                    className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {requests.links && requests.links.length > 3 && (
                        <div className="flex items-center gap-1 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                            {requests.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-green-600 text-white'
                                            : link.url
                                              ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                              : 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* New Request Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Document Request</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Document Type */}
                        <div className="space-y-1.5">
                            <Label htmlFor="document_type">Document Type</Label>
                            <Select
                                value={data.document_type}
                                onValueChange={(value) =>
                                    setData('document_type', value)
                                }
                            >
                                <SelectTrigger
                                    id="document_type"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(DOCUMENT_TYPE_LABELS).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.document_type && (
                                <p className="text-xs text-red-600">
                                    {errors.document_type}
                                </p>
                            )}
                        </div>

                        {/* Purpose */}
                        <div className="space-y-1.5">
                            <Label htmlFor="purpose">Purpose</Label>
                            <Input
                                id="purpose"
                                value={data.purpose}
                                onChange={(e) =>
                                    setData('purpose', e.target.value)
                                }
                                placeholder="e.g. Employment, Scholarship"
                            />
                            {errors.purpose && (
                                <p className="text-xs text-red-600">
                                    {errors.purpose}
                                </p>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="space-y-1.5">
                            <Label htmlFor="reason">Reason</Label>
                            <textarea
                                id="reason"
                                rows={3}
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                placeholder="Briefly describe why you need this document"
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.reason && (
                                <p className="text-xs text-red-600">
                                    {errors.reason}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {processing
                                    ? 'Submitting...'
                                    : 'Submit Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ResidentDocumentRequestsIndex.layout = (page) => (
    <ResidentLayout>{page}</ResidentLayout>
);
