import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A multi-select component for choosing collectors.
 *
 * @param {object[]} collectors - All available collectors (each with id, full_name).
 * @param {number[]} value - Array of currently selected collector IDs.
 * @param {function} onChange - Callback invoked with new array of selected IDs.
 * @param {string} [error] - Validation error message to display below the component.
 */
export default function CollectorMultiSelect({
    collectors,
    value,
    onChange,
    error,
}) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedIds = value ?? [];

    const selectedCollectors = collectors.filter((c) =>
        selectedIds.includes(c.id),
    );

    const filteredCollectors = collectors.filter(
        (c) =>
            !selectedIds.includes(c.id) &&
            c.full_name.toLowerCase().includes(search.toLowerCase()),
    );

    function handleSelect(collector) {
        onChange([...selectedIds, collector.id]);
        setSearch('');
    }

    function handleRemove(id) {
        onChange(selectedIds.filter((sid) => sid !== id));
    }

    function handleInputFocus() {
        setOpen(true);
    }

    function handleInputChange(e) {
        setSearch(e.target.value);
        setOpen(true);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            {/* Selected chips */}
            {selectedCollectors.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedCollectors.map((c) => (
                        <span
                            key={c.id}
                            className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                        >
                            {c.full_name}
                            <button
                                type="button"
                                onClick={() => handleRemove(c.id)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200"
                                aria-label={`Remove ${c.full_name}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search input */}
            <input
                type="text"
                placeholder="Search collectors…"
                value={search}
                onFocus={handleInputFocus}
                onChange={handleInputChange}
                className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none',
                    'focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
                    error ? 'border-red-400' : 'border-slate-200',
                )}
            />

            {/* Dropdown */}
            {open && filteredCollectors.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {filteredCollectors.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => {
                                // Prevent blur on input before click registers
                                e.preventDefault();
                                handleSelect(c);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                            {c.full_name}
                        </button>
                    ))}
                </div>
            )}

            {open && search.length > 0 && filteredCollectors.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                    <p className="text-sm text-slate-400">
                        No collectors found.
                    </p>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
