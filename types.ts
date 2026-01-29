export interface SimulationParams {
    contractCount: number;
    faceToFaceRatio: number; // 0에서 100 사이
    annualOptionsCost: number;
    targetCostPerUse: number;
}

export interface ROIResult {
    costBefore: number;
    costAfter: number;
    totalBefore: number;
    totalAfter: number;
    savingAmount: number;
    netSaving: number;
    roiPercent: number;
    paybackDays: number;
    daysSaved: number;
    paperSaved: number;
    treesSaved: number;
    co2Saved: number;
    waterSaved: number;
}

export const CONSTANTS = {
    FACE_COST: 120000, // 원 (KRW)
    MAIL_COST: 16830, // 원 (KRW)
    FACE_TIME_HOURS: 1.02083,
    MAIL_TIME_HOURS: 0.14583,
    ESIGN_TIME_HOURS: 0.00208,
    A4_PER_CONTRACT: 2,
    WORK_DAY_HOURS: 8,
    WORK_DAYS_PER_YEAR: 250, // 대략적인 연간 근무일수
};
