import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { motion } from 'framer-motion';

interface KPICardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    subValue?: string;
    icon: LucideIcon;
    colorClass: string;
    delay?: number;
    format?: (v: number) => string;
    isPdf?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, prefix, suffix, subValue, icon: Icon, colorClass, delay = 0, format, isPdf = false }) => {
    const Wrapper: React.ElementType = isPdf ? 'div' : motion.div;
    const wrapperProps = isPdf
        ? {}
        : {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.4, delay: delay * 0.1 }
        };

    return (
        <Wrapper
            {...wrapperProps}
            className="group break-inside-avoid"
        >
            <div className="relative bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('teal', 'teal-50').replace('amber', 'amber-50').replace('rose', 'rose-50')} ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {subValue && (
                        <span className="pdf-kpi-pill text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                            <span className="pdf-kpi-pill-text">{subValue}</span>
                        </span>
                    )}
                </div>
                
                <div>
                    <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h4>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1 pdf-kpi-value">
                        {prefix && <span>{prefix}</span>}
                        <AnimatedNumber value={value} format={format} animate={!isPdf} />
                        {suffix && <span className="text-sm font-semibold text-slate-400">{suffix}</span>}
                    </div>
                </div>
            </div>
        </Wrapper>
    );
};
