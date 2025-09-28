// @ts-nocheck

/**
 * Calculates the sum of two numbers.
 *
 * @param first - First operand.
 * @param second - Second operand.
 * @returns The computed sum.
 */
export const exampleSum = (first, second) => first + second;

/**
 * Sums every entry in a numeric list.
 *
 * @param values - Numbers to combine.
 * @returns The combined total.
 */
export const exampleSumList = (values) =>
    values.reduce((total, value) => total + value, 0);

export const example = {
    exampleSum,
    exampleSumList,
};
