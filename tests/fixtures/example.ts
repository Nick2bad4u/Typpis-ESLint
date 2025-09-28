/**
 * Calculates the total of every entry in a list.
 *
 * @param values - Numeric inputs to combine.
 * @returns The sum of the provided values.
 */
export const sumValues = (values: ReadonlyArray<number>): number =>
  values.reduce((total, value) => total + value, 0);

export interface Person {
  age: number;
  name: string;
}

export const createPerson = (name: string, age: number): Person => ({
  age,
  name,
});
