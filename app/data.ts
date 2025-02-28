import { Element } from "@/components/ChartView";

export function generateSinusGraphData(length: number): Element[] {
    return Array<number>(length)
      .fill(0)
      .map((_, index) => ({
        date: new Date(index + 969900040040),
        value: Math.sin(index),
      }))
  }

  export function fromList(a): Element[] {
    return Array<number>(a.length)
      .fill(0)
      .map((_, index) => ({
        date: new Date(a[index].date),
        value: a[index].value,
      }))
  }