const { calculateSeverityScore, normalizeCategory, HIGH_RISK_CATEGORIES } = require('../src/services/gisService');

describe('GIS Service - Severity Score & Category Normalization', () => {
  test('normalizes category strings correctly', () => {
    expect(normalizeCategory('Deep Pothole on road')).toBe('pothole');
    expect(normalizeCategory('Open Manhole')).toBe('open_manhole');
    expect(normalizeCategory('Drinking Water Leak')).toBe('water_leak');
    expect(normalizeCategory('Broken Street Light')).toBe('broken_streetlight');
    expect(normalizeCategory('Garbage Dump')).toBe('garbage_overflow');
    expect(normalizeCategory('Dangerous Electric Wiring')).toBe('exposed_wiring');
    expect(normalizeCategory('Gas Leakage')).toBe('gas_leak');
  });

  test('calculates base severity score accurately (confirmation * 2 + days_pending * 0.5)', () => {
    const now = new Date();
    // 5 confirmations, 0 days pending, pothole (not high risk)
    const score = calculateSeverityScore(5, now, 'pothole');
    expect(score).toBe(10);
  });

  test('adds +50 floor bonus for high-risk life-safety categories', () => {
    const now = new Date();
    // 1 confirmation, 0 days pending, open_manhole (high risk) -> 1*2 + 0 + 50 = 52
    const scoreManhole = calculateSeverityScore(1, now, 'open_manhole');
    expect(scoreManhole).toBe(52);

    const scoreWiring = calculateSeverityScore(2, now, 'exposed_wiring');
    expect(scoreWiring).toBe(54);

    const scoreGas = calculateSeverityScore(3, now, 'gas_leak');
    expect(scoreGas).toBe(56);
  });

  test('factors in days pending correctly', () => {
    // 10 days ago, 4 confirmations, pothole -> 4*2 + 10*0.5 = 8 + 5 = 13
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000);
    const score = calculateSeverityScore(4, tenDaysAgo, 'pothole');
    expect(score).toBe(13);
  });
});
