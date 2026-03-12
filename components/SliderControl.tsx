import React, { useMemo, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface SliderControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (val: number) => void;
    formatValue?: (val: number) => string;
    note?: string;
    icon?: LucideIcon;
}

export const SliderControl: React.FC<SliderControlProps> = ({
    label, value, min, max, step, unit, onChange, formatValue, note, icon: Icon
}) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const formattedValue = useMemo(() => {
        return formatValue ? formatValue(value) : value.toLocaleString();
    }, [formatValue, value]);

    const clampToStep = (raw: number) => {
        if (Number.isNaN(raw)) {
            return value;
        }
        const clamped = Math.min(max, Math.max(min, raw));
        const steps = Math.round((clamped - min) / step);
        return min + steps * step;
    };

    const commitDraft = () => {
        const numeric = Number(draft.replace(/[^\d.]/g, ''));
        const next = clampToStep(numeric);
        onChange(next);
        setIsEditing(false);
    };

    return (
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 overflow-hidden">
            <div className="flex justify-between items-start mb-1.5 gap-3">
                <div className="min-w-0">
                    <label className="text-sm font-semibold text-slate-600">{label}</label>
                </div>
                <div className="pdf-slider-value shrink-0 whitespace-nowrap text-sm font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-sm">
                    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                        <input
                            className="pdf-slider-value-input w-24 bg-transparent text-right outline-none tabular-nums"
                            inputMode="numeric"
                            value={isEditing ? draft : formattedValue}
                            onFocus={() => {
                                setIsEditing(true);
                                setDraft(String(value));
                            }}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commitDraft}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    commitDraft();
                                }
                                if (e.key === 'Escape') {
                                    setIsEditing(false);
                                }
                            }}
                        />
                        <span className="pdf-slider-value-text-pdf hidden w-24 text-right tabular-nums">
                            {formattedValue}
                        </span>
                        <span className="text-xs font-normal text-slate-500 whitespace-nowrap pdf-slider-value-unit">{unit}</span>
                    </span>
                </div>
            </div>
            {note && (
                <div className="mb-1.5">
                    <div className="w-full box-border rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-snug text-slate-600 shadow-sm break-words min-h-[64px] max-h-[64px] overflow-hidden">
                        {note}
                    </div>
                </div>
            )}
            <div className="relative h-5 flex items-center cursor-pointer">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="absolute w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-600 transition-all duration-150 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div
                    className="absolute h-4 w-4 bg-white border-2 border-brand-600 rounded-full shadow-sm z-10 pointer-events-none transition-all duration-150 ease-out group-hover:scale-125"
                    style={{ left: `clamp(0px, ${percentage}%, calc(100% - 16px))` }}
                />
            </div>
            <div className="flex justify-between mt-0.5 text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wide">
                <span>{formatValue ? formatValue(min) : min.toLocaleString()}</span>
                <span>{formatValue ? formatValue(max) : max.toLocaleString()}</span>
            </div>
        </div>
    );
};
