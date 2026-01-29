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
    daysBefore: number;
    daysAfter: number;
    daysSaved: number;
    paperSaved: number;
    treesSaved: number;
    co2Saved: number;
    waterSaved: number;
}

export const CONSTANTS = {
    FACE_OUT_OF_POCKET_COST: 15000, // 원 (KRW) - 교통비, 식대 등 실비
    MAIL_OUT_OF_POCKET_COST: 5000,  // 원 (KRW) - 우편료, 종이, 봉투 등 실비
    FACE_TIME_HOURS: 1.5, // 1시간 30분 (왕복 이동 포함)
    MAIL_TIME_HOURS: 0.33, // 약 20분 (출력~발송~보관)
    ESIGN_TIME_HOURS: 0.05, // 약 3분 (문서 준비 및 발송)
    HOURLY_WAGE: 30000, // 시간당 통상 임금 (담당자 인건비 계산용)
    A4_PER_CONTRACT: 2,
    WORK_DAY_HOURS: 8,
    WORK_DAYS_PER_YEAR: 250, // 대략적인 연간 근무일수
};
