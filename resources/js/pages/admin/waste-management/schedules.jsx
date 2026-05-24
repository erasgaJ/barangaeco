import { Head } from '@inertiajs/react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { CheckCircle2, Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const SCHEDULE_COLORS = [
    'bg-green-200 text-green-800',
    'bg-blue-200 text-blue-800',
    'bg-rose-200 text-rose-800',
    'bg-purple-200 text-purple-800',
    'bg-amber-200 text-amber-800',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function colorFor(barangayId) {
    return SCHEDULE_COLORS[barangayId % SCHEDULE_COLORS.length];
}

export default function SchedulesPage({
    schedules,
    today_schedules,
    collectors,
}) {
    const [activeTab, setActiveTab] = useState('schedule');
    const [weekStart, setWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 }),
    );

    const weekDays = DAYS.map((_, i) => addDays(weekStart, i));

    function schedulesForDay(day) {
        return schedules.data.filter((s) =>
            isSameDay(new Date(s.scheduled_date), day),
        );
    }

    return (
        <>
            <Head title="Waste Management" />
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
                    <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
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
                            <div className="grid grid-cols-7 gap-1">
                                {weekDays.map((day, i) => {
                                    const isToday = isSameDay(day, new Date());
                                    const daySchedules = schedulesForDay(day);
                                    return (
                                        <div key={i} className="min-h-[100px]">
                                            <div className="mb-1 pb-1 text-center text-sm">
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium',
                                                        isToday
                                                            ? 'text-blue-600'
                                                            : 'text-slate-500',
                                                    )}
                                                >
                                                    {DAYS[i]}
                                                </span>
                                                <div
                                                    className={cn(
                                                        'mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs',
                                                        isToday
                                                            ? 'bg-blue-600 font-bold text-white'
                                                            : 'text-slate-700',
                                                    )}
                                                >
                                                    {format(day, 'd')}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {daySchedules.map((s) => (
                                                    <div
                                                        key={s.id}
                                                        className={cn(
                                                            'cursor-pointer rounded px-1.5 py-1 text-xs leading-tight',
                                                            colorFor(
                                                                s.barangay.id,
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
                            <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
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
                                                    <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
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
