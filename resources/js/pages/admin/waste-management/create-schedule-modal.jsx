import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import CollectorMultiSelect from '@/components/collector-multi-select';
import schedulesRoutes from '@/routes/admin/waste/schedules';

const EMPTY_FORM = {
    zone_id: '',
    scheduled_date: '',
    scheduled_time: '',
    collector_ids: [],
    status: 'draft',
};

export default function CreateScheduleModal({ zones, collectors, onClose }) {
    const { errors } = usePage().props;
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        setForm(EMPTY_FORM);

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        router.post(
            schedulesRoutes.store().url,
            {
                zone_id: form.zone_id,
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
                <h2 className="mb-5 text-base font-semibold text-slate-900">
                    Create Collection Schedule
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Zone */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Zone
                        </label>
                        <select
                            value={form.zone_id}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    zone_id: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Select zone…</option>
                            {zones.map((z) => (
                                <option key={z.id} value={z.id}>
                                    {z.name}
                                </option>
                            ))}
                        </select>
                        {errors.zone_id && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.zone_id}
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
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-2 flex justify-end gap-2">
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
                            Create Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
