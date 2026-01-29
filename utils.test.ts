import { describe, it, expect } from 'vitest';
import { calculateROI } from './utils';
import { SimulationParams, CONSTANTS } from './types';

describe('calculateROI', () => {
    // 기본 테스트 케이스
    const defaultParams: SimulationParams = {
        contractCount: 10000,
        faceToFaceRatio: 50,
        annualOptionsCost: 0,
        targetCostPerUse: 800,
    };

    it('should calculate ROI correctly for default parameters', () => {
        const result = calculateROI(defaultParams);

        // 도입 전 비용 검증
        // Face: 60,000, Mail: 15,000
        // Avg Before (50%): 37,500
        const costFaceBefore = CONSTANTS.FACE_OUT_OF_POCKET_COST + (CONSTANTS.FACE_TIME_HOURS * CONSTANTS.HOURLY_WAGE);
        const costMailBefore = CONSTANTS.MAIL_OUT_OF_POCKET_COST + (CONSTANTS.MAIL_TIME_HOURS * CONSTANTS.HOURLY_WAGE);
        const expectedAvgCostBefore = (costFaceBefore * 0.5) + (costMailBefore * 0.5);
        expect(result.costBefore).toBeCloseTo(expectedAvgCostBefore);

        // 도입 전 총 비용: 37,500 * 10,000 = 375,000,000
        expect(result.totalBefore).toBeCloseTo(expectedAvgCostBefore * 10000);

        // 도입 후 총 비용: (800 + 0.05*30000) * 10,000 = 2,300 * 10,000 = 23,000,000
        const expectedTotalAfter = (800 + (CONSTANTS.ESIGN_TIME_HOURS * CONSTANTS.HOURLY_WAGE)) * 10000;
        expect(result.totalAfter).toBeCloseTo(expectedTotalAfter);

        // 절감액 (운영 비용 절감)
        // 684,150,000 - 8,000,000(사용료) = 676,150,000
        const expectedSavingAmount = result.totalBefore - expectedTotalAfter;
        expect(result.savingAmount).toBeCloseTo(expectedSavingAmount);

        // 순수 절감액
        // 676,150,000 - 8,000,000(구독료) = 668,150,000
        expect(result.netSaving).toBeCloseTo(expectedSavingAmount);

        expect(result.roiPercent).toBeGreaterThan(0);
    });

    it('should handle zero totalAfter', () => {
        const params = { ...defaultParams, targetCostPerUse: 0, annualOptionsCost: 0 };
        const result = calculateROI(params);
        expect(result.roiPercent).toBe(0); // 분모가 0일 때 0 반환 확인
        expect(result.paybackDays).toBe(0);
    });

    it('should calculate ESG stats correctly', () => {
        const result = calculateROI(defaultParams);
        // A4: 10,000 * 2 = 20,000
        expect(result.paperSaved).toBe(20000);
        // Trees: 20,000 * 0.00036 = 7.2
        expect(result.treesSaved).toBeCloseTo(7.2);
    });
});
