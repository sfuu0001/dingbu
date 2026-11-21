export type AudioRoutingMode = 'voice_only' | 'unified';

export interface BluetoothSpeakerDevice {
  id: string;
  name: string;
  brandModel: string;
  status: 'connected' | 'disconnected';
  batteryLevel: number;
  signalStrength?: number;
}

export interface BluetoothAudioConfig {
  routingMode: AudioRoutingMode;
  activeDeviceId: string | null;
  autoReconnect: boolean;
}

const BT_STORAGE_KEY = 'urbanradar_bt_audio_config_v2';

const DEVICES: BluetoothSpeakerDevice[] = [
  {
    id: 'bt-jbl-01',
    name: '餐车前窗播报音箱 #1',
    brandModel: 'JBL Charge 5 工控抗噪版',
    status: 'connected',
    batteryLevel: 86,
    signalStrength: 94
  },
  {
    id: 'bt-bose-02',
    name: '后厨备餐协同音箱 #2',
    brandModel: 'Bose SoundLink Flex',
    status: 'disconnected',
    batteryLevel: 72,
    signalStrength: 78
  }
];

let config: BluetoothAudioConfig = {
  routingMode: 'voice_only',
  activeDeviceId: 'bt-jbl-01',
  autoReconnect: true
};

try {
  const raw = localStorage.getItem(BT_STORAGE_KEY);
  if (raw) config = { ...config, ...JSON.parse(raw) };
} catch {
  // ignore
}

function emitBtChange() {
  try {
    localStorage.setItem(BT_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('obsidian_bluetooth_speaker_changed', { detail: config }));
  }
}

export const globalBluetoothAudio = {
  getConfig(): BluetoothAudioConfig {
    return config;
  },
  getDevices(): BluetoothSpeakerDevice[] {
    return DEVICES.map((d) => ({
      ...d,
      status: d.id === config.activeDeviceId ? 'connected' : 'disconnected'
    }));
  },
  getActiveDevice(): BluetoothSpeakerDevice | null {
    if (!config.activeDeviceId) return null;
    const found = DEVICES.find((d) => d.id === config.activeDeviceId);
    return found ? { ...found, status: 'connected' } : null;
  },
  connectDevice(deviceId: string): void {
    config = { ...config, activeDeviceId: deviceId };
    emitBtChange();
  },
  disconnectDevice(): void {
    config = { ...config, activeDeviceId: null };
    emitBtChange();
  },
  setRoutingMode(mode: AudioRoutingMode): void {
    config = { ...config, routingMode: mode };
    emitBtChange();
  }
};
