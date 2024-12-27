export function getButtonStatesTextures(
  name: string,
  suffix = '',
): [normal: string, pressed: string, hover?: string, disabled?: string] {
  return [`${name}-normal${suffix}`, `${name}-pressed${suffix}`, `${name}-hover${suffix}`, `${name}-disabled${suffix}`];
}
