import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#EEF1F8] px-4 py-10">
            <Head title="Admin Login" />

            {/* Card */}
            <div className="w-full max-w-md rounded-2xl bg-white px-10 py-10 shadow-sm">
                {/* Logo */}
                <div className="mb-6 flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
                        <Leaf className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <p className="text-xl font-bold text-slate-900">BarangaECO</p>
                    <p className="text-sm text-slate-500">Admin Portal</p>
                </div>

                <hr className="mb-6 border-slate-200" />

                {status && (
                    <p className="mb-4 text-center text-sm font-medium text-green-600">{status}</p>
                )}

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                                >
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="admin@barangaeco.ph"
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <a
                                            href={request().url}
                                            className="text-xs font-medium text-blue-600 hover:underline"
                                        >
                                            Forgot Password?
                                        </a>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="px-9"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 w-full bg-blue-600 hover:bg-blue-700"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Log In →
                            </Button>
                        </>
                    )}
                </Form>
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col items-center gap-1 text-xs text-slate-400">
                <div className="flex gap-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                </div>
                <p>© 2024 BARANGAECO</p>
            </div>
        </div>
    );
}
