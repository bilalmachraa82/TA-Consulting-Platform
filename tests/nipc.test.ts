import { test } from 'vitest';
import assert from 'node:assert/strict';

import { normalizeNipc, isValidNipc, nipcCategory } from '@/lib/nipc';

test('isValidNipc accepts checksum-valid NIPCs', () => {
    assert.equal(isValidNipc('500697256'), true);
    assert.equal(isValidNipc('509442013'), true);
    // check digit 0 (remainder branch 11 - r >= 10)
    assert.equal(isValidNipc('501442600'), true);
    assert.equal(isValidNipc('504426290'), true);
});

test('isValidNipc rejects wrong check digit', () => {
    assert.equal(isValidNipc('500697255'), false);
    assert.equal(isValidNipc('500697250'), false);
});

test('isValidNipc rejects malformed input', () => {
    assert.equal(isValidNipc(''), false);
    assert.equal(isValidNipc('12345678'), false);
    assert.equal(isValidNipc('1234567890'), false);
    assert.equal(isValidNipc('abcdefghi'), false);
});

test('normalizeNipc strips common export artifacts', () => {
    assert.equal(normalizeNipc(' 500697256 '), '500697256');
    assert.equal(normalizeNipc('PT500697256'), '500697256');
    assert.equal(normalizeNipc('pt 500697256'), '500697256');
    assert.equal(normalizeNipc('500 697 256'), '500697256');
    assert.equal(normalizeNipc('500-697-256'), '500697256');
    // Excel float artifact from CSV round-trips
    assert.equal(normalizeNipc('500697256.0'), '500697256');
});

test('normalizeNipc returns null when nothing usable remains', () => {
    assert.equal(normalizeNipc(''), null);
    assert.equal(normalizeNipc('   '), null);
    assert.equal(normalizeNipc('n/a'), null);
});

test('nipcCategory distinguishes coletivas from singulares', () => {
    assert.equal(nipcCategory('500697256'), 'COLETIVA');
    assert.equal(nipcCategory('601234565'), 'COLETIVA');
    // checksum-valid but a personal NIF, not a company
    assert.equal(nipcCategory('123456789'), 'SINGULAR');
    assert.equal(nipcCategory('901234567'), 'OUTRO');
});
