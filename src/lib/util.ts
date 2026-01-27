export function remap(
  value: number,
  lowIn: number,
  highIn: number,
  lowOut: number,
  highOut: number
): number {
  return lowOut + (value - lowIn) * ((highOut - lowOut) / (highIn - lowIn));
}
