import { describe, it, expect } from 'vitest';
import { calculateNPV, calculateIRR, calculatePaybackPeriod, calculateROI } from './core';

describe('Financial Core Module', () => {
    describe('calculateNPV', () => {
        it('should calculate NPV correctly for a standard cash flow', () => {
            const rate = 0.1; // 10%
            const cashFlows = [-1000, 500, 500, 500];
            // Year 0: -1000
            // Year 1: 500 / 1.1 = 454.54
            // Year 2: 500 / 1.21 = 413.22
            // Year 3: 500 / 1.331 = 375.65
            // Total: ~243.41
            const npv = calculateNPV(rate, cashFlows);
            expect(npv).toBeCloseTo(243.42, 1);
        });

        it('should return negative NPV for bad investment', () => {
            const rate = 0.1;
            const cashFlows = [-1000, 100, 100, 100];
            const npv = calculateNPV(rate, cashFlows);
            expect(npv).toBeLessThan(0);
        });
    });

    describe('calculateIRR', () => {
        it('should calculate IRR correctly', () => {
            const cashFlows = [-1000, 500, 500, 500];
            const irr = calculateIRR(cashFlows);
            // IRR should be approx 23.37%
            expect(irr).toBeCloseTo(0.2337, 3);
        });

        it('should throw error for non-converging flows', () => {
            const cashFlows = [100, 100]; // No negative flow
            expect(() => calculateIRR(cashFlows)).toThrow();
        });
    });

    describe('calculatePaybackPeriod', () => {
        it('should calculate payback correctly', () => {
            const cashFlows = [-1000, 500, 500, 500];
            // Recovers 500 in year 1 (remaining 500)
            // Recovers 500 in year 2 (remaining 0)
            // Payback = 2 years
            const payback = calculatePaybackPeriod(cashFlows);
            expect(payback).toBe(2);
        });

        it('should calculate fractional payback', () => {
            const cashFlows = [-1000, 500, 250, 500];
            // Year 1: 500 recovered (500 left)
            // Year 2: 250 recovered (250 left)
            // Year 3: 500 recovered (needs 250, so 0.5 year)
            // Total: 2.5 years
            const payback = calculatePaybackPeriod(cashFlows);
            expect(payback).toBe(2.5);
        });

        it('should return -1 if never recovers', () => {
            const cashFlows = [-1000, 100, 100];
            const payback = calculatePaybackPeriod(cashFlows);
            expect(payback).toBe(-1);
        });
    });
});
