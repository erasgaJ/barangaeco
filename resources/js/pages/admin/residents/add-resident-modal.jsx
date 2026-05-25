import { router } from '@inertiajs/react';
import { Pencil, UserRound } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import residents from '@/routes/admin/residents';

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

export default function AddResidentModal({ barangays, onClose }) {
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [barangayId, setBarangayId] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoError, setPhotoError] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    function handlePhotoSelect(e) {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setPhotoError('Photo must be smaller than 2 MB.');
            setPhoto(null);
            setPhotoPreview(null);
            return;
        }
        setPhotoError('');
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    function handleClose() {
        setFullName('');
        setAddress('');
        setBarangayId('');
        setContactNumber('');
        setEmail('');
        setPhoto(null);
        setPhotoPreview(null);
        setPhotoError('');
        setErrors({});
        onClose();
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        const data = {
            name: fullName,
            full_name: fullName,
            address,
            barangay_id: barangayId,
            contact_number: contactNumber,
            email,
        };

        if (photo) {
            data.photo = photo;
        }

        router.post(residents.store().url, data, {
            forceFormData: true,
            onSuccess: () => {
                handleClose();
            },
            onError: (validationErrors) => {
                setErrors(validationErrors);
                setSubmitting(false);
            },
            onFinish: () => {
                setSubmitting(false);
            },
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-900">
                        Add New Resident
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Fill in the resident's details to register them.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5">
                        {/* Photo upload */}
                        <div className="mb-6 flex flex-col items-center">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 focus:outline-none"
                                >
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Photo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UserRound className="h-10 w-10 text-slate-300" />
                                    )}
                                </button>
                                <span className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 shadow">
                                    <Pencil className="h-3 w-3 text-white" />
                                </span>
                            </div>
                            <p className="mt-2 text-xs font-medium tracking-wide text-slate-600 uppercase">
                                Upload Photo
                            </p>
                            <p className="text-xs text-slate-400">
                                JPG or PNG, max 2MB
                            </p>
                            {photoError && (
                                <p className="mt-1 text-xs text-red-500">
                                    {photoError}
                                </p>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handlePhotoSelect}
                            />
                        </div>

                        {/* Form fields */}
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
                                        <option key={b.id} value={b.id}>
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

                            <Field label="Email Address *" error={errors.email}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={cn(
                                        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100',
                                        errors.email
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
                            onClick={handleClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                        >
                            {submitting ? 'Saving…' : 'SAVE RESIDENT'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
