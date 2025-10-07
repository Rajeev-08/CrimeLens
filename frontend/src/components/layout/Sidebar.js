// frontend/src/components/layout/Sidebar.js
import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

// A generic MultiSelect component
function MultiSelect({ label, options, selected, onChange }) {
    return (
        <div className="w-full">
            <Listbox value={selected} onChange={onChange} multiple>
                <div className="relative mt-1">
                    <Listbox.Label className="block text-sm font-medium text-gray-700">{label}</Listbox.Label>
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                        <span className="block truncate">{selected.length} of {options.length} selected</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {options.map((option, index) => (
                                <Listbox.Option
                                    key={index}
                                    className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`}
                                    value={option}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option}</span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}


const Sidebar = ({ onFileUpload, fileInfo, initialFilters, onFilterChange, isLoading }) => {
    const [selectedFilters, setSelectedFilters] = useState(null);

    useEffect(() => {
        if (initialFilters) {
            setSelectedFilters({
                areas: initialFilters.areas,
                crimes: initialFilters.crimes,
                severities: initialFilters.severities,
            });
        }
    }, [initialFilters]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handleFilterUpdate = (filterType, value) => {
        setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const applyFilters = () => {
        onFilterChange(selectedFilters);
    };

    return (
        <aside className="w-96 bg-white p-6 shadow-lg overflow-y-auto flex flex-col space-y-6">
            <div className="flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Controls</h2>
                <div className="mt-4">
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload Crime Data</label>
                    <input id="file-upload" type="file" onChange={handleFileChange} accept=".csv" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>

                {isLoading && <p className="mt-4 text-sm text-blue-600">Processing file...</p>}

                {fileInfo && !isLoading && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                        <p className="text-sm font-semibold truncate">{fileInfo.name}</p>
                        <p className="text-xs text-gray-600">{fileInfo.totalRecords.toLocaleString()} records loaded</p>
                    </div>
                )}
            </div>

            {initialFilters && selectedFilters && (
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mt-4">Filters</h3>
                    <div className="mt-4 space-y-4">
                        <MultiSelect
                            label="Area Name"
                            options={initialFilters.areas}
                            selected={selectedFilters.areas}
                            onChange={(value) => handleFilterUpdate('areas', value)}
                        />
                        <MultiSelect
                            label="Crime Type"
                            options={initialFilters.crimes}
                            selected={selectedFilters.crimes}
                            onChange={(value) => handleFilterUpdate('crimes', value)}
                        />
                        <MultiSelect
                            label="Severity"
                            options={initialFilters.severities}
                            selected={selectedFilters.severities}
                            onChange={(value) => handleFilterUpdate('severities', value)}
                        />
                    </div>
                    <button onClick={applyFilters} className="mt-6 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300">
                        Apply Filters
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;