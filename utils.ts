import { SimulationParams, ROIResult, CONSTANTS } from './types';

export const formatCurrency = (value: number): string => {
    if (value >= 100000000) {
        return `${(value / 100000000).toFixed(2)}억`;
    }
    if (value >= 10000) {
        return `${(value / 10000).toFixed(0)}만`;
    }
    return value.toLocaleString();
};

export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(value));
};

export const calculateROI = (params: SimulationParams): ROIResult => {
    const { contractCount, faceToFaceRatio, annualOptionsCost, targetCostPerUse, aiAssistantEnabled, templateCount } = params;

    const faceRatioDecimal = faceToFaceRatio / 100;
    const mailRatioDecimal = 1 - faceRatioDecimal;

    // 비용 로직
    // 도입 전 비용 = (대면 실비 + 대면시간*시급) * 대면비율 + (등기 실비 + 등기시간*시급) * 등기비율
    const costFaceBefore = CONSTANTS.FACE_OUT_OF_POCKET_COST + (CONSTANTS.FACE_TIME_HOURS * CONSTANTS.HOURLY_WAGE);
    const costMailBefore = CONSTANTS.MAIL_OUT_OF_POCKET_COST + (CONSTANTS.MAIL_TIME_HOURS * CONSTANTS.HOURLY_WAGE);
    const avgCostBefore = (costFaceBefore * faceRatioDecimal) + (costMailBefore * mailRatioDecimal);
    const perContractOptions = contractCount > 0 ? (annualOptionsCost / contractCount) : 0;

    // 도입 후 비용: 건당 요금 + 옵션 비용 + 전자계약 처리 인건비
    const laborCostAfter = CONSTANTS.ESIGN_TIME_HOURS * CONSTANTS.HOURLY_WAGE;
    const avgCostAfter = targetCostPerUse + perContractOptions + laborCostAfter;

    const totalBefore = avgCostBefore * contractCount;
    const totalAfter = avgCostAfter * contractCount;

    // AI비서 절감 계산
    const annualTemplateCount = templateCount * 12; // 월간 → 연간
    let aiTemplateSaving = 0;
    let aiErrorSaving = 0;
    let aiTimeSavedHours = 0;

    if (aiAssistantEnabled) {
        // 서식 설정 시간 절감: 연간 서식 수 × (수동 시간 - AI 시간) × 시급
        const templateTimeSavedHours = annualTemplateCount * (CONSTANTS.TEMPLATE_SETUP_TIME_HOURS - CONSTANTS.AI_TEMPLATE_SETUP_TIME_HOURS);
        aiTemplateSaving = templateTimeSavedHours * CONSTANTS.HOURLY_WAGE;

        // 오류 재작업 절감: 계약건수 × 오류율 × 수정시간 × 시급 × AI 감소율
        const errorReworkHours = contractCount * CONSTANTS.ERROR_REWORK_RATE * CONSTANTS.ERROR_REWORK_TIME_HOURS;
        aiErrorSaving = errorReworkHours * CONSTANTS.HOURLY_WAGE * CONSTANTS.AI_ERROR_REDUCTION_RATE;

        aiTimeSavedHours = templateTimeSavedHours + (errorReworkHours * CONSTANTS.AI_ERROR_REDUCTION_RATE);
    }

    const aiTotalSaving = aiTemplateSaving + aiErrorSaving;

    const savingAmount = totalBefore - totalAfter;
    const netSaving = savingAmount + aiTotalSaving;
    const roiPercent = totalAfter > 0 ? (netSaving / totalAfter) * 100 : 0;
    const paybackDays = netSaving > 0 ? (totalAfter / (netSaving / 365)) : 0;

    // 시간 로직
    const avgTimeBefore = (CONSTANTS.FACE_TIME_HOURS * faceRatioDecimal) + (CONSTANTS.MAIL_TIME_HOURS * mailRatioDecimal);
    const totalTimeHoursBefore = avgTimeBefore * contractCount;
    const totalTimeHoursAfter = CONSTANTS.ESIGN_TIME_HOURS * contractCount;

    const timeSavedHours = totalTimeHoursBefore - totalTimeHoursAfter;
    const totalTimeSavedHours = timeSavedHours + aiTimeSavedHours;
    const daysSaved = totalTimeSavedHours / CONSTANTS.WORK_DAY_HOURS;
    const daysBefore = totalTimeHoursBefore / CONSTANTS.WORK_DAY_HOURS;
    const daysAfter = totalTimeHoursAfter / CONSTANTS.WORK_DAY_HOURS;

    // ESG 로직
    // 기본 계약서 2장 + 등기 우편 봉투(A4 1장 상당) 절감
    const envelopePaper = contractCount * mailRatioDecimal * 1;
    const paperSaved = (contractCount * CONSTANTS.A4_PER_CONTRACT) + envelopePaper;

    const treesSaved = paperSaved * 0.00036;
    const co2Saved = paperSaved * 0.00864;
    const waterSaved = paperSaved * 10;

    return {
        costBefore: avgCostBefore,
        costAfter: avgCostAfter,
        totalBefore,
        totalAfter,
        savingAmount,
        netSaving,
        roiPercent,
        paybackDays: paybackDays < 0 ? 0 : paybackDays,
        daysBefore,
        daysAfter,
        daysSaved,
        paperSaved,
        treesSaved,
        co2Saved,
        waterSaved,
        aiTemplateSaving,
        aiErrorSaving,
        aiTotalSaving,
        aiTimeSavedHours,
    };
};

