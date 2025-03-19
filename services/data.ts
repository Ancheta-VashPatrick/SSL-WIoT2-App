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

export function removeDuplicates(
  input: DataElement[],
  maxItems: number
): DataElement[] {
  let result: DataElement[] = [];
  input.forEach((item) => {
    // console.log(item, result.filter((pastItem) => pastItem.date == item.date));
    if (result.filter((pastItem) => pastItem.date == item.date).length == 0) {
      let i = 0;
      while (
        new Date(input[i].date).getTime() < new Date(item.date).getTime()
      ) {
        i++;
      }
      result.splice(i, 1, item);
      if (result.length > maxItems) {
        result.shift();
      }
    }
  });

  return result;
}
