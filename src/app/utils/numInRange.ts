const numInRange = (
  num: number,
  [ min = -Infinity, max = Infinity ]: [number, number] | [number] | [undefined, number] = [ -Infinity, Infinity ],
) => Math.min(Math.max(num, min), max)

export default numInRange
