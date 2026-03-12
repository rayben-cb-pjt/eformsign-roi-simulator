import React from 'react';
import { TreePine, Cloud, Droplets } from 'lucide-react';
import { ROIResult } from '../types';
import { AnimatedNumber } from './AnimatedNumber';
import { motion } from 'framer-motion';

interface ESGGridProps {
    result: ROIResult;
    contractCount: number;
    isPdf?: boolean;
}

export const ESGGrid: React.FC<ESGGridProps> = ({ result, contractCount, isPdf = false }) => {
    const staticTreeHeights = [24, 38, 52, 34, 68, 46, 58, 30, 72, 44, 62, 36];

    return (
        <div className="space-y-4 h-full break-inside-avoid">
            {/* Main ESG Card - Keep Green for Nature Theme, but clearer */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 relative overflow-hidden h-[240px] flex flex-col justify-between group shadow-lg shadow-emerald-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-15 transition-opacity duration-700"></div>
                
                <div className="pdf-esg-text relative z-10">
                    <div className="flex items-center gap-2 text-emerald-50 mb-2">
                        <div className="bg-white/20 p-1.5 rounded-md backdrop-blur-md">
                            <TreePine className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">ESG 환경 보호 효과</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <div className="text-5xl font-bold text-white tracking-tight">
                            <AnimatedNumber value={result.treesSaved} format={(v) => v.toFixed(1)} animate={!isPdf} />
                        </div>
                        <span className="text-xl text-emerald-100/90 font-medium">그루의 나무 보존</span>
                    </div>
                    <p className="text-emerald-100/70 text-sm mt-2 font-light">
                        종이 계약서를 전자문서로 대체하여<br/>
                        숲을 보호하고 탄소 배출을 줄입니다.
                    </p>
                </div>

                {/* Animated Forest Line */}
                <div className="relative h-16 w-full flex items-end justify-between px-2 overflow-hidden">
                    {Array.from({ length: 12 }).map((_, i) => {
                        if (isPdf) {
                            return (
                                <div
                                    key={i}
                                    className="w-1.5 bg-emerald-300 rounded-t-full mx-0.5"
                                    style={{ height: `${staticTreeHeights[i] ?? 40}%`, opacity: 0.6 }}
                                />
                            );
                        }

                        return (
                            <motion.div
                                key={i}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${20 + Math.random() * 80}%`, opacity: 0.4 + Math.random() * 0.6 }}
                                transition={{ duration: 1, delay: i * 0.05, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                                className="w-1.5 bg-emerald-300 rounded-t-full mx-0.5"
                            />
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-colors shadow-soft group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Cloud className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">탄소 배출 저감</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                        <AnimatedNumber value={result.co2Saved} format={(v) => v.toFixed(0)} animate={!isPdf} />
                        <span className="text-sm font-semibold text-slate-400 ml-1">kg</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-blue-500 h-full w-[70%] rounded-full"></div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-cyan-300 transition-colors shadow-soft group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                            <Droplets className="w-5 h-5 text-cyan-500" />
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">물 절약 효과</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                        <AnimatedNumber value={result.waterSaved} format={(v) => v.toFixed(0)} animate={!isPdf} />
                        <span className="text-sm font-semibold text-slate-400 ml-1">L</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-cyan-500 h-full w-[50%] rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
