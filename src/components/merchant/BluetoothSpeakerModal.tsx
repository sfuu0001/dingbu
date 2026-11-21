import React, { useState, useEffect } from 'react';
import { Bluetooth, X, Battery, Check, Volume2, Radio } from 'lucide-react';
import {
  globalBluetoothAudio,
  BluetoothAudioConfig,
  BluetoothSpeakerDevice
} from '../../utils/bluetoothAudioEngine';

interface BluetoothSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const BluetoothSpeakerModal: React.FC<BluetoothSpeakerModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [devices, setDevices] = useState<BluetoothSpeakerDevice[]>(() => globalBluetoothAudio.getDevices());
  const [config, setConfig] = useState<BluetoothAudioConfig>(() => globalBluetoothAudio.getConfig());

  useEffect(() => {
    const sync = () => {
      setDevices(globalBluetoothAudio.getDevices());
      setConfig(globalBluetoothAudio.getConfig());
    };
    window.addEventListener('obsidian_bluetooth_speaker_changed', sync);
    return () => window.removeEventListener('obsidian_bluetooth_speaker_changed', sync);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-xl overflow-hidden text-[11px] text-[var(--sc-ink-strong)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="流动餐车蓝牙音箱管理"
      >
        <div className="px-4 py-3 border-b border-[var(--sc-line-soft)] flex items-center justify-between bg-[var(--sc-surface-raised)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary)] text-white flex items-center justify-center">
              <Bluetooth className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[13px]">蓝牙外放广播音箱协同</div>
              <div className="text-[10.5px] text-[var(--sc-ink-body)]">支持系统语音专属通道隔离路由</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-muted)] hover:text-[var(--sc-ink-strong)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[var(--sc-ink-body)]">可用蓝牙外放设备</div>
            {devices.map((dev) => {
              const isConnected = dev.status === 'connected';
              return (
                <div
                  key={dev.id}
                  className={`p-3 rounded-[var(--sc-radius-sm)] border flex items-center justify-between gap-2 ${
                    isConnected
                      ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)]/60'
                      : 'border-[var(--sc-line-soft)] bg-white'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{dev.name}</span>
                      {isConnected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-[var(--sc-radius-xs)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border border-[var(--sc-brand-primary)]/30 font-bold">
                          已连接
                        </span>
                      )}
                    </div>
                    <div className="text-[10.5px] text-[var(--sc-ink-body)] mt-0.5 flex items-center gap-2">
                      <span>{dev.brandModel}</span>
                      <span className="inline-flex items-center gap-0.5 tabular-nums font-semibold">
                        <Battery className="w-3 h-3 text-[var(--sc-brand-primary)]" />
                        {dev.batteryLevel}%
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isConnected) {
                        globalBluetoothAudio.disconnectDevice();
                        showToast(`已断开蓝牙音箱：${dev.name}`);
                      } else {
                        globalBluetoothAudio.connectDevice(dev.id);
                        showToast(`已连接蓝牙音箱：${dev.name}`);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] font-bold border cursor-pointer transition ${
                      isConnected
                        ? 'bg-white border-[var(--sc-line-strong)] text-[var(--sc-ink-body)] hover:bg-[var(--sc-surface-alt)]'
                        : 'bg-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)] text-white hover:bg-[#00527a]'
                    }`}
                  >
                    {isConnected ? '断开' : '连接'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--sc-line-soft)] space-y-2">
            <div className="text-[11px] font-bold text-[var(--sc-ink-body)]">音频通道隔离策略</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  globalBluetoothAudio.setRoutingMode('voice_only');
                  showToast('已切换为仅系统语音专属通道');
                }}
                className={`p-2.5 rounded-[var(--sc-radius-sm)] border text-left cursor-pointer ${
                  config.routingMode === 'voice_only'
                    ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold'
                    : 'border-[var(--sc-line-soft)] bg-white text-[var(--sc-ink-body)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" />
                    仅系统语音
                  </span>
                  {config.routingMode === 'voice_only' && <Check className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />}
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  globalBluetoothAudio.setRoutingMode('unified');
                  showToast('已切换为统一混合播放模式');
                }}
                className={`p-2.5 rounded-[var(--sc-radius-sm)] border text-left cursor-pointer ${
                  config.routingMode === 'unified'
                    ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold'
                    : 'border-[var(--sc-line-soft)] bg-white text-[var(--sc-ink-body)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    统一混合外放
                  </span>
                  {config.routingMode === 'unified' && <Check className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-[var(--sc-surface-raised)] border-t border-[var(--sc-line-soft)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary)] text-white font-bold cursor-pointer hover:bg-[#00527a]"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
