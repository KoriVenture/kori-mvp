export function cache<Args extends readonly unknown[], Result>(
  operation: (...args: Args) => Result,
): (...args: Args) => Result {
  const entries: Array<{ args: Args; result: Result }> = [];

  return (...args: Args) => {
    const existing = entries.find((entry) =>
      entry.args.length === args.length &&
      entry.args.every((value, index) => Object.is(value, args[index])));

    if (existing) return existing.result;

    const result = operation(...args);
    entries.push({ args, result });
    return result;
  };
}
