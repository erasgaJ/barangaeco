import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, MessageCircleWarning } from 'lucide-react';
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
import complaints from '@/routes/resident/complaints';

const COMPLAINT_TYPE_OPTIONS = [
    'Noise',
    'Road',
    'Environment',
    'Infrastructure',
    'Other',
];

const STATUS_CONFIG = {
    open: {
        label: 'Open',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    in_progress: {
        label: 'In Progress',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    resolved: {
        label: 'Resolved',
        className: 'bg-green-100 text-green-700 border-green-200',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
};

const PRIORITY_CONFIG = {
    low: {
        label: 'Low',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    medium: {
        label: 'Medium',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    high: {
        label: 'High',
        className: 'bg-red-100 text-red-700 border-red-200',
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

function PriorityBadge({ priority }) {
    const config = PRIORITY_CONFIG[priority] ?? {
        label: priority,
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

export default function ResidentComplaintsIndex({
    complaints: complaintsData,
    zones,
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        zone_id: '',
        complaint_type: '',
        complaint_against: '',
        description: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(complaints.store.url(), {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    }

    function handleCancel(complaint) {
        if (!confirm('Are you sure you want to cancel this complaint?')) {
            return;
        }
        router.delete(complaints.cancel.url(complaint.id));
    }

    return (
        <>
            <Head title="My Complaints" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            My Complaints
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            File and track your complaints with the barangay.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        File Complaint
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {complaintsData.data.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center">
                            <MessageCircleWarning className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                No complaints filed yet
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                Click "File Complaint" to report an issue.
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
                                        Description
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                        Priority
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
                                {complaintsData.data.map((complaint) => (
                                    <tr
                                        key={complaint.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {complaint.complaint_type}
                                        </td>
                                        <td className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-300">
                                            <span
                                                title={complaint.description}
                                                className="line-clamp-2"
                                            >
                                                {complaint.description}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={complaint.status}
                                            />
                                        </td>
                                        <td className="px-5 py-4">
                                            <PriorityBadge
                                                priority={complaint.priority}
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                                            {formatDate(complaint.created_at)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {complaint.status === 'open' && (
                                                <button
                                                    onClick={() =>
                                                        handleCancel(complaint)
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
                    {complaintsData.links &&
                        complaintsData.links.length > 3 && (
                            <div className="flex items-center gap-1 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                                {complaintsData.links.map((link, index) => (
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

            {/* File Complaint Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>File a Complaint</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Zone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="zone_id">Zone (optional)</Label>
                            <Select
                                value={data.zone_id}
                                onValueChange={(value) =>
                                    setData(
                                        'zone_id',
                                        value === 'none' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger id="zone_id" className="w-full">
                                    <SelectValue placeholder="No specific zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No specific zone
                                    </SelectItem>
                                    {zones.map((zone) => (
                                        <SelectItem
                                            key={zone.id}
                                            value={String(zone.id)}
                                        >
                                            {zone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.zone_id && (
                                <p className="text-xs text-red-600">
                                    {errors.zone_id}
                                </p>
                            )}
                        </div>

                        {/* Complaint Type */}
                        <div className="space-y-1.5">
                            <Label htmlFor="complaint_type">
                                Complaint Type
                            </Label>
                            <Select
                                value={data.complaint_type}
                                onValueChange={(value) =>
                                    setData('complaint_type', value)
                                }
                            >
                                <SelectTrigger
                                    id="complaint_type"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select complaint type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMPLAINT_TYPE_OPTIONS.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.complaint_type && (
                                <p className="text-xs text-red-600">
                                    {errors.complaint_type}
                                </p>
                            )}
                        </div>

                        {/* Complaint Against */}
                        <div className="space-y-1.5">
                            <Label htmlFor="complaint_against">
                                Complaint Against (optional)
                            </Label>
                            <Input
                                id="complaint_against"
                                value={data.complaint_against}
                                onChange={(e) =>
                                    setData('complaint_against', e.target.value)
                                }
                                placeholder="e.g. Neighbor, Street vendor"
                            />
                            {errors.complaint_against && (
                                <p className="text-xs text-red-600">
                                    {errors.complaint_against}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Describe the issue in detail"
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && (
                                <p className="text-xs text-red-600">
                                    {errors.description}
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
                                {processing ? 'Filing...' : 'File Complaint'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ResidentComplaintsIndex.layout = (page) => (
    <ResidentLayout>{page}</ResidentLayout>
);
