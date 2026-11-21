import { getAllTruckConfigs, saveAllTruckConfigs } from './truckLocationEngine';

export async function renameTruck(
  truckId: string,
  payload: { name: string; address?: string },
  _operatorPhone?: string
): Promise<{ ok: boolean; message?: string }> {
  const cleanName = payload.name.trim();
  if (!cleanName) {
    return { ok: false, message: '门店名称不能为空' };
  }

  const list = getAllTruckConfigs();
  const idx = list.findIndex((t) => t.id === truckId);
  if (idx === -1) {
    return { ok: false, message: '未找到指定餐车' };
  }

  const updated = [...list];
  updated[idx] = {
    ...updated[idx],
    name: cleanName,
    shortName: cleanName.split(' · ')[0] || cleanName,
    address: payload.address?.trim() ?? updated[idx].address
  };
  saveAllTruckConfigs(updated);
  return { ok: true };
}

export async function createTruck(
  payload: { name: string; address?: string },
  _operatorPhone?: string
): Promise<{ ok: boolean; truckId?: string; message?: string }> {
  const cleanName = payload.name.trim();
  if (!cleanName) {
    return { ok: false, message: '请填写门店名称' };
  }

  const list = getAllTruckConfigs();
  const nextNum = String(list.length + 1).padStart(2, '0');
  const truckId = `truck-${nextNum}-${Date.now().toString(36).slice(-4)}`;

  const nextList = [
    ...list,
    {
      id: truckId,
      name: cleanName,
      shortName: cleanName.split(' · ')[0] || cleanName,
      address: payload.address?.trim() || '',
      status: 'active'
    }
  ];
  saveAllTruckConfigs(nextList);
  return { ok: true, truckId };
}
