
import React, { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import HotspotsTab from './tabs/HotspotsTab';
import TimeSeriesTab from './tabs/TimeSeriesTab';
import SeverityTab from './tabs/SeverityTab';
import PredictionTab from './tabs/PredictionTab';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Dashboard = ({ activeFilters }) => {
    const tabs = ["Hotspots & Heatmap", "Time-Series Analysis", "Severity Breakdown", "Risk Prediction"];

    return (
        <div className="w-full mt-6">
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                    {tabs.map((tab) => (
                        <Tab key={tab} as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                        'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                        selected ? 'bg-white text-blue-700 shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                    )}
                                >
                                    {tab}
                                </button>
                            )}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2 bg-white rounded-lg shadow p-6 min-h-[600px]">
                    <Tab.Panel><HotspotsTab activeFilters={activeFilters} /></Tab.Panel>
                    <Tab.Panel><TimeSeriesTab activeFilters={activeFilters} /></Tab.Panel>
                    <Tab.Panel><SeverityTab activeFilters={activeFilters} /></Tab.Panel>
                    <Tab.Panel><PredictionTab activeFilters={activeFilters} /></Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default Dashboard;
