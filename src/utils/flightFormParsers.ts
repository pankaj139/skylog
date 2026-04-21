/**
 * Shared parsers for optional cost / passenger fields on flight forms.
 */

/**
 * Parses optional non-negative rupee or points amount from a string field.
 *
 * @param raw - User input
 * @returns Parsed integer or undefined if blank; `invalid` true if non-empty but not a valid number
 */
export function parseOptionalMoneyOrPoints(raw: string): { value: number | undefined; invalid: boolean } {
    const t = raw.trim();
    if (!t) return { value: undefined, invalid: false };
    const n = Number(t);
    if (Number.isNaN(n) || n < 0) return { value: undefined, invalid: true };
    return { value: Math.round(n), invalid: false };
}

/**
 * Parses passenger / seat count (minimum 1).
 *
 * @param raw - User input; empty or invalid defaults to 1
 */
export function parsePassengerCount(raw: string): number {
    const t = raw.trim();
    if (!t) return 1;
    const n = parseInt(t, 10);
    if (Number.isNaN(n) || n < 1) return 1;
    return Math.min(999, n);
}
