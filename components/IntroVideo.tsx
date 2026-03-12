import React from 'react';
import { Play } from 'lucide-react';

export const IntroVideo: React.FC = () => {
    return (
        <div
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft break-inside-avoid pdf-hide h-full flex flex-col"
            data-pdf-link="https://www.youtube.com/watch?v=4LGbPClP6BU"
        >
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-500 p-1 rounded-md shadow-sm">
                    <Play className="w-3 h-3 text-white fill-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                    대한민국 1위 전자계약, <span className="text-brand-600">이폼사인</span> 제안
                </h3>
            </div>

            <div className="relative w-full overflow-hidden rounded-lg bg-slate-100 flex-1 min-h-[200px] shadow-inner">
                <a
                    href="https://www.youtube.com/watch?v=4LGbPClP6BU"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm"
                >
                    새 탭에서 열기
                </a>
                <img
                    src="https://img.youtube.com/vi/4LGbPClP6BU/hqdefault.jpg"
                    alt="eformsign 소개 영상 썸네일"
                    className="pdf-only hidden absolute inset-0 w-full h-full object-cover"
                    crossOrigin="anonymous"
                />
                <iframe
                    className="pdf-hide-on-export absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/4LGbPClP6BU?rel=0&modestbranding=1"
                    title="eformsign Introduction"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                />
            </div>
        </div>
    );
};
