export interface DataElement {
  date: Date;
  value: number;
}

export function generateSinusGraphData(length: number): DataElement[] {
  return Array<number>(length)
    .fill(0)
    .map((_, index) => ({
      date: new Date(index + 969900040040),
      value: Math.sin(index),
    }));
}

export function fromList(a): DataElement[] {
  return Array<number>(a.length)
    .fill(0)
    .map((_, index) => ({
      date: new Date(a[index].date),
      value: a[index].value,
    }));
}
