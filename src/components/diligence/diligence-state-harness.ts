type StateSetter<T> = (value: T | ((current: T) => T)) => void;

let cursor = 0;
let values: unknown[] = [];

export function beginDiligenceRender() {
  cursor = 0;
}

export function resetDiligenceState() {
  cursor = 0;
  values = [];
}

export function diligenceStateSnapshot() {
  return [...values];
}

export function useState<T>(initial: T): [T, StateSetter<T>] {
  const index = cursor;
  cursor += 1;

  if (index >= values.length) {
    values[index] = initial;
  }

  const setValue: StateSetter<T> = (value) => {
    const current = values[index] as T;
    values[index] = typeof value === "function"
      ? (value as (current: T) => T)(current)
      : value;
  };

  return [values[index] as T, setValue];
}
