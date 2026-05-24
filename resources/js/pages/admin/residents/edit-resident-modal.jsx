import { router } from '@inertiajs/react';
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

function Field({ label, error, children }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function EditResidentModal({ resident, barangays, onClose }) {
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [barangayId, setBarangayId] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setFullName(resident.full_name ?? '');
        setAddress(resident.address ?? '');
        setBarangayId(String(resident.barangay_id ?? ''));
        setContactNumber(resident.contact_number ?? '');
        setErrors({});
    }, [resident.id]);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        router.post(
            residents.update(resident).url,
            {
                _method: 'PUT',
                full_name: fullName,
                address,
                barangay_id: barangayId,
                contact_number: contactNumber,
            },
            {
                forceFormData: true,
                onSuccess: onClose,
                onError: (validationErrors) => {
                    setErrors(validationErrors);
                    setSubmitting(false);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            },
        );
    }

    const residentId = formatResidentId(resident);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        {resident.photo_url ? (
                            <img
                                src={resident.photo_url}
                                alt={resident.full_name}
                                className="h-12 w-12 rounded-full object-cover"
                            />
                        ) : (
                            <div
                                className={cn(
                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                                    getAvatarColor(resident.full_name),
                                )}
                            >
                                {getInitials(resident.full_name)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Edit Resident
                            </h2>
                            <span className="inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">
                                {residentId}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5">
                        <div className="flex flex-col gap-4">
                            <Field label="Full Name *" error={errors.full_name}>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    required
                                    className={cn(
                                        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100',
                                        errors.full_name
                                            ? 'border-red-400 focus:border-red-400'
                                            : 'border-slate-200 focus:border-blue-400',
                                    )}
                                />
                            </Field>

                            <Field label="Address *" error={errors.address}>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className={cn(
                                        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100',
                                        errors.address
                                            ? 'border-red-400 focus:border-red-400'
                                            : 'border-slate-200 focus:border-blue-400',
                                    )}
                                />
                            </Field>

                            <Field
                                label="Barangay *"
                                error={errors.barangay_id}
                            >
                                <select
                                    value={barangayId}
                                    onChange={(e) =>
                                        setBarangayId(e.target.value)
                                    }
                                    required
                                    className={cn(
                                        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100',
                                        errors.barangay_id
                                            ? 'border-red-400 focus:border-red-400'
                                            : 'border-slate-200 focus:border-blue-400',
                                    )}
                                >
                                    <option value="">Select barangay</option>
                                    {barangays.map((b) => (
                                        <option key={b.id} value={String(b.id)}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Contact Number *"
                                error={errors.contact_number}
                            >
                                <input
                                    type="text"
                                    value={contactNumber}
                                    onChange={(e) =>
                                        setContactNumber(e.target.value)
                                    }
                                    placeholder="+63 9XX XXX XXXX"
                                    required
                                    className={cn(
                                        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100',
                                        errors.contact_number
                                            ? 'border-red-400 focus:border-red-400'
                                            : 'border-slate-200 focus:border-blue-400',
                                    )}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                        >
                            {submitting ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
