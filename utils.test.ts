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
        aiAssistantEnabled: false,
        templateCount: 10,
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
        const expectedSavingAmount = result.totalBefore - expectedTotalAfter;
        expect(result.savingAmount).toBeCloseTo(expectedSavingAmount);

        // AI비서 비활성화 시 AI 절감액은 0
        expect(result.aiTemplateSaving).toBe(0);
        expect(result.aiErrorSaving).toBe(0);
        expect(result.aiTotalSaving).toBe(0);

        // 순수 절감액 = savingAmount + 0 (AI 비활성)
        expect(result.netSaving).toBeCloseTo(expectedSavingAmount);

        expect(result.roiPercent).toBeGreaterThan(0);
    });

    it('should handle zero service fees but include labor', () => {
        const params = { ...defaultParams, targetCostPerUse: 0, annualOptionsCost: 0 };
        const result = calculateROI(params);
        // Before: 37,500, After: 1,500 (Labor only)
        // ROI: (37,500 - 1,500) / 1,500 * 100 = 2,400%
        expect(result.roiPercent).toBeCloseTo(2396.67, 1);
    });

    it('should calculate ESG stats correctly', () => {
        const result = calculateROI(defaultParams);
        // A4: 10,000 * 2 = 20,000 + envelope(5,000) = 25,000
        expect(result.paperSaved).toBe(25000);
        // Trees: 25,000 * 0.00036 = 9
        expect(result.treesSaved).toBeCloseTo(9);
    });

    // AI비서 관련 테스트
    describe('AI Assistant', () => {
        const aiParams: SimulationParams = {
            ...defaultParams,
            aiAssistantEnabled: true,
            templateCount: 10,
        };

        it('should calculate template setup savings when AI is enabled', () => {
            const result = calculateROI(aiParams);

            // 연간 서식 수: 10건/월 * 12 = 120건
            // 서식 설정 절감: 120 * (0.5 - 0.05) * 30000 = 120 * 0.45 * 30000 = 1,620,000
            const expectedTemplateSaving = 120 * (CONSTANTS.TEMPLATE_SETUP_TIME_HOURS - CONSTANTS.AI_TEMPLATE_SETUP_TIME_HOURS) * CONSTANTS.HOURLY_WAGE;
            expect(result.aiTemplateSaving).toBeCloseTo(expectedTemplateSaving);
        });

        it('should calculate error reduction savings when AI is enabled', () => {
            const result = calculateROI(aiParams);

            // 오류 재작업 절감: 10000 * 0.05 * 0.25 * 30000 * 0.8 = 3,000,000
            const expectedErrorSaving = 10000 * CONSTANTS.ERROR_REWORK_RATE * CONSTANTS.ERROR_REWORK_TIME_HOURS * CONSTANTS.HOURLY_WAGE * CONSTANTS.AI_ERROR_REDUCTION_RATE;
            expect(result.aiErrorSaving).toBeCloseTo(expectedErrorSaving);
        });

        it('should include AI savings in netSaving', () => {
            const resultWithAI = calculateROI(aiParams);
            const resultWithoutAI = calculateROI({ ...aiParams, aiAssistantEnabled: false });

            // AI 활성화 시 netSaving이 더 커야 함
            expect(resultWithAI.netSaving).toBeGreaterThan(resultWithoutAI.netSaving);

            // 차이 = aiTotalSaving
            expect(resultWithAI.netSaving - resultWithoutAI.netSaving).toBeCloseTo(resultWithAI.aiTotalSaving);
        });

        it('should have zero AI savings when disabled', () => {
            const result = calculateROI({ ...aiParams, aiAssistantEnabled: false });
            expect(result.aiTemplateSaving).toBe(0);
            expect(result.aiErrorSaving).toBe(0);
            expect(result.aiTotalSaving).toBe(0);
            expect(result.aiTimeSavedHours).toBe(0);
        });
    });
});

