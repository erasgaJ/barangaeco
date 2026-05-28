import Heading from '@/components/heading';

export default function AccountInfoPanel({ role, createdAt }) {
    const formattedRole = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : '—';

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '—';

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Account information"
                description="Your account role and membership details"
            />

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <dl className="space-y-3">
                    <div className="flex items-center justify-between">
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Role
                        </dt>
                        <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formattedRole}
                        </dd>
                    </div>

                    <div className="border-t border-slate-100 pt-3 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Member since
                            </dt>
                            <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {formattedDate}
                            </dd>
                        </div>
                    </div>
                </dl>
            </div>
        </div>
    );
}
