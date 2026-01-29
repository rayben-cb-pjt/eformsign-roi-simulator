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
    const { contractCount, faceToFaceRatio, annualOptionsCost, targetCostPerUse } = params;

    const faceRatioDecimal = faceToFaceRatio / 100;
    const mailRatioDecimal = 1 - faceRatioDecimal;

    // 비용 로직
    const avgCostBefore = (CONSTANTS.FACE_COST * faceRatioDecimal) + (CONSTANTS.MAIL_COST * mailRatioDecimal);
    const perContractOptions = contractCount > 0 ? (annualOptionsCost / contractCount) : 0;
    const avgCostAfter = targetCostPerUse + perContractOptions;

    const totalBefore = avgCostBefore * contractCount;
    const totalAfter = avgCostAfter * contractCount;

    const savingAmount = totalBefore - totalAfter;
    const netSaving = savingAmount;
    const roiPercent = totalAfter > 0 ? (netSaving / totalAfter) * 100 : 0;
    const paybackDays = netSaving > 0 ? (totalAfter / (netSaving / 365)) : 0; // ?????? ??? ??? ???

// 단순화된 회수 기간 계산

    // 시간 로직
    const avgTimeBefore = (CONSTANTS.FACE_TIME_HOURS * faceRatioDecimal) + (CONSTANTS.MAIL_TIME_HOURS * mailRatioDecimal);
    const totalTimeHoursBefore = avgTimeBefore * contractCount;
    const totalTimeHoursAfter = CONSTANTS.ESIGN_TIME_HOURS * contractCount;

    const timeSavedHours = totalTimeHoursBefore - totalTimeHoursAfter;
    const daysSaved = timeSavedHours / CONSTANTS.WORK_DAY_HOURS;

    // ESG 로직
    const paperSaved = contractCount * CONSTANTS.A4_PER_CONTRACT;
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
        daysSaved,
        paperSaved,
        treesSaved,
        co2Saved,
        waterSaved
    };
};
