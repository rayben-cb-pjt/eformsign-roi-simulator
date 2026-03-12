import React from 'react';
import { CONSTANTS } from '../types';
import { Info, Clock, UserCheck, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export const MethodologySection: React.FC = () => {
    const methodologyItems = [
        {
            icon: UserCheck,
            title: "인건비 산출 기준",
            desc: `사무직 평균 연봉 및 근무시간 기준으로 시간당 인건비 약 ${CONSTANTS.HOURLY_WAGE.toLocaleString()}원을 적용합니다.`
        },
        {
            icon: Clock,
            title: "업무 소요 시간",
            desc: `대면 계약(이동+미팅) ${CONSTANTS.FACE_TIME_HOURS}시간, 등기 계약(출력+발송) ${Math.round(CONSTANTS.MAIL_TIME_HOURS * 60)}분, 전자계약 문서 준비 3분을 기준으로 산출합니다.`
        },
        {
            icon: Leaf,
            title: "ESG 탄소중립 데이터",
            desc: "A4 1장당 탄소배출 8.64g, 물 10L 소모는 환경부 및 국제 표준(Carbon Footprint) 데이터를 기반으로 합니다."
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-soft break-inside-avoid"
        >
            <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-slate-400" />
                <h3 className="text-slate-800 font-bold">시뮬레이션 산출 근거 및 기준</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {methodologyItems.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2 text-brand-600">
                            <item.icon className="w-4 h-4" />
                            <h4 className="font-bold text-sm">{item.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 border-dashed">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    * 본 시뮬레이션 결과는 입력값 및 가정에 따른 추정치이며 실제 도입 효과와는 차이가 있을 수 있습니다.<br />
                    * 인건비 절감 효과는 업무 시간 감소에 따른 기회비용을 포함합니다.
                </p>
            </div>
        </motion.div>
    );
};
