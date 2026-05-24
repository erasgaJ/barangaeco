import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as schedulesRoutes from '@/routes/admin/waste/schedules';

function formatScheduleLabel(schedule) {
    const barangayName = schedule.barangay?.name ?? 'Unknown Barangay';
    const dateStr = schedule.scheduled_date
        ? schedule.scheduled_date.substring(0, 10)
        : '';
    const timeStr = schedule.scheduled_time
        ? schedule.scheduled_time.substring(0, 5)
        : '';

    if (!dateStr) {
        return barangayName;
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    if (!timeStr) {
        return `${barangayName} — ${formattedDate}`;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const formattedTime = `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

    return `${barangayName} — ${formattedDate} at ${formattedTime}`;
}

/**
 * Confirmation modal for deleting a waste collection schedule.
 *
 * @param {object} schedule - The schedule to delete.
 * @param {function} onClose - Dismisses the confirmation and returns to the Edit modal.
 * @param {function} onDeleted - Closes all modals after successful deletion.
 */
export default function DeleteScheduleModal({ schedule, onClose, onDeleted }) {
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleDelete() {
        setProcessing(true);
        router.delete(schedulesRoutes.destroy(schedule).url, {
            onSuccess: onDeleted,
            onFinish: () => setProcessing(false),
        });
    }

    const scheduleLabel = formatScheduleLabel(schedule);

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
            onMouseDown={handleBackdropClick}
        >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                        <Trash2 className="h-7 w-7 text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Delete Schedule?
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Are you sure you want to delete the collection schedule
                        for{' '}
                        <span className="font-medium text-slate-700">
                            {scheduleLabel}
                        </span>
                        ? This action cannot be undone and will notify assigned
                        collectors.
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                        Keep Schedule
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={processing}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {processing ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
