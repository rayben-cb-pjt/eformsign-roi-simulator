import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { ROIResult } from '../types';
import { motion } from 'framer-motion';

interface ChartsSectionProps {
    result: ROIResult;
    scalingData: any[];
    isPdf?: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ result, scalingData, isPdf = false }) => {
    const Panel: React.ElementType = isPdf ? 'div' : motion.div;

    // Using real data for the bar chart
    const barData = [
        {
            name: '비용 (억원)',
            "도입 전": parseFloat((result.totalBefore / 100000000).toFixed(2)),
            "도입 후": parseFloat((result.totalAfter / 100000000).toFixed(2)),
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 p-4 rounded-xl shadow-xl z-50">
                    <p className="font-bold mb-3 text-slate-900 border-b border-slate-100 pb-2 text-sm">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1.5 last:mb-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-600 font-medium">{entry.name}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900 tracking-wide">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6 break-inside-avoid">
            <Panel className="relative">
                <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 relative z-10">
                    <span className="w-1.5 h-4 bg-brand-600 rounded-full"></span>
                    비용 비교 분석 (도입 전후)
                </h3>
                <div className="h-[250px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            barSize={40}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} unit="억" />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: '#f1f5f9' }}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ zIndex: 60 }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Bar
                                dataKey="도입 전"
                                fill="#94a3b8"
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={false}
                            />
                            <Bar
                                dataKey="도입 후"
                                fill="#4f46e5"
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={false}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Panel>

            <Panel className="relative">
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 relative z-10">
                    <span className="w-1.5 h-4 bg-accent-teal rounded-full"></span>
                    계약 규모별 예상 절감액 추이
                </h3>
                <div className="h-[250px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={scalingData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="contracts"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(val) => `${val / 1000}k`}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                unit="억"
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ zIndex: 60 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="saving"
                                name="절감액 (억원)"
                                stroke="#14b8a6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#fff', stroke: '#14b8a6', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: '#14b8a6', stroke: '#ccfbf1', strokeWidth: 4 }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Panel>
        </div>
    );
};
