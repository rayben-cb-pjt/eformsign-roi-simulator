export interface SimulationParams {
    contractCount: number;
    faceToFaceRatio: number; // 0에서 100 사이
    annualOptionsCost: number;
    targetCostPerUse: number;
    aiAssistantEnabled: boolean;  // AI비서 사용 여부
    templateCount: number;        // 월간 신규 서식 등록 건수
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
    // AI비서 관련
    aiTemplateSaving: number;   // 서식 설정 시간 절감 (원)
    aiErrorSaving: number;      // 오류 재작업 절감 (원)
    aiTotalSaving: number;      // AI비서 총 절감 (원)
    aiTimeSavedHours: number;   // AI비서 절감 시간 (시간)
}

export const CONSTANTS = {
    FACE_OUT_OF_POCKET_COST: 15000, // 원 (KRW) - 교통/식대 등 실비
    MAIL_OUT_OF_POCKET_COST: 5000,  // 원 (KRW) - 등기/우편 자재비
    FACE_TIME_HOURS: 1.5, // 1시간 30분 (대면/이동 포함)
    MAIL_TIME_HOURS: 0.33, // 약 20분 (출력~발송~보관)
    ESIGN_TIME_HOURS: 0.05, // 약 3분 (전자문서 준비/발송)
    HOURLY_WAGE: 30000, // 시간당 인건비
    A4_PER_CONTRACT: 2,
    WORK_DAY_HOURS: 8,
    WORK_DAYS_PER_YEAR: 250, // 대략적인 연간 근무일수
    // AI비서 관련
    TEMPLATE_SETUP_TIME_HOURS: 0.5,     // 서식 1건 수동 설정 시간 (30분)
    AI_TEMPLATE_SETUP_TIME_HOURS: 0.05, // AI비서 사용 시 서식 설정 시간 (3분, 90% 단축)
    ERROR_REWORK_RATE: 0.05,            // 수동 입력 시 오류율 5%
    ERROR_REWORK_TIME_HOURS: 0.25,      // 오류 수정 1건당 시간 (15분)
    AI_ERROR_REDUCTION_RATE: 0.8,       // AI비서로 오류 80% 감소
};
