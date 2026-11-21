import React, { useState } from 'react';
import { Eye, Smartphone, Monitor, QrCode, ExternalLink } from 'lucide-react';

export const CustomerPreviewControl: React.FC = () => {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'kiosk'>('mobile');
  const [liveSync, setLiveSync] = useState(true);

  return (
    <section className="bg-white border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-md)] p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />
          <span className="text-[11px] font-bold text-[var(--sc-ink-strong)]">客食端预览管控</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border border-[var(--sc-brand-primary)]/30 font-bold">
          {liveSync ? '实时联动' : '独立预览'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPreviewMode('mobile')}
          className={`p-2 rounded-[var(--sc-radius-sm)] border text-left cursor-pointer transition flex items-center justify-between ${
            previewMode === 'mobile'
              ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold'
              : 'border-[var(--sc-line-soft)] bg-white text-[var(--sc-ink-body)] hover:text-[var(--sc-ink-strong)]'
          }`}
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Smartphone className="w-3.5 h-3.5" />
            扫码点餐视图
          </span>
          <QrCode className="w-3 h-3 opacity-70" />
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('kiosk')}
          className={`p-2 rounded-[var(--sc-radius-sm)] border text-left cursor-pointer transition flex items-center justify-between ${
            previewMode === 'kiosk'
              ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold'
              : 'border-[var(--sc-line-soft)] bg-white text-[var(--sc-ink-body)] hover:text-[var(--sc-ink-strong)]'
          }`}
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Monitor className="w-3.5 h-3.5" />
            车前自提大屏
          </span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </button>
      </div>

      <label className="flex items-center justify-between text-[11px] text-[var(--sc-ink-body)] bg-[var(--sc-surface-sunken)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-sm)] px-2.5 py-1.5 cursor-pointer">
        <span>渠道开关改动即时同步客食端菜单状态</span>
        <input
          type="checkbox"
          checked={liveSync}
          onChange={(e) => setLiveSync(e.target.checked)}
          className="accent-[var(--sc-brand-primary)] cursor-pointer"
        />
      </label>
    </section>
  );
};
