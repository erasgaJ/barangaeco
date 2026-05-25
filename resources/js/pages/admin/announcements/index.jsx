import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import announcementRoutes from '@/routes/admin/announcements';

const AUDIENCE_STYLES = {
    all: 'bg-blue-100 text-blue-700',
    residents: 'bg-green-100 text-green-700',
    collectors: 'bg-purple-100 text-purple-700',
};

function CreateModal({ onClose }) {
    const [form, setForm] = useState({
        title: '',
        message: '',
        target_audience: 'all',
        scheduled_at: '',
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
        if (!form.title.trim() || !form.message.trim()) return;
        setLoading(true);
        router.post(
            announcementRoutes.store().url,
            { ...form, scheduled_at: form.scheduled_at || null },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onError: (e) => {
                    setErrors(e);
                    setLoading(false);
                },
                onFinish: () => setLoading(false),
            },
        );
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
                        New Announcement
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
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="Announcement title"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.message}
                            onChange={(e) => set('message', e.target.value)}
                            rows={4}
                            placeholder="Write your announcement..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Target Audience
                        </label>
                        <select
                            value={form.target_audience}
                            onChange={(e) =>
                                set('target_audience', e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                        >
                            <option value="all">Everyone</option>
                            <option value="residents">Residents only</option>
                            <option value="collectors">Collectors only</option>
                        </select>
                        {errors.target_audience && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.target_audience}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Schedule (optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={form.scheduled_at}
                            onChange={(e) =>
                                set('scheduled_at', e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                        />
                        {errors.scheduled_at && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.scheduled_at}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                            Leave empty to publish immediately.
                        </p>
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
                        disabled={
                            loading ||
                            !form.title.trim() ||
                            !form.message.trim()
                        }
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                        {loading
                            ? 'Publishing…'
                            : form.scheduled_at
                              ? 'Schedule'
                              : 'Publish Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditModal({ announcement, onClose }) {
    const [form, setForm] = useState({
        title: announcement.title ?? '',
        message: announcement.message ?? '',
        target_audience: announcement.target_audience ?? 'all',
        scheduled_at: announcement.scheduled_at
            ? format(new Date(announcement.scheduled_at), "yyyy-MM-dd'T'HH:mm")
            : '',
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

    function handleSubmit() {
        setLoading(true);
        router.put(
            announcementRoutes.update(announcement.id).url,
            { ...form, scheduled_at: form.scheduled_at || null },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onError: (e) => {
                    setErrors(e);
                    setLoading(false);
                },
                onFinish: () => setLoading(false),
            },
        );
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
                        Edit Announcement
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
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="Announcement title"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.message}
                            onChange={(e) => set('message', e.target.value)}
                            rows={4}
                            placeholder="Write your announcement..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Target Audience
                        </label>
                        <select
                            value={form.target_audience}
                            onChange={(e) =>
                                set('target_audience', e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                        >
                            <option value="all">Everyone</option>
                            <option value="residents">Residents only</option>
                            <option value="collectors">Collectors only</option>
                        </select>
                        {errors.target_audience && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.target_audience}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            Schedule (optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={form.scheduled_at}
                            onChange={(e) =>
                                set('scheduled_at', e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
                        />
                        {errors.scheduled_at && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.scheduled_at}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                            Leave empty to publish immediately.
                        </p>
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
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                        {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteModal({ announcement, onClose }) {
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
        router.delete(announcementRoutes.destroy(announcement.id).url, {
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
                className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-7 w-7 text-red-600" />
                </div>
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                    Delete Announcement
                </h2>
                <p className="mb-5 text-sm text-slate-500">
                    Are you sure you want to delete{' '}
                    <strong className="text-slate-700">
                        &ldquo;{announcement.title}&rdquo;
                    </strong>
                    ? This action cannot be undone.
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

export default function AnnouncementsIndex({ announcements }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    return (
        <>
            <Head title="Announcements" />
            {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
            {editTarget && (
                <EditModal
                    announcement={editTarget}
                    onClose={() => setEditTarget(null)}
                />
            )}
            {deleteTarget && (
                <DeleteModal
                    announcement={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />
            )}

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Announcements
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Publish and manage announcements for residents and
                            collectors.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        <Plus className="h-4 w-4" />
                        New Announcement
                    </button>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3">
                    {announcements.data.map((ann) => (
                        <div
                            key={ann.id}
                            className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                <Megaphone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900">
                                        {ann.title}
                                    </p>
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                            AUDIENCE_STYLES[
                                                ann.target_audience
                                            ],
                                        )}
                                    >
                                        {ann.target_audience === 'all'
                                            ? 'Everyone'
                                            : ann.target_audience}
                                    </span>
                                    {!ann.published_at && ann.scheduled_at && (
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                            Scheduled
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                    {ann.message}
                                </p>
                                <p className="mt-1.5 text-xs text-slate-400">
                                    {ann.published_at
                                        ? `Published ${format(new Date(ann.published_at), 'MMM d, yyyy')} by ${ann.created_by?.name ?? '—'}`
                                        : ann.scheduled_at
                                          ? `Scheduled for ${format(new Date(ann.scheduled_at), 'MMM d, yyyy h:mm a')}`
                                          : 'Draft'}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditTarget(ann)}
                                className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setDeleteTarget(ann)}
                                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {announcements.data.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-400">
                            No announcements yet. Publish your first one.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {announcements.total > announcements.per_page && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Showing {announcements.data.length} of{' '}
                            {announcements.total}
                        </p>
                        <div className="flex items-center gap-1">
                            {announcements.links.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={cn(
                                        'flex h-7 min-w-7 items-center justify-center rounded px-2 text-xs',
                                        link.active
                                            ? 'bg-blue-600 font-medium text-white'
                                            : 'text-slate-500 hover:bg-slate-100',
                                        !link.url &&
                                            'pointer-events-none opacity-40',
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
