import React from 'react';
import { ROIResult } from '../types';
import { formatCurrency } from '../utils';
import { motion } from 'framer-motion';

interface DetailTableProps {
    result: ROIResult;
    isPdf?: boolean;
}

export const DetailTable: React.FC<DetailTableProps> = ({ result, isPdf = false }) => {
    const Container: React.ElementType = isPdf ? 'div' : motion.div;
    const Row: React.ElementType = isPdf ? 'tr' : motion.tr;
    const containerProps = isPdf
        ? {}
        : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
    const rows = [
        {
            title: "건당 평균 처리 비용",
            desc: "인건비, 자재비, 우편 발송비 등 포함",
            before: `${Math.round(result.costBefore).toLocaleString()}원`,
            after: `${result.costAfter.toLocaleString()}원`,
            improvement: `${((result.costBefore - result.costAfter) / result.costBefore * 100).toFixed(0)}% 절감`,
            isCurrency: false
        },
        {
            title: "연간 총 운영 비용",
            desc: "전자계약 연간 구독료 포함",
            before: `${formatCurrency(result.totalBefore)}원`,
            after: `${formatCurrency(result.totalAfter)}원`,
            improvement: formatCurrency(result.savingAmount),
            improvementLabel: "절감액",
            isCurrency: true
        },
        {
            title: "연간 업무 소요 시간",
            desc: "계약 및 문서 관리 업무 시간 환산",
            before: `약 ${Math.round(result.daysBefore).toLocaleString()}일`,
            after: result.daysAfter < 1 ? "1일 미만" : `약 ${Math.round(result.daysAfter).toLocaleString()}일`,
            improvement: `${Math.round((result.daysSaved / result.daysBefore) * 100)}% 단축`,
            isCurrency: false
        },
        // AI비서 효과 행 (aiTotalSaving > 0일 때만 포함)
        ...(result.aiTotalSaving > 0 ? [
            {
                title: "🤖 AI비서: 서식 설정 자동화",
                desc: "AI가 서식 항목·속성·워크플로우를 자동 설정 (90% 시간 단축)",
                before: "수동 설정 (건당 30분)",
                after: "AI 자동 설정 (건당 3분)",
                improvement: formatCurrency(result.aiTemplateSaving),
                improvementLabel: "절감액",
                isCurrency: true
            },
            {
                title: "🤖 AI비서: 입력 오류 방지",
                desc: "AI가 입력 규칙 자동 적용으로 재작업 비용 80% 절감",
                before: "수동 입력 (오류율 5%)",
                after: "AI 자동 검증",
                improvement: formatCurrency(result.aiErrorSaving),
                improvementLabel: "절감액",
                isCurrency: true
            }
        ] : [])
    ];

    return (
        <Container {...containerProps} className="overflow-hidden break-inside-avoid">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-brand-600 rounded-full"></span>
                    비용 절감 상세 분석 리포트
                </h3>
                <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    단위: 원
                </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-1/3 text-xs uppercase tracking-wider">분석 항목</th>
                            <th className="px-6 py-4 w-1/4 text-center text-xs uppercase tracking-wider">도입 전</th>
                            <th className="px-6 py-4 w-1/4 text-center text-brand-600 text-xs uppercase tracking-wider">도입 후</th>
                            <th className="px-6 py-4 w-1/6 text-center text-accent-teal text-xs uppercase tracking-wider">개선 효과</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {rows.map((row, index) => {
                            const improvementText = `${row.improvementLabel ? '' : '▼ '}${row.improvement}`;

                            return (
                                <Row
                                    key={index}
                                    {...(isPdf ? {} : { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 } })}
                                    className="hover:bg-slate-50 transition-colors group"
                                >
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-slate-800 text-base">{row.title}</div>
                                        <div className="text-xs text-slate-500 font-normal mt-1">{row.desc}</div>
                                    </td>
                                    <td className="px-6 py-5 text-center text-slate-500 font-medium text-base">
                                        {row.before}
                                    </td>
                                    <td className="px-6 py-5 text-center font-bold text-brand-600 bg-brand-50/50 text-base relative">
                                        {row.after}
                                        <div className="absolute inset-y-0 left-0 w-[1px] bg-brand-100"></div>
                                    </td>
                                    <td className="px-6 py-5 text-center font-bold text-accent-teal">
                                        <span className={`pdf-improvement-badge relative inline-flex flex-col items-center justify-center bg-teal-50 rounded-lg border border-teal-100 text-teal-700 ${row.improvementLabel ? 'px-4 py-2 pdf-improvement-badge--stacked' : 'px-3 py-1.5'}`}>
                                            {row.improvementLabel && (
                                                <span
                                                    className="pdf-improvement-label text-[10px] uppercase tracking-wide text-teal-600/70 mb-0.5"
                                                    style={{ color: '#0f766e', opacity: 0.7 }}
                                                >
                                                    {row.improvementLabel}
                                                </span>
                                            )}
                                            <span
                                                className={`pdf-improvement-value font-bold ${row.isCurrency ? 'text-lg leading-none' : 'text-sm'}`}
                                                style={{ color: '#0f766e', opacity: 1 }}
                                            >
                                                {improvementText}
                                            </span>
                                            <span
                                                className={`pdf-improvement-overlay hidden font-bold text-teal-700 ${row.isCurrency ? 'text-lg leading-none' : 'text-sm'}`}
                                            >
                                                {improvementText}
                                            </span>
                                        </span>
                                    </td>
                                </Row>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Container>
    );
};
