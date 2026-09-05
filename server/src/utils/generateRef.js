// Generate unique human-readable references, e.g. SM-BOK-8F2K9A
export function generateRef(prefix = 'SM') {
  const rand = () => Math.random().toString(36).toUpperCase().slice(2, 8);
  return `${prefix}-${rand()}`;
}