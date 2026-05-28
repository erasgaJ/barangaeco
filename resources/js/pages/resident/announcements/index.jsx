import { Head, Link } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import ResidentLayout from '@/layouts/resident-layout';

const AUDIENCE_STYLES = {
    all: 'bg-slate-100 text-slate-700',
    residents: 'bg-green-100 text-green-700',
};

const AUDIENCE_LABELS = {
    all: 'Everyone',
    residents: 'Residents',
};

function AudienceBadge({ audience }) {
    const style = AUDIENCE_STYLES[audience] ?? 'bg-slate-100 text-slate-700';
    const label = AUDIENCE_LABELS[audience] ?? audience;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style}`}
        >
            {label}
        </span>
    );
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function truncate(text, maxLength = 150) {
    if (!text || text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength).trimEnd() + '…';
}

export default function ResidentAnnouncementsIndex({ announcements }) {
    return (
        <>
            <Head title="Announcements" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Announcements
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        Community announcements from the barangay.
                    </p>
                </div>

                {/* Card list */}
                <div className="flex flex-col gap-3">
                    {announcements.data.length === 0 ? (
                        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
                            <Megaphone className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                No announcements yet
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                Check back later for community updates.
                            </p>
                        </div>
                    ) : (
                        announcements.data.map((ann) => (
                            <div
                                key={ann.id}
                                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                                    <Megaphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {ann.title}
                                        </p>
                                        <AudienceBadge
                                            audience={ann.target_audience}
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        {truncate(ann.message)}
                                    </p>
                                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                                        {formatDate(ann.published_at)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {announcements.links && announcements.links.length > 3 && (
                    <div className="mt-4 flex items-center gap-1">
                        {announcements.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url ?? '#'}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-green-600 text-white'
                                        : link.url
                                          ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                          : 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                                }`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ResidentAnnouncementsIndex.layout = (page) => (
    <ResidentLayout>{page}</ResidentLayout>
);
