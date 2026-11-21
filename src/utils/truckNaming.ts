import { getAllTruckConfigs } from './truckLocationEngine';

export function getUnifiedTruckName(
  target: { truckId?: string; truckName?: string; id?: string; name?: string } | string,
  format: 'short' | 'standard' | 'full' = 'standard'
): string {
  const id = typeof target === 'string' ? target : target.truckId || target.id || '';
  const fallbackName = typeof target === 'string' ? '' : target.truckName || target.name || '';

  const found = getAllTruckConfigs().find((t) => t.id === id);
  const full = found?.name || fallbackName || id || '01号旗舰餐车';
  const short = found?.shortName || full.split(' · ')[0] || full;

  if (format === 'short') return short;
  if (format === 'full') return full;
  return short;
}
