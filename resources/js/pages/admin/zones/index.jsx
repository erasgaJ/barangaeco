import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import zoneRoutes from '@/routes/admin/zones';

function CreateZoneModal({ onClose }) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        is_active: true,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        function handler(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    function set(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: null }));
    }

    function submit() {
        setLoading(true);
        router.post(zoneRoutes.store().url, form, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: (e) => {
                setErrors(e);
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">
                        Create Zone
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="e.g. Zone 1"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={3}
                            placeholder="Optional description..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="create-is-active"
                            checked={form.is_active}
                            onChange={(e) => set('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <label
                            htmlFor="create-is-active"
                            className="text-sm text-slate-700"
                        >
                            Active
                        </label>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading || !form.name.trim()}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                        {loading ? 'Creating…' : 'Create Zone'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditZoneModal({ zone, onClose }) {
    const [form, setForm] = useState({
        name: zone.name ?? '',
        description: zone.description ?? '',
        is_active: zone.is_active ?? true,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm({
            name: zone.name ?? '',
            description: zone.description ?? '',
            is_active: zone.is_active ?? true,
        });
        setErrors({});

        function handler(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [zone, onClose]);

    function set(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: null }));
    }

    function submit() {
        setLoading(true);
        router.put(zoneRoutes.update(zone.id).url, form, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: (e) => {
                setErrors(e);
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">
                        Edit Zone
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="e.g. Zone 1"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={3}
                            placeholder="Optional description..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="edit-is-active"
                            checked={form.is_active}
                            onChange={(e) => set('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <label
                            htmlFor="edit-is-active"
                            className="text-sm text-slate-700"
                        >
                            Active
                        </label>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading || !form.name.trim()}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                        {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteZoneModal({ zone, onClose }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function handler(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    function handleDelete() {
        setLoading(true);
        router.delete(zoneRoutes.destroy(zone.id).url, {
            preserveScroll: true,
            onFinish: onClose,
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-7 w-7 text-red-600" />
                </div>
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                    Delete Zone
                </h2>
                <p className="mb-5 text-sm text-slate-500">
                    Are you sure you want to delete{' '}
                    <strong className="text-slate-700">{zone.name}</strong>? Any
                    linked complaints or schedules will have their zone cleared.
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ZonesIndex({ zones, flash }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    return (
        <>
            <Head title="Zones" />
            {showCreate && (
                <CreateZoneModal onClose={() => setShowCreate(false)} />
            )}
            {editTarget && (
                <EditZoneModal
                    zone={editTarget}
                    onClose={() => setEditTarget(null)}
                />
            )}
            {deleteTarget && (
                <DeleteZoneModal
                    zone={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />
            )}

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Zone Management
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Manage zones for organising complaints and waste
                            collection schedules.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        <Plus className="h-4 w-4" />
                        Create Zone
                    </button>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-medium tracking-wide text-slate-400 uppercase">
                                <th className="px-5 py-3 text-left">Name</th>
                                <th className="px-5 py-3 text-left">
                                    Description
                                </th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.map((zone) => (
                                <tr
                                    key={zone.id}
                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                                >
                                    <td className="px-5 py-3 font-medium text-slate-900">
                                        {zone.name}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">
                                        {zone.description ?? (
                                            <span className="text-slate-300">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        {zone.is_active ? (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    setEditTarget(zone)
                                                }
                                                className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteTarget(zone)
                                                }
                                                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {zones.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-10 text-center text-slate-400"
                                    >
                                        No zones found. Create your first zone.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
