import React, { useState } from 'react';
import {
  X,
  Command,
  Megaphone,
  Crown,
  Lock,
  Unlock,
  Power,
  ArrowRightLeft,
  Smartphone,
  SlidersHorizontal,
  MessageSquareText,
  Cloud,
  Trash2,
  RotateCcw,
  Check,
  Search
} from 'lucide-react';
import { MerchantTab, TabItemConfig } from './MerchantSidebar';
import { BusinessStatusConfig, updateTruckBusinessDetails } from '../../utils/businessStatusEngine';
import { DEMO_SESSIONS, MerchantSession, maskPhoneNumber } from '../../utils/staffAndRiderAuthEngine';
import { FranchiseDishPolicy } from '../../types/franchise';
import { voiceAlerts, unlockAudioContext } from '../../utils/voiceAlertEngine';

interface CommandPaletteModalProps {
  open: boolean;
  onClose: () => void;
  tabs: TabItemConfig[];
  onSelectTab: (id: MerchantTab) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  open,
  onClose,
  tabs,
  onSelectTab
}) => {
  const [query, setQuery] = useState('');
  if (!open) return null;

  const filtered = tabs.filter(
    (t) =>
      t.label.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase()) ||
      t.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/45 backdrop-blur-[2px] flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-2xl overflow-hidden text-[12px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="战术指令中枢"
      >
        <div className="px-3.5 py-2.5 border-b border-[var(--sc-line-soft)] flex items-center gap-2 bg-[var(--sc-surface-raised)]">
          <Command className="w-4 h-4 text-[var(--sc-brand-primary)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入模块名称、分类或功能编号快速穿梭..."
            className="flex-1 bg-transparent outline-none text-[12px] text-[var(--sc-ink-strong)] placeholder:text-[var(--sc-ink-muted)]"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-[var(--sc-radius-xs)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)] border border-[var(--sc-line-soft)] cursor-pointer font-semibold"
          >
            ESC
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filtered.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectTab(tab.id);
                  onClose();
                }}
                className="w-full px-3 py-2 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-brand-primary-soft)] flex items-center justify-between text-left cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[var(--sc-ink-body)] group-hover:text-[var(--sc-brand-primary)]" />
                  <span className="font-bold text-[var(--sc-ink-strong)]">{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[var(--sc-radius-xs)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)]">
                    {tab.category}
                  </span>
                </div>
                <span className="text-[10px] tabular-nums font-mono text-[var(--sc-ink-muted)]">{tab.id}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-[var(--sc-ink-muted)]">未匹配到对应功能模块</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface QuickCallModalProps {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const QuickCallModal: React.FC<QuickCallModalProps> = ({ open, onClose, showToast }) => {
  const [ticketNo, setTicketNo] = useState('P08');
  const [targetZone, setTargetZone] = useState('餐车取餐窗口');

  if (!open) return null;

  const triggerBroadcast = async () => {
    await unlockAudioContext();
    voiceAlerts.callingGuest(ticketNo || 'P08', targetZone);
    showToast(`📢 正在全域播报：请 ${ticketNo || 'P08'} 号顾客到${targetZone}取餐`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-2xl overflow-hidden text-[12px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="全域即时叫号广播小窗"
      >
        <div className="px-4 py-3 border-b border-[var(--sc-line-soft)] flex items-center justify-between bg-[#FFF8EB]">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--sc-ink-strong)]">
            <Megaphone className="w-4 h-4 text-[var(--sc-state-warn)]" />
            <span>全域即时叫号广播</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-chip)] cursor-pointer text-[var(--sc-ink-body)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[var(--sc-ink-body)] mb-1">取餐号 / 桌号</label>
            <input
              type="text"
              value={ticketNo}
              onChange={(e) => setTicketNo(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] bg-white text-[14px] tabular-nums font-bold text-[var(--sc-ink-strong)] outline-none focus:border-[var(--sc-brand-primary)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--sc-ink-body)] mb-1">播报点位</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['餐车取餐窗口', '恒温自提柜', '骑手专属取餐区', '露天堂食区'].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setTargetZone(z)}
                  className={`px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] border text-left cursor-pointer transition ${
                    targetZone === z
                      ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold'
                      : 'border-[var(--sc-line-soft)] bg-white text-[var(--sc-ink-strong)] hover:bg-[var(--sc-surface-raised)]'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 py-2.5 bg-[var(--sc-surface-raised)] border-t border-[var(--sc-line-soft)] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-strong)] bg-white text-[var(--sc-ink-body)] hover:bg-[var(--sc-surface-alt)] cursor-pointer font-semibold"
          >
            取消
          </button>
          <button
            type="button"
            onClick={triggerBroadcast}
            className="px-4 py-1.5 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary)] hover:bg-[#00527A] text-white font-bold border border-[var(--sc-brand-primary)] cursor-pointer shadow-xs"
          >
            立即喊号广播
          </button>
        </div>
      </div>
    </div>
  );
};

interface FranchiseHQModalProps {
  open: boolean;
  onClose: () => void;
  policies: FranchiseDishPolicy[];
  onToggleLock: (id: string) => void;
  isHqUser: boolean;
  onToggleRoleMode: () => void;
}

export const FranchiseHQModal: React.FC<FranchiseHQModalProps> = ({
  open,
  onClose,
  policies,
  onToggleLock,
  isHqUser,
  onToggleRoleMode
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-2xl overflow-hidden text-[12px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="加盟商与HQ爆品中枢"
      >
        <div className="px-4 py-3 border-b border-[var(--sc-line-soft)] flex items-center justify-between bg-[var(--sc-surface-raised)]">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--sc-ink-strong)]">
            <Crown className="w-4 h-4 text-[var(--sc-state-warn)]" />
            <span>特许加盟与总部爆品锁定中枢</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] cursor-pointer text-[var(--sc-ink-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="p-3 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-[var(--sc-surface-raised)] flex items-center justify-between gap-2">
            <div>
              <div className="font-bold text-[var(--sc-ink-strong)]">
                当前租户视角：{isHqUser ? '品牌总部 HQ (全部餐车)' : '特许加盟商沙箱 (仅限管辖车辆)'}
              </div>
              <div className="text-[11px] text-[var(--sc-ink-body)] mt-0.5">
                可切换视角体验顶部店铺胶囊「HQ总部 / 加盟沙箱」权限隔离
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleRoleMode}
              className="px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-brand-primary)]/40 bg-[var(--sc-brand-primary-soft)] hover:bg-[#DCEDF8] text-[var(--sc-brand-primary)] font-bold cursor-pointer shrink-0"
            >
              切换视角
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-[var(--sc-ink-strong)]">核心爆品全国强锁定清单</div>
            {policies.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-white flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[var(--sc-ink-strong)]">{p.dishName}</div>
                  <div className="text-[10.5px] text-[var(--sc-ink-body)] tabular-nums">
                    {p.category} · 统一指导价 ¥{p.basePrice}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleLock(p.id)}
                  className={`px-2.5 py-1 rounded-[var(--sc-radius-sm)] border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                    p.isHqLocked
                      ? 'bg-[#FFF8EB] border-[var(--sc-state-warn)]/40 text-[var(--sc-state-warn)]'
                      : 'bg-[var(--sc-surface-raised)] border-[var(--sc-line-soft)] text-[var(--sc-ink-body)]'
                  }`}
                >
                  {p.isHqLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  {p.isHqLocked ? 'HQ已强锁' : '允许改价'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface BusinessStatusDetailedModalProps {
  open: boolean;
  onClose: () => void;
  truckId: string;
  truckName: string;
  status: BusinessStatusConfig;
  showToast: (msg: string) => void;
}

export const BusinessStatusDetailedModal: React.FC<BusinessStatusDetailedModalProps> = ({
  open,
  onClose,
  truckId,
  truckName,
  status,
  showToast
}) => {
  const [reason, setReason] = useState(status.closeReason || '临时补货中');
  const [resumeTime, setResumeTime] = useState(status.resumeTime || '17:30');

  if (!open) return null;

  const handleSave = (nextOpen: boolean) => {
    updateTruckBusinessDetails(truckId, {
      isOpen: nextOpen,
      closeReason: nextOpen ? undefined : reason,
      resumeTime: nextOpen ? undefined : resumeTime
    });
    showToast(nextOpen ? `🟢 【${truckName}】已恢复全渠道营业` : `🔴 【${truckName}】已设定临时打烊：${reason}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-2xl overflow-hidden text-[12px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="营业状态与渠道详细配置"
      >
        <div className="px-4 py-3 border-b border-[var(--sc-line-soft)] flex items-center justify-between bg-[var(--sc-surface-raised)]">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--sc-ink-strong)]">
            <Power className={`w-4 h-4 ${status.isOpen ? 'text-[var(--sc-brand-primary)]' : 'text-[var(--sc-state-danger)]'}`} />
            <span>营业状态与打烊恢复配置</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] cursor-pointer text-[var(--sc-ink-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="p-2.5 rounded-[var(--sc-radius-sm)] bg-[var(--sc-surface-raised)] border border-[var(--sc-line-soft)] flex items-center justify-between">
            <span className="font-bold text-[var(--sc-ink-strong)]">{truckName}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                status.isOpen
                  ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/35'
                  : 'bg-[#FDECEC] text-[var(--sc-state-danger)] border-[var(--sc-state-danger)]/40'
              }`}
            >
              {status.isOpen ? '营业接单中' : '已打烊'}
            </span>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--sc-ink-body)] mb-1">打烊原因预设（顾客端公告展示）</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-1.5 border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] bg-white text-[var(--sc-ink-strong)] outline-none focus:border-[var(--sc-brand-primary)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--sc-ink-body)] mb-1">预计恢复营业时间</label>
            <input
              type="time"
              value={resumeTime}
              onChange={(e) => setResumeTime(e.target.value)}
              className="w-full px-3 py-1.5 border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] bg-white text-[var(--sc-ink-strong)] tabular-nums outline-none focus:border-[var(--sc-brand-primary)]"
            />
          </div>
        </div>

        <div className="px-4 py-2.5 bg-[var(--sc-surface-raised)] border-t border-[var(--sc-line-soft)] flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-3 py-1.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-state-danger)]/45 bg-[#FDECEC] text-[var(--sc-state-danger)] font-bold cursor-pointer hover:bg-[#FADADA]"
          >
            设为暂停打烊
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-3 py-1.5 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary)] text-white font-bold cursor-pointer hover:bg-[#00527A]"
          >
            恢复正常营业
          </button>
        </div>
      </div>
    </div>
  );
};

interface PhoneAuthModalProps {
  open: boolean;
  onClose: () => void;
  currentSession: MerchantSession | null;
  onSelectSession: (s: MerchantSession) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  open,
  onClose,
  currentSession,
  onSelectSession
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-2xl overflow-hidden text-[12px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="切换当班员工账号"
      >
        <div className="px-4 py-3 border-b border-[var(--sc-line-soft)] flex items-center justify-between bg-[var(--sc-surface-raised)]">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--sc-ink-strong)]">
            <Smartphone className="w-4 h-4 text-[var(--sc-brand-primary)]" />
            <span>切换当班员工账号</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] cursor-pointer text-[var(--sc-ink-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {DEMO_SESSIONS.map((s) => {
            const active = currentSession?.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectSession(s);
                  onClose();
                }}
                className={`w-full p-3 rounded-[var(--sc-radius-sm)] border text-left flex items-center justify-between cursor-pointer transition ${
                  active
                    ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] shadow-[0_0_0_2px_var(--sc-brand-glow)]'
                    : 'border-[var(--sc-line-soft)] bg-white hover:bg-[var(--sc-surface-raised)]'
                }`}
              >
                <div>
                  <div className="font-bold text-[var(--sc-ink-strong)] flex items-center gap-2">
                    <span>{s.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-[var(--sc-radius-xs)] border font-bold ${
                        s.scope === 'all'
                          ? 'bg-[#FFF8EB] text-[var(--sc-state-warn)] border-[var(--sc-state-warn)]/40'
                          : 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/35'
                      }`}
                    >
                      {s.scope === 'all' ? '总部账号' : '本店账号'}
                    </span>
                  </div>
                  <div className="text-[11px] tabular-nums text-[var(--sc-ink-body)] mt-0.5">
                    {maskPhoneNumber(s.phone)} · {s.hardwareBound ? '已绑定设备指纹' : '临时授权'}
                  </div>
                </div>
                {active && <Check className="w-4 h-4 text-[var(--sc-brand-primary)]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface SimpleInfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kind: 'shift' | 'hardware' | 'message' | 'cloud' | 'recycle';
  recycleBinCount?: number;
  onRestoreAll?: () => void;
  showToast: (msg: string) => void;
}

export const SimpleUtilityModal: React.FC<SimpleInfoModalProps> = ({
  open,
  onClose,
  title,
  kind,
  recycleBinCount = 0,
  onRestoreAll,
  showToast
}) => {
  if (!open) return null;

  const Icon =
    kind === 'shift'
      ? ArrowRightLeft
      : kind === 'hardware'
      ? SlidersHorizontal
      : kind === 'message'
      ? MessageSquareText
      : kind === 'cloud'
      ? Cloud
      : Trash2;

  return (
    <div
      className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-2xl overflow-hidden text-[12px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="px-4 py-3 border-b border-[var(--sc-line-soft)] flex items-center justify-between bg-[var(--sc-surface-raised)]">
          <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--sc-ink-strong)]">
            <Icon className="w-4 h-4 text-[var(--sc-brand-primary)]" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] cursor-pointer text-[var(--sc-ink-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 text-[var(--sc-ink-body)]">
          {kind === 'shift' && (
            <>
              <div className="p-3 rounded-[var(--sc-radius-sm)] bg-[var(--sc-surface-raised)] border border-[var(--sc-line-soft)] space-y-1">
                <div className="flex justify-between">
                  <span>本班实收总额</span>
                  <span className="tabular-nums font-bold text-[var(--sc-ink-strong)]">¥ 4,862.50</span>
                </div>
                <div className="flex justify-between">
                  <span>堂食 / 外卖 / 自提</span>
                  <span className="tabular-nums font-medium text-[var(--sc-ink-strong)]">38 / 54 / 29 单</span>
                </div>
                <div className="flex justify-between">
                  <span>异常退单金额</span>
                  <span className="tabular-nums font-bold text-[var(--sc-state-danger)]">¥ 0.00</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast('✅ 当班交接班对账单已核验并归档');
                  onClose();
                }}
                className="w-full py-2 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-deep)] text-white font-bold cursor-pointer hover:bg-[#001a33]"
              >
                确认交接班并打印小票
              </button>
            </>
          )}

          {kind === 'hardware' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-white flex justify-between items-center">
                <span className="font-semibold text-[var(--sc-ink-strong)]">80mm 热敏后厨打印机</span>
                <span className="px-2 py-0.5 rounded-[var(--sc-radius-xs)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold">
                  在线
                </span>
              </div>
              <div className="p-2.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-white flex justify-between items-center">
                <span className="font-semibold text-[var(--sc-ink-strong)]">蓝牙扫码核销枪 (HID)</span>
                <span className="px-2 py-0.5 rounded-[var(--sc-radius-xs)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold">
                  已配对
                </span>
              </div>
              <div className="p-2.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-white flex justify-between items-center">
                <span className="font-semibold text-[var(--sc-ink-strong)]">餐车外置叫号广播音箱</span>
                <span className="px-2 py-0.5 rounded-[var(--sc-radius-xs)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold">
                  语音隔离通道
                </span>
              </div>
            </div>
          )}

          {kind === 'message' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-white">
                <div className="font-bold text-[var(--sc-ink-strong)]">#9821 外卖骑手李师傅留言</div>
                <div className="text-[11px] text-[var(--sc-ink-body)] mt-0.5">已到达静安南广场餐车旁，等待打包取餐。</div>
              </div>
              <div className="p-2.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-white">
                <div className="font-bold text-[var(--sc-ink-strong)]">总部食安巡检回执</div>
                <div className="text-[11px] text-[var(--sc-ink-body)] mt-0.5">今日冷链温度上报合规（3.2°C），无需补交表单。</div>
              </div>
            </div>
          )}

          {kind === 'cloud' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary-soft)] border border-[var(--sc-brand-primary)]/30">
                <div className="font-bold text-[var(--sc-brand-primary)]">本地三轨沙箱 ↔ 腾讯云实时镜像</div>
                <div className="text-[11px] text-[var(--sc-ink-body)] mt-1">
                  最近增量同步：刚刚 · 订单、菜单与工作台显示偏好均为最新状态。
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast('☁️ 已完成全量快照双向同步');
                  onClose();
                }}
                className="w-full py-2 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary)] text-white font-bold cursor-pointer hover:bg-[#00527A]"
              >
                立即执行双向同步
              </button>
            </div>
          )}

          {kind === 'recycle' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-[var(--sc-radius-sm)] bg-[var(--sc-surface-raised)] border border-[var(--sc-line-soft)]">
                当前暂存 <span className="tabular-nums font-bold text-[var(--sc-ink-strong)]">{recycleBinCount}</span> 条已删除业务记录（30 天内支持无损恢复）。
              </div>
              {recycleBinCount > 0 && onRestoreAll && (
                <button
                  type="button"
                  onClick={() => {
                    onRestoreAll();
                    onClose();
                  }}
                  className="w-full py-2 rounded-[var(--sc-radius-sm)] border border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary)] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#00527A]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  一键恢复全部暂存数据
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  tabs: TabItemConfig[];
  activeTab: MerchantTab;
  onSelectTab: (tab: MerchantTab) => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  open,
  onClose,
  tabs,
  activeTab,
  onSelectTab
}) => {
  const [filter, setFilter] = useState('');
  if (!open) return null;

  const filtered = tabs.filter(
    (t) => t.label.includes(filter) || t.category.includes(filter)
  );

  return (
    <div className="fixed inset-0 z-[110] bg-[var(--sc-brand-deep)]/45 backdrop-blur-[2px] flex" onClick={onClose}>
      <div
        className="w-72 max-w-[85vw] bg-[var(--sc-surface-base)] h-full border-r border-[var(--sc-line-strong)] shadow-2xl flex flex-col text-[12px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-[var(--sc-line-soft)] flex items-center justify-between bg-[var(--sc-surface-raised)]">
          <span className="font-bold text-[14px] text-[var(--sc-ink-strong)] tabular-nums">
            全部功能模块 ({tabs.length})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] cursor-pointer text-[var(--sc-ink-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2.5 border-b border-[var(--sc-line-soft)]">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-[var(--sc-surface-sunken)]">
            <Search className="w-3.5 h-3.5 text-[var(--sc-ink-muted)]" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="筛选功能模块..."
              className="flex-1 bg-transparent outline-none text-[12px] text-[var(--sc-ink-strong)] placeholder:text-[var(--sc-ink-muted)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filtered.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectTab(tab.id);
                  onClose();
                }}
                className={`w-full px-3 py-2 rounded-[var(--sc-radius-sm)] flex items-center justify-between cursor-pointer transition ${
                  active
                    ? 'bg-[var(--sc-brand-primary)] text-white font-bold shadow-[0_0_0_2px_var(--sc-brand-glow)]'
                    : 'hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </span>
                <span className={`text-[10px] ${active ? 'text-white/80' : 'text-[var(--sc-ink-muted)]'}`}>
                  {tab.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
