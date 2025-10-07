
import React, { useState } from 'react';
import { trainModel } from '../../services/api';
import { Bar } from 'react-chartjs-2';

const PredictionTab = ({ activeFilters }) => {
    const [modelResult, setModelResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrainModel = async () => {
        setIsLoading(true);
        setError('');
        setModelResult(null);
        try {
            const response = await trainModel(activeFilters);
            setModelResult(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Failed to train model.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const importanceChartData = {
        labels: modelResult?.feature_importance.map(fi => fi.feature),
        datasets: [{
            label: 'Feature Importance',
            data: modelResult?.feature_importance.map(fi => fi.importance),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }]
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-2">Crime Risk Prediction (XGBoost)</h3>
            <p className="text-sm text-gray-600 mb-4">
                Train a model to classify crime severity based on time and location features from your filtered dataset.
            </p>
            <button
                onClick={handleTrainModel}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
                {isLoading ? 'Training Model...' : 'Train New Model'}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {modelResult && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-blue-50 p-6 rounded-lg text-center">
                        <h4 className="text-lg font-semibold text-gray-700">Model Accuracy</h4>
                        <p className="text-5xl font-bold text-blue-600 mt-2">
                            {(modelResult.accuracy * 100).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-2">on test data</p>
                    </div>
                    <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg">
                         <h4 className="text-lg font-semibold text-gray-700 mb-4">Feature Importance</h4>
                         <Bar 
                            data={importanceChartData} 
                            options={{ indexAxis: 'y', responsive: true, plugins: { legend: { display: false }}}} 
                         />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionTab;
