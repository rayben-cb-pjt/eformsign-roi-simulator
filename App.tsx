import React, { useState, useMemo } from 'react';
import { SimulationParams, ROIResult } from './types';
import { calculateROI, formatCurrency } from './utils';
import { SliderControl } from './components/SliderControl';
import { KPICard } from './components/KPICard';
import { ChartsSection } from './components/ChartsSection';
import { ESGGrid } from './components/ESGGrid';
import { DetailTable } from './components/DetailTable';
import { AnimatedNumber } from './components/AnimatedNumber';
import { Download, Loader2, Sparkles, TrendingUp, Coins, Timer, RotateCcw, ChevronRight } from 'lucide-react';
import { exportToPdf } from './utils/exportPdf';
import { ConsultingModal } from './components/ConsultingModal';
import { motion } from 'framer-motion';
import { Agentation } from 'agentation';

const DEFAULT_PARAMS: SimulationParams = {
    contractCount: 10000,
    faceToFaceRatio: 50,
    annualOptionsCost: 0,
    targetCostPerUse: 800,
};

const App: React.FC = () => {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [isConsultingModalOpen, setIsConsultingModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const result: ROIResult = useMemo(() => calculateROI(params), [params]);

    // 유도된 데이터 (차트 스케일링용)
    const scalingData = useMemo(() => {
        const multipliers = [0.1, 0.3, 0.5, 1, 2, 3];
        return multipliers.map(m => {
            const tempCount = 10000 * m;
            const tempParams = { ...params, contractCount: tempCount };
            const tempRes = calculateROI(tempParams);
            return {
                contracts: tempCount,
                saving: parseFloat((tempRes.netSaving / 100000000).toFixed(2))
            };
        });
    }, [params]);

    const updateParam = (key: keyof SimulationParams, value: number) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPdf(true);

        try {
            await exportToPdf('pdf-capture-root', 'ROI_Report', {
                singlePage: true,
                fitToPage: true,
                orientation: 'landscape'
            });
        } catch (e) {
            console.error("PDF Export failed", e);
            alert("PDF 생성 중 오류가 발생했습니다.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };


    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="min-h-screen font-sans text-slate-600 pb-20 overflow-x-hidden selection:bg-brand-100 selection:text-brand-700 bg-slate-50"
            >

                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-all duration-300 no-print">
                    <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <img src="/eformsign_logo.png" alt="eformsign" className="h-8 w-auto object-contain" />
                            <span className="text-lg font-bold text-slate-800 tracking-wide">
                                ROI <span className="text-brand-600 font-medium">시뮬레이터</span>
                            </span>
                        </div>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPdf}
                            className="bg-white/80 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-white border border-slate-200 shadow-sm transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isGeneratingPdf ? '리포트 생성 중...' : 'PDF 다운로드'}
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main
                    id="pdf-capture-root"
                    className="relative z-10 mx-auto transition-all duration-0 max-w-[1600px] px-6 mt-10"
                >
                    <div className="pdf-only hidden items-center justify-between mb-6 pt-2">
                        <div className="flex items-center gap-3">
                            <img src="/eformsign_logo.png" alt="eformsign" className="h-8 w-auto object-contain mt-1" />
                            <span className="text-lg font-bold text-slate-800 tracking-wide">
                                ROI <span className="text-brand-600 font-medium">시뮬레이터</span>
                            </span>
                        </div>
                    </div>


                    {/* Hero Metrics */}
                    <div id="pdf-hero" className="mb-12 text-center relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-block w-full"
                        >
                            <h2 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3 flex items-center justify-center gap-3">
                                <span className="w-8 h-px bg-slate-300"></span>
                                연간 예상 비용 절감액
                                <span className="w-8 h-px bg-slate-300"></span>
                            </h2>
                            {/* Ensure text doesn't wrap oddly in PDF */}
                            <div className="pdf-hero-value text-6xl md:text-8xl font-black text-slate-900 tracking-tighter flex items-center justify-center gap-2 whitespace-nowrap">
                                <span className="text-brand-600">₩</span>
                                <AnimatedNumber value={result.netSaving} format={formatCurrency} />
                            </div>
                            <p className="mt-5 text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
                                기존 서면 계약 대비 예상되는 <strong className="text-slate-800 font-semibold">연간 순수 절감액</strong>입니다. <br />
                                <span className="text-brand-600 font-medium">인건비, 등기 우편료, 종이 보관 비용</span>을 포함하여 산출되었습니다.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                        {/* Left Panel: Inputs */}
                        <div className="xl:col-span-3 space-y-3 no-print flex flex-col h-full">
                            {/* Consulting Card */}
                            <a
                                href="https://eformsign.channel.io"
                                target="_blank"
                                rel="noreferrer noopener"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsConsultingModalOpen(true);
                                }}
                                className="block bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-4 text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-brand-200 transition-transform hover:-translate-y-1"
                            >
                                <div className="pdf-noise-overlay absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                <div className="pdf-consulting-text relative z-10">
                                    <div className="pdf-consulting-pill text-[10px] font-bold bg-white/20 backdrop-blur-sm w-fit px-2 py-0.5 rounded mb-3 tracking-wider uppercase">
                                        <span className="pdf-consulting-pill-text">전문 컨설팅</span>
                                    </div>
                                    <h3 className="font-bold text-xl mb-1">도입 문의 / 컨설팅</h3>
                                    <p className="text-xs text-indigo-100 mb-5 leading-relaxed font-light opacity-90">
                                        귀사의 규모에 맞는 최적의 요금제와 <br />디지털 전환 전략을 제안해 드립니다.
                                    </p>
                                    <div className="pdf-cta flex items-center text-sm font-bold text-white gap-2 bg-white/10 w-fit px-4 py-2 rounded-xl hover:bg-white/20 transition-all border border-white/10">
                                        <span className="pdf-cta-text">상담 신청하기</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </a>
                            <ConsultingModal isOpen={isConsultingModalOpen} onClose={() => setIsConsultingModalOpen(false)} />

                            {/* Settings Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft flex-1 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                    <h3 className="text-slate-800 font-bold flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-brand-600" />
                                        분석 조건 설정
                                    </h3>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setParams(DEFAULT_PARAMS);
                                        }}
                                        className="text-[10px] text-slate-400 hover:text-brand-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md transition-colors border border-slate-100 hover:border-brand-200"
                                    >
                                        <RotateCcw className="w-3 h-3" /> 초기화
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <SliderControl
                                        label="연간 계약 건수"
                                        value={params.contractCount}
                                        min={100} max={50000} step={100} unit="건"
                                        note="1건은 A4 2장(템플릿 기준)으로 계산합니다."
                                        onChange={(v) => updateParam('contractCount', v)}
                                    />
                                    <SliderControl
                                        label="기존 서면(대면) 계약 비율"
                                        value={params.faceToFaceRatio}
                                        min={0} max={100} step={10} unit="%"
                                        note="대면 120,000원/건(교통 5만+숙박 5만+식비 2만), 등기 16,830원/건(버스 3,000+등기 3,800+시급 10,030) 기준입니다."
                                        onChange={(v) => updateParam('faceToFaceRatio', v)}
                                    />
                                    <div className="h-px bg-slate-100 my-6"></div>
                                    <SliderControl
                                        label="전자계약 건당 처리 비용"
                                        value={params.targetCostPerUse}
                                        min={100} max={2000} step={10} unit="원"
                                        note="요금제 예시 단가를 입력합니다(건당 비용)."
                                        onChange={(v) => updateParam('targetCostPerUse', v)}
                                    />
                                    <SliderControl
                                        label="추가 옵션 비용(연간)"
                                        value={params.annualOptionsCost}
                                        min={0} max={20000000} step={500000} unit="원"
                                        note="SMS·본인확인·타임스탬프 등 사용량 옵션의 연간 합계입니다."
                                        onChange={(v) => updateParam('annualOptionsCost', v)}
                                        formatValue={(v) => formatCurrency(v)}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Panel: Data Visualization */}
                        <div className="xl:col-span-9 space-y-6">

                            {/* KPI Cards */}
                            <div id="pdf-kpi" className="grid grid-cols-2 md:grid-cols-4 gap-4 break-inside-avoid">
                                <KPICard
                                    title="연간 순수 절감액"
                                    value={result.netSaving}
                                    format={formatCurrency}
                                    suffix="원"
                                    subValue={`${Math.round((result.netSaving / result.totalBefore) * 100)}% 절감`}
                                    icon={Coins}
                                    colorClass="text-accent-teal"
                                    delay={1}
                                />
                                <KPICard
                                    title="투자 수익률 (ROI)"
                                    value={result.roiPercent}
                                    suffix="%"
                                    subValue={`${(result.roiPercent / 100).toFixed(1)}배 효율`}
                                    icon={TrendingUp}
                                    colorClass="text-brand-600"
                                    delay={2}
                                />
                                <KPICard
                                    title="비용 회수 기간"
                                    value={result.paybackDays}
                                    format={(v) => v < 1 ? "즉시" : v < 30 ? `${Math.ceil(v)}일` : `${(v / 30).toFixed(1)}개월`}
                                    subValue={result.paybackDays < 30 ? "초단기 회수" : "빠른 회수"}
                                    icon={Timer}
                                    colorClass="text-accent-amber"
                                    delay={3}
                                />
                                <KPICard
                                    title="업무 시간 단축"
                                    value={result.daysSaved}
                                    suffix="일"
                                    subValue="99% 감소"
                                    icon={Sparkles}
                                    colorClass="text-accent-rose"
                                    delay={4}
                                />
                            </div>

                            {/* One Page Content Layout */}
                            <div className="space-y-6">

                                {/* Section 1: Visual Analytics */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                                >
                                    <div id="pdf-charts" className="bg-white border border-slate-200 rounded-2xl p-1 overflow-visible break-inside-avoid shadow-soft">
                                        <ChartsSection result={result} scalingData={scalingData} />
                                    </div>
                                    <div id="pdf-esg" className="space-y-6 break-inside-avoid">
                                        <ESGGrid result={result} contractCount={params.contractCount} />
                                    </div>
                                </motion.div>

                                {/* Section 2: Detailed Breakdown */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-8 break-inside-avoid shadow-soft"
                                >
                                    <div id="pdf-table">
                                        <DetailTable result={result} />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                    <div className="pdf-only-block hidden mt-6 text-center text-xs text-slate-400 pdf-footer">
                        Copyright © FORCS CO., LTD. All rights reserved.
                    </div>
                </main>
                <footer className="mt-10 px-6 pb-10 text-center text-xs text-slate-400">
                    Copyright © FORCS CO., LTD. All rights reserved.
                </footer>
            </motion.div>
            {import.meta.env.DEV && <Agentation copyToClipboard={true} />}
        </>
    );
};

export default App;
