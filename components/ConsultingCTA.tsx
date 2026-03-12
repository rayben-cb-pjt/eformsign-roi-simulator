import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

interface ConsultingCTAProps {
    onClick: (e: React.MouseEvent) => void;
}

export const ConsultingCTA: React.FC<ConsultingCTAProps> = ({ onClick }) => {
    return (
        <a
            href="https://eformsign.channel.io"
            target="_blank"
            rel="noreferrer noopener"
            onClick={onClick}
            data-pdf-link="https://eformsign.channel.io"
            className="block w-full bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-brand-200 transition-all hover:-translate-y-1 hover:shadow-xl ring-1 ring-white/10 no-print"
        >
            <div className="pdf-noise-overlay absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

            <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                <Sparkles className="w-40 h-40 text-white" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/20">PREMIUM</span>
                    </div>
                    <h3 className="font-bold text-xl md:text-2xl mb-2 text-white">ROI 리포트 & 맞춤 제안서</h3>
                    <p className="text-sm text-brand-100 leading-relaxed font-light max-w-lg">
                        우리 기업에 딱 맞는 요금제는 무엇일까요?<br className="hidden md:block" />
                        <span className="text-white font-medium">최적의 ROI 스토리</span>와 상세 리포트를 무료로 제안받으세요.
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-transform group-hover:scale-105 pdf-cta-button">
                        맞춤 제안서 받기
                        <ChevronRight className="w-4 h-4" />
                    </span>
                </div>
            </div>
        </a>
    );
};
