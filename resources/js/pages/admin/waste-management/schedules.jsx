import { Head, router } from '@inertiajs/react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { CheckCircle2, Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import collectorsRoutes from '@/routes/admin/waste/collectors';
import CreateScheduleModal from './create-schedule-modal';

const SCHEDULE_COLORS = [
    'bg-green-200 text-green-800',
    'bg-blue-200 text-blue-800',
    'bg-rose-200 text-rose-800',
    'bg-purple-200 text-purple-800',
    'bg-amber-200 text-amber-800',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_FORM = { fullName: '', contactNumber: '', email: '' };

function AddCollectorModal({ onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm(EMPTY_FORM);
        setErrors({});

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

    function handleSubmit() {
        router.post(
            collectorsRoutes.store.url(),
            {
                name: form.fullName,
                full_name: form.fullName,
                email: form.email,
                contact_number: form.contactNumber,
            },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onError: setErrors,
            },
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-5 text-base font-semibold text-slate-900">
                    Add New Collector
                </h2>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Juan Dela Cruz"
                            value={form.fullName}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    fullName: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.full_name && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.full_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            placeholder="09XX XXX XXXX"
                            value={form.contactNumber}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    contactNumber: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.contact_number && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.contact_number}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="e.g. juan@example.com"
                            value={form.email}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    email: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Save Collector
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditCollectorModal({ collector, onClose }) {
    const [form, setForm] = useState({
        fullName: collector.full_name,
        contactNumber: collector.contact_number,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm({
            fullName: collector.full_name,
            contactNumber: collector.contact_number,
        });
        setErrors({});

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [collector, onClose]);

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleSubmit() {
        router.put(
            collectorsRoutes.update.url(collector),
            {
                full_name: form.fullName,
                contact_number: form.contactNumber,
            },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onError: setErrors,
            },
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-5 text-base font-semibold text-slate-900">
                    Edit Collector
                </h2>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Juan Dela Cruz"
                            value={form.fullName}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    fullName: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.full_name && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.full_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            placeholder="+63 912 345 6789"
                            value={form.contactNumber}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    contactNumber: e.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.contact_number && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.contact_number}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={collector.user?.email ?? ''}
                            disabled
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 outline-none"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteCollectorModal({ collector, onClose }) {
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
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

    function handleDelete() {
        setProcessing(true);
        router.delete(collectorsRoutes.destroy.url(collector), {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-base font-bold text-slate-900">
                    Delete Collector?
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                    This action cannot be undone.
                </p>

                <div className="mt-4 border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-700">
                    Are you sure you want to delete this collector? All
                    associated records and schedules will be permanently removed
                    from the system.
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={processing}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {processing ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function colorFor(barangayId) {
    return SCHEDULE_COLORS[barangayId % SCHEDULE_COLORS.length];
}

export default function SchedulesPage({
    schedules,
    today_schedules,
    barangays,
    collectors,
}) {
    const [activeTab, setActiveTab] = useState('schedule');
    const [weekStart, setWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 }),
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCreateScheduleModal, setShowCreateScheduleModal] =
        useState(false);
    const [editingCollector, setEditingCollector] = useState(null);
    const [deletingCollector, setDeletingCollector] = useState(null);

    const weekDays = DAYS.map((_, i) => addDays(weekStart, i));

    function schedulesForDay(day) {
        return schedules.data.filter((s) =>
            isSameDay(new Date(s.scheduled_date), day),
        );
    }

    return (
        <>
            <Head title="Waste Management" />
            {showCreateScheduleModal && (
                <CreateScheduleModal
                    barangays={barangays}
                    collectors={collectors}
                    onClose={() => setShowCreateScheduleModal(false)}
                />
            )}
            {showAddModal && (
                <AddCollectorModal onClose={() => setShowAddModal(false)} />
            )}
            {editingCollector && (
                <EditCollectorModal
                    collector={editingCollector}
                    onClose={() => setEditingCollector(null)}
                />
            )}
            {deletingCollector && (
                <DeleteCollectorModal
                    collector={deletingCollector}
                    onClose={() => setDeletingCollector(null)}
                />
            )}
            <div className="p-6">
                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Waste Management
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Manage collection schedules and monitor active
                            routes.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateScheduleModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        <Plus className="h-4 w-4" />
                        Create Schedule
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-5 flex border-b border-slate-200">
                    {['schedule', 'collectors'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'px-4 pb-3 text-sm font-medium capitalize transition-colors',
                                activeTab === tab
                                    ? 'border-b-2 border-blue-600 text-blue-700'
                                    : 'text-slate-500 hover:text-slate-700',
                            )}
                        >
                            {tab === 'schedule'
                                ? 'Collection Schedule'
                                : 'Collector Management'}
                        </button>
                    ))}
                </div>

                {activeTab === 'schedule' && (
                    <>
                        {/* Weekly Calendar */}
                        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-semibold text-slate-900">
                                        Weekly Schedule
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {format(weekStart, 'MMM d')} –{' '}
                                        {format(
                                            addDays(weekStart, 6),
                                            'MMM d, yyyy',
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex rounded-lg border border-slate-200 text-sm">
                                        <button
                                            onClick={() =>
                                                setWeekStart((d) =>
                                                    addDays(d, -7),
                                                )
                                            }
                                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={() =>
                                                setWeekStart((d) =>
                                                    addDays(d, 7),
                                                )
                                            }
                                            className="border-l border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                                        >
                                            ›
                                        </button>
                                    </div>
                                    <div className="flex rounded-lg border border-slate-200 text-sm">
                                        <button className="rounded-l-lg bg-blue-600 px-3 py-1.5 font-medium text-white">
                                            Week
                                        </button>
                                        <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-50">
                                            Month
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar grid */}
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <div className="grid grid-cols-7 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50">
                                    {weekDays.map((day, i) => {
                                        const isToday = isSameDay(
                                            day,
                                            new Date(),
                                        );
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'px-2 py-2.5 text-center',
                                                    isToday && 'bg-blue-50',
                                                )}
                                            >
                                                <p
                                                    className={cn(
                                                        'text-xs font-medium tracking-wide uppercase',
                                                        isToday
                                                            ? 'text-blue-600'
                                                            : 'text-slate-400',
                                                    )}
                                                >
                                                    {DAYS[i]}
                                                </p>
                                                <div
                                                    className={cn(
                                                        'mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                                                        isToday
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-slate-700',
                                                    )}
                                                >
                                                    {format(day, 'd')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="grid grid-cols-7 divide-x divide-slate-100">
                                    {weekDays.map((day, i) => {
                                        const isToday = isSameDay(
                                            day,
                                            new Date(),
                                        );
                                        const daySchedules =
                                            schedulesForDay(day);
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'min-h-[140px] p-2',
                                                    isToday && 'bg-blue-50/30',
                                                )}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    {daySchedules.map((s) => (
                                                        <div
                                                            key={s.id}
                                                            className={cn(
                                                                'cursor-pointer rounded px-2 py-1 text-xs leading-tight font-medium',
                                                                colorFor(
                                                                    s.barangay
                                                                        .id,
                                                                ),
                                                            )}
                                                        >
                                                            {s.barangay.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Today's Routes */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900">
                                    Today's Routes
                                </h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                {today_schedules.map((schedule) => {
                                    const update = schedule.statusUpdates?.[0];
                                    const isInProgress =
                                        update?.status === 'in_progress';
                                    const isCompleted =
                                        update?.status === 'completed';
                                    return (
                                        <div
                                            key={schedule.id}
                                            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3"
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                                    isCompleted
                                                        ? 'bg-green-100'
                                                        : 'bg-blue-100',
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Truck className="h-4 w-4 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">
                                                    {schedule.barangay.name}{' '}
                                                    Route
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {schedule.collectors
                                                        .map((c) => c.full_name)
                                                        .join(', ')}
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    isCompleted
                                                        ? 'bg-slate-100 text-slate-500'
                                                        : isInProgress
                                                          ? 'bg-blue-100 text-blue-700'
                                                          : 'bg-slate-100 text-slate-500',
                                                )}
                                            >
                                                {isCompleted
                                                    ? 'COMPLETED'
                                                    : isInProgress
                                                      ? '● IN PROGRESS'
                                                      : 'PENDING'}
                                            </span>
                                            <p className="text-xs text-slate-400">
                                                Est. {schedule.scheduled_time}
                                            </p>
                                        </div>
                                    );
                                })}
                                {today_schedules.length === 0 && (
                                    <p className="py-6 text-center text-sm text-slate-400">
                                        No routes scheduled for today.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'collectors' && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {collectors.length} collector
                                {collectors.length !== 1 ? 's' : ''} registered
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                            >
                                <Plus className="h-4 w-4" />
                                Add Collector
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                        <th className="px-5 py-3 text-left">
                                            Full Name
                                        </th>
                                        <th className="px-5 py-3 text-left">
                                            Contact Number
                                        </th>
                                        <th className="px-5 py-3 text-left">
                                            Email Address
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {collectors.map((collector) => (
                                        <tr
                                            key={collector.id}
                                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                        >
                                            <td className="px-5 py-3 font-medium text-slate-900">
                                                {collector.full_name}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {collector.contact_number}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {collector.user?.email}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setEditingCollector(
                                                                collector,
                                                            )
                                                        }
                                                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeletingCollector(
                                                                collector,
                                                            )
                                                        }
                                                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {collectors.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-5 py-10 text-center text-slate-400"
                                            >
                                                No collectors found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
