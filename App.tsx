import React, { useState, useMemo } from 'react';
import { SimulationParams, ROIResult } from './types';
import { calculateROI, formatCurrency } from './utils';
import { SliderControl } from './components/SliderControl';
import { KPICard } from './components/KPICard';
import { ChartsSection } from './components/ChartsSection';
import { ESGGrid } from './components/ESGGrid';
import { DetailTable } from './components/DetailTable';
import { AnimatedNumber } from './components/AnimatedNumber';
import { Download, Loader2, Sparkles, TrendingUp, Coins, Timer, RotateCcw, Bot, FileText } from 'lucide-react';
import { exportToPdfA4Snapshot } from './utils/exportPdfA4Snapshot';
import { ConsultingModal } from './components/ConsultingModal';
import { motion } from 'framer-motion';
import { Agentation } from 'agentation';
import { MethodologySection } from './components/MethodologySection';
import { IntroVideo } from './components/IntroVideo';
import { ConsultingCTA } from './components/ConsultingCTA';

const DEFAULT_PARAMS: SimulationParams = {
    contractCount: 10000,
    faceToFaceRatio: 50,
    annualOptionsCost: 0,
    targetCostPerUse: 800,
    aiAssistantEnabled: true,
    templateCount: 10,
};

const App: React.FC = () => {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [isConsultingModalOpen, setIsConsultingModalOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const result: ROIResult = useMemo(() => calculateROI(params), [params]);

    // 유도된 데이터 (차트 스케일링용) - 현재 선택된 계약 건수를 기준으로 동적으로 변경
    const scalingData = useMemo(() => {
        // 현재 값의 0.5배 ~ 2배 범위로 차트 데이터 생성 (최소 100건 보장)
        const multipliers = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        return multipliers.map(m => {
            const tempCount = Math.max(100, Math.round(params.contractCount * m));
            const tempParams = { ...params, contractCount: tempCount };
            const tempRes = calculateROI(tempParams);
            return {
                contracts: tempCount,
                saving: parseFloat((tempRes.netSaving / 100000000).toFixed(2)) // 억 단위
            };
        }).sort((a, b) => a.contracts - b.contracts) // 순서 보장
            .filter((item, index, self) =>
                index === self.findIndex((t) => t.contracts === item.contracts)
            ); // 중복 제거
    }, [params]);

    const updateParam = (key: keyof SimulationParams, value: number | boolean) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPdf(true);

        try {
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            await exportToPdfA4Snapshot('pdf-capture-root', `eformsign_전자계약_ROI_분석리포트_${date}`);
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
                            <img src={`${import.meta.env.BASE_URL}eformsign_logo.png`} alt="eformsign" className="h-8 w-auto object-contain" />
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
                    <div className="pdf-only pdf-only-flex hidden flex items-center justify-between mb-6 pt-2">
                        <div className="flex items-center gap-3">
                            <img src={`${import.meta.env.BASE_URL}eformsign_logo.png`} alt="eformsign" className="h-8 w-auto object-contain mt-1" />
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
                            <h2 className="text-brand-600 text-xs font-bold tracking-widest uppercase mb-3 flex items-center justify-center gap-3">
                                <span className="w-8 h-px bg-brand-200"></span>
                                ROI ANALYSIS REPORT
                                <span className="w-8 h-px bg-brand-200"></span>
                            </h2>
                            <div className="pdf-hero-value text-5xl md:text-7xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2 whitespace-nowrap mb-6">
                                <span className="text-[0.4em] text-slate-400 font-medium translate-y-1">비효율적인 계약 관리로<br />매년 낭비되는 비용</span>
                                <span className="text-brand-600 ml-2 relative">
                                    <span className="absolute -top-6 -right-6 text-sm font-bold text-accent-rose bg-accent-rose/10 px-2 py-1 rounded-full animate-bounce pdf-loss-badge">
                                        LOSS CHECK
                                    </span>
                                    <AnimatedNumber value={result.netSaving} format={formatCurrency} />원
                                </span>
                            </div>
                            <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
                                <span className="block">입력한 조건만으로 3초 안에 결과를 확인해 보세요.</span>
                                <span className="block mt-1">
                                    <strong className="text-slate-900">이폼사인을 도입했을 때 얼마나 절감할 수 있는지</strong> 한눈에 보여드립니다.
                                </span>
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">

                        {/* Left Panel: Inputs */}
                        {/* Left Panel: Inputs (Moved to Top for better UX flow) */}
                        <div className="xl:col-span-3 no-print flex flex-col gap-4 h-full">

                            {/* 1. Settings Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft flex flex-col relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-500 to-brand-600"></div>
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-slate-800 font-bold flex items-center gap-2 text-base">
                                            <Sparkles className="w-5 h-5 text-brand-600" />
                                            시뮬레이터 조건 설정
                                        </h3>
                                        <p className="text-[11px] text-slate-400 mt-1 pl-7">
                                            현재 입력 조건을 입력해보세요
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setParams(DEFAULT_PARAMS);
                                        }}
                                        className="text-[10px] text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full p-2 transition-all"
                                        title="초기화"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* AI비서 섹션 (최상단 배치 - 프라이밍 효과) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            <Bot className="w-3 h-3" /> AI비서 효과
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-50 to-brand-50 border border-violet-100">
                                            <div className="flex items-center gap-2">
                                                <Bot className="w-4 h-4 text-violet-600" />
                                                <div>
                                                    <span className="text-sm font-semibold text-slate-700">AI비서 활성화</span>
                                                    <p className="text-[10px] text-slate-400">서식 작성 시간 90% 단축</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => updateParam('aiAssistantEnabled', !params.aiAssistantEnabled)}
                                                aria-label="AI비서 활성화 토글"
                                                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                                                    params.aiAssistantEnabled
                                                        ? 'bg-violet-600 shadow-sm shadow-violet-200'
                                                        : 'bg-slate-300'
                                                }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                                                        params.aiAssistantEnabled ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        {params.aiAssistantEnabled && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <SliderControl
                                                    label="월간 신규 서식 등록 건수"
                                                    value={params.templateCount}
                                                    min={1} max={100} step={1} unit="건"
                                                    note="매월 신규로 등록하는 전자문서 서식 수입니다."
                                                    onChange={(v) => updateParam('templateCount', v)}
                                                />
                                                {result.aiTotalSaving > 0 && (
                                                    <div className="mt-2 p-2 rounded-lg bg-violet-50 border border-violet-100">
                                                        <p className="text-[11px] text-violet-700 font-medium">
                                                            💡 AI비서 추가 절감: <strong>{formatCurrency(result.aiTotalSaving)}원</strong>
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="h-px bg-slate-100"></div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            <Coins className="w-3 h-3" /> 입력 항목
                                        </div>
                                        <SliderControl
                                            label="연간 계약 건수"
                                            value={params.contractCount}
                                            min={100} max={100000} step={100} unit="건"
                                            note="연간 처리되는 종이 계약서의 총 건수입니다. (건당 A4 2장 기준)"
                                            onChange={(v) => updateParam('contractCount', v)}
                                        />
                                        <SliderControl
                                            label="기존 서면(대면) 계약 비율"
                                            value={params.faceToFaceRatio}
                                            min={0} max={100} step={1} unit="%"
                                            note="고객과 직접 만나 계약을 진행하는 비율입니다."
                                            onChange={(v) => updateParam('faceToFaceRatio', v)}
                                        />
                                    </div>

                                    <div className="h-px bg-slate-100"></div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            <TrendingUp className="w-3 h-3" /> 투입 목표
                                        </div>
                                        <SliderControl
                                            label="전자계약 건당 처리 비용"
                                            value={params.targetCostPerUse}
                                            min={100} max={2000} step={1} unit="원"
                                            note="요금제 기준 1건당 비용을 입력하세요."
                                            onChange={(v) => updateParam('targetCostPerUse', v)}
                                        />
                                        <SliderControl
                                            label="추가 옵션 비용(연간)"
                                            value={params.annualOptionsCost}
                                            min={0} max={20000000} step={10000} unit="원"
                                            note="SMS 발송, 본인 인증 등에 사용하는 연간 예산입니다."
                                            onChange={(v) => updateParam('annualOptionsCost', v)}
                                            formatValue={(v) => formatCurrency(v)}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Intro Video (Left Sidebar) */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="no-print flex-1 flex flex-col h-full"
                            >
                                <IntroVideo />
                            </motion.div>

                            <ConsultingModal isOpen={isConsultingModalOpen} onClose={() => setIsConsultingModalOpen(false)} />
                        </div>

                        {/* Right Panel: Data Visualization */}
                        <div id="pdf-main-content" className="xl:col-span-9 flex flex-col gap-6 h-full">

                            {/* KPI Cards */}
                            <div id="pdf-kpi" className="grid grid-cols-2 md:grid-cols-4 gap-4 break-inside-avoid">
                                <KPICard
                                    title="손익분기점(BEP) 회수"
                                    value={result.roiPercent}
                                    suffix="%"
                                    subValue={result.paybackDays > 0 ? `${Math.ceil(result.paybackDays)}일만에 투자 회수` : '즉시 회수'}
                                    icon={TrendingUp}
                                    colorClass="text-brand-600"
                                    delay={0}
                                />
                                <KPICard
                                    title="연간 업무 절감 시간"
                                    value={result.daysSaved * 8}
                                    suffix="시간"
                                    subValue={`연간 ${result.daysSaved.toFixed(1)}일의 절감`}
                                    icon={Timer}
                                    colorClass="text-blue-600"
                                    delay={1}
                                />
                                <KPICard
                                    title="ESG: 종이 절감"
                                    value={result.paperSaved}
                                    suffix="장"
                                    subValue={`A4 Box ${Math.ceil(result.paperSaved / 2500)}상자`}
                                    icon={Sparkles} // Leaf icon would be better if imported
                                    colorClass="text-emerald-600"
                                    delay={2}
                                />
                                <KPICard
                                    title="계약 1건당 비용 절감"
                                    value={result.costBefore - result.costAfter}
                                    suffix="원"
                                    subValue={`기존 대비 ${(((result.costBefore - result.costAfter) / result.costBefore) * 100).toFixed(0)}% 비용 절감`}
                                    icon={Coins}
                                    colorClass="text-violet-600"
                                    delay={3}
                                />
                            </div>


                            {/* One Page Content Layout */}
                            <div className="flex flex-col gap-6 flex-1">

                                {/* Expert Tip Box */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-start gap-4 no-print"
                                >
                                    <div className="bg-brand-600 p-2 rounded-lg shadow-sm shadow-brand-200">
                                        <Sparkles className="w-5 h-5 text-white shrink-0" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-brand-900">
                                            {params.aiAssistantEnabled
                                                ? "전문가 의견: AI비서를 활용하면 서식 설정 시간을 90% 단축하고, 입력 오류를 80% 줄여 추가 비용 절감이 가능합니다."
                                                : params.contractCount >= 10000
                                                    ? "전문가 의견: 계약 건수가 많을수록 엔터프라이즈(Enterprise) 요금제 적용 시 ROI가 더욱 상승합니다."
                                                    : "전문가 의견: 전자계약 도입만으로도 방문 미팅 및 등기 비용을 90% 이상 즉시 절감할 수 있습니다."}
                                        </p>
                                        <p className="text-xs text-brand-700 mt-1 leading-relaxed">
                                            {params.aiAssistantEnabled
                                                ? "이폼사인 AI비서가 문서 내 입력 항목을 자동 배치하고 워크플로우까지 설정합니다. 단순 자동화를 넘어 AI가 실질적인 도움을 제공합니다."
                                                : "단순 비용 절감에 그치지 않고, 계약의 법적 효력과 문서 보관의 투명성을 높여 비즈니스 경쟁력을 강화하세요."}
                                        </p>
                                    </div>
                                </motion.div>

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

                                {/* Section 3: Detailed Breakdown */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                    className="bg-white border border-slate-200 rounded-2xl p-8 break-inside-avoid shadow-soft flex-1"
                                >
                                    <div id="pdf-table">
                                        <DetailTable result={result} />
                                    </div>
                                </motion.div>

                                {/* Consulting CTA - 상세 리포트 바로 아래 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                    className="no-print"
                                >
                                    <ConsultingCTA onClick={(e) => {
                                        e.preventDefault();
                                        setIsConsultingModalOpen(true);
                                    }} />
                                </motion.div>
                            </div>
                        </div>



                        {/* Methodology Section - Fixed to xl:col-span-12 */}
                        <div className="xl:col-span-12">
                            <MethodologySection />
                        </div>
                    </div>
                    <div className="pdf-only-block hidden mt-6 text-center text-xs text-slate-400 pdf-footer">
                        Copyright © FORCS CO., LTD. All rights reserved.
                    </div>
                </main>
                <footer className="mt-10 px-6 pb-10 text-center text-xs text-slate-400 no-print">
                    Copyright © FORCS CO., LTD. All rights reserved.
                </footer>
            </motion.div >
            {import.meta.env.DEV && <Agentation copyToClipboard={true} />}
        </>
    );
};

export default App;


