import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import CollectorMultiSelect from '@/components/collector-multi-select';
import schedulesRoutes from '@/routes/admin/waste/schedules';

/**
 * Modal for editing an existing waste collection schedule.
 *
 * @param {object} schedule - The schedule object to edit.
 * @param {object[]} barangays - Available barangays from the Inertia page props.
 * @param {object[]} collectors - All available collectors from the Inertia page props.
 * @param {function} onClose - Callback invoked when the modal should close.
 * @param {function} onDeleteRequest - Callback invoked with the schedule when the delete link is clicked.
 */
export default function EditScheduleModal({
    schedule,
    barangays,
    collectors,
    onClose,
    onDeleteRequest,
}) {
    const { errors } = usePage().props;
    const [form, setForm] = useState(() => buildForm(schedule));

    useEffect(() => {
        setForm(buildForm(schedule));

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [schedule.id, onClose]);

    function buildForm(s) {
        return {
            barangay_id: s.barangay_id ?? '',
            scheduled_date: s.scheduled_date
                ? s.scheduled_date.substring(0, 10)
                : '',
            scheduled_time: s.scheduled_time
                ? s.scheduled_time.substring(0, 5)
                : '',
            collector_ids: s.collectors ? s.collectors.map((c) => c.id) : [],
            status: s.status ?? 'draft',
        };
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        router.put(
            schedulesRoutes.update(schedule).url,
            {
                barangay_id: form.barangay_id,
                scheduled_date: form.scheduled_date,
                scheduled_time: form.scheduled_time,
                collector_ids: form.collector_ids,
                status: form.status,
            },
            {
                preserveScroll: true,
                onSuccess: onClose,
            },
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-base font-semibold text-slate-900">
                    Edit Collection Schedule
                </h2>
                <p className="mt-0.5 mb-5 text-sm text-slate-500">
                    {schedule.barangay?.name ?? ''}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Barangay */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Barangay
                        </label>
                        <select
                            value={form.barangay_id}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    barangay_id: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Select barangay…</option>
                            {barangays.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        {errors.barangay_id && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.barangay_id}
                            </p>
                        )}
                    </div>

                    {/* Scheduled Date */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Scheduled Date
                        </label>
                        <input
                            type="date"
                            value={form.scheduled_date}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    scheduled_date: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.scheduled_date && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.scheduled_date}
                            </p>
                        )}
                    </div>

                    {/* Scheduled Time */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Start Time
                        </label>
                        <input
                            type="time"
                            value={form.scheduled_time}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    scheduled_time: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.scheduled_time && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.scheduled_time}
                            </p>
                        )}
                    </div>

                    {/* Collector Multi-Select */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Assign Collectors
                        </label>
                        <CollectorMultiSelect
                            collectors={collectors}
                            value={form.collector_ids}
                            onChange={(ids) =>
                                setForm((f) => ({ ...f, collector_ids: ids }))
                            }
                            error={errors.collector_ids}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Status
                        </label>
                        <select
                            value={form.status}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    status: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => onDeleteRequest(schedule)}
                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Schedule
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
