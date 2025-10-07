import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './views/Dashboard';
import { uploadFile } from './services/api';
import SafetyAssistant from './components/ui/SafetyAssistant'; 

function App() {
    const [fileInfo, setFileInfo] = useState(null);
    const [initialFilters, setInitialFilters] = useState(null);
    const [activeFilters, setActiveFilters] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [crimeContextForAI, setCrimeContextForAI] = useState([]); 

    const handleFileUpload = async (file) => {
        setIsLoading(true);
        setError('');
        setFileInfo(null);
        setInitialFilters(null);
        setActiveFilters(null);
        try {
            const response = await uploadFile(file);
            setFileInfo({
                name: file.name,
                totalRecords: response.data.total_records,
            });
            setInitialFilters(response.data.filters);
           
            const allFilters = {
                areas: response.data.filters.areas,
                crimes: response.data.filters.crimes,
                severities: response.data.filters.severities,
            };
            setActiveFilters(allFilters);
 
    
            setCrimeContextForAI(response.data.filters.crimes.slice(0, 5));

        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Failed to upload or process file.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setActiveFilters(newFilters);
    
        setCrimeContextForAI(newFilters.crimes.slice(0, 5));
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar
                onFileUpload={handleFileUpload}
                fileInfo={fileInfo}
                initialFilters={initialFilters}
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
            />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <header>
                    <h1 className="text-3xl font-bold text-gray-800">CrimeLens</h1>
                    <p className="text-gray-500">Interactive Crime Analysis & Prediction Dashboard</p>
                </header>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {activeFilters ? (
                    <Dashboard activeFilters={activeFilters} />
                ) : (
                    <div className="mt-10 flex flex-col items-center justify-center text-center text-gray-500 bg-white p-10 rounded-lg shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <h2 className="text-xl font-semibold">Welcome to CrimeLens</h2>
                        <p>Please upload a crime data CSV file using the sidebar to begin the analysis.</p>
                    </div>
                )}
            </main>

            {}
            {}
            {initialFilters && <SafetyAssistant crimeContext={crimeContextForAI} />}
        </div>
    );
}

export default App;
