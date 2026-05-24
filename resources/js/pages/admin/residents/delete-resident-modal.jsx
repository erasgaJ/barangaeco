import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import residents from '@/routes/admin/residents';

const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-teal-500',
];

function getInitials(name) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function getAvatarColor(name) {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function formatResidentId(resident) {
    const year = new Date(resident.created_at).getFullYear();
    return `RES-${year}-${String(resident.id).padStart(4, '0')}`;
}

export default function DeleteResidentModal({ resident, onClose }) {
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

    function handleDelete() {
        setProcessing(true);
        router.delete(residents.destroy(resident).url, {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    }

    const residentId = formatResidentId(resident);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                        <AlertTriangle className="h-7 w-7 text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Delete Resident Record
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Are you sure you want to delete this resident record?
                        This action cannot be undone.
                    </p>
                </div>

                <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    {resident.photo_url ? (
                        <img
                            src={resident.photo_url}
                            alt={resident.full_name}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                    ) : (
                        <div
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                                getAvatarColor(resident.full_name),
                            )}
                        >
                            {getInitials(resident.full_name)}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {resident.full_name}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                            {residentId}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                        CANCEL
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={processing}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {processing ? 'Deleting…' : 'DELETE RECORD'}
                    </button>
                </div>
            </div>
        </div>
    );
}
