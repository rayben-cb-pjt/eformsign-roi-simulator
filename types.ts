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
    FACE_COST: 50000, // 원 (KRW) - 수정: 교통비+식대+기회비용
    MAIL_COST: 10000, // 원 (KRW) - 수정: 우편료+재료비+인건비
    FACE_TIME_HOURS: 1.5, // 수정: 1시간 30분 (왕복 이동 포함)
    MAIL_TIME_HOURS: 0.33, // 수정: 약 20분 (출력~발송~보관)
    ESIGN_TIME_HOURS: 0.05, // 수정: 약 3분 (문서 준비 및 발송)
    A4_PER_CONTRACT: 2,
    WORK_DAY_HOURS: 8,
    WORK_DAYS_PER_YEAR: 250, // 대략적인 연간 근무일수
};
