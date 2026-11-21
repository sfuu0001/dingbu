import React from 'react';
import {
  Settings2,
  Menu as MenuIcon,
  Command,
  Trash2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { WorkspaceDisplaySettingsPanel } from './WorkspaceDisplaySettingsPanel';
import { WorkspacePrefs } from '../../utils/workspacePreferences';
import { MerchantTab, TabItemConfig } from './MerchantSidebar';

export interface MerchantSubHeaderProps {
  wsPrefs: WorkspacePrefs;
  currentTabConfig: TabItemConfig;
  tabsContainerRef: React.RefObject<HTMLDivElement | null>;
  allowedQuickTabs: TabItemConfig[];
  activeTab: MerchantTab;
  setActiveTab: (tab: MerchantTab) => void;
  setWsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMobileSidebarOpen: (open: boolean) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsRecycleBinOpen: (open: boolean) => void;
  recycleBinCount: number;
  wsPanelOpen: boolean;
  updateWsPrefs: (patch: Partial<WorkspacePrefs>) => void;
  wsSyncState: 'idle' | 'saving' | 'synced' | 'local_only';
  showToast: (msg: string) => void;
  allTabsConfig: TabItemConfig[];
  toggleFullWidthWorkspace: () => void;
}

export const MerchantSubHeader: React.FC<MerchantSubHeaderProps> = ({
  wsPrefs,
  allowedQuickTabs,
  setWsPanelOpen,
  setIsMobileSidebarOpen,
  setIsCommandPaletteOpen,
  setIsRecycleBinOpen,
  recycleBinCount,
  wsPanelOpen,
  updateWsPrefs,
  wsSyncState,
  showToast,
  allTabsConfig,
  toggleFullWidthWorkspace
}) => {
  const isIconOnly = wsPrefs.buttonDisplayMode === 'icon_only';

  return (
    <>
      <div
        style={{
          paddingLeft: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined,
          paddingRight: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined
        }}
        className={`shrink-0 bg-[var(--sc-surface-base)]/95 backdrop-blur-xs border-b border-[var(--sc-line-soft)] py-1.5 flex items-center justify-between md:justify-end gap-2 z-20 transition duration-fast ${
          (wsPrefs.windowSafeMargin ?? 0) > 0 ? '' : 'pl-2.5 pr-2 sm:pl-3.5 sm:pr-3'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 text-[var(--sc-ink-body)] hover:bg-[var(--sc-surface-alt)] hover:text-[var(--sc-ink-strong)] shrink-0 border border-dashed border-[var(--sc-line-strong)] bg-white cursor-pointer"
          title="展开全部功能模块侧边栏"
        >
          <MenuIcon className="w-3 h-3 text-[var(--sc-ink-body)]" />
          <span className="whitespace-nowrap">全部</span>
        </button>

        {/* Right Inline Controls: 自定义 / 指令台 / 回收站 / 显示设置 / 宽度切换 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 自定义顶部常用标签快捷按钮 */}
          <button
            type="button"
            id="merchant-customize-quick-tabs-btn"
            onClick={() => setWsPanelOpen(true)}
            className={`h-7 rounded-full text-[11px] font-bold flex items-center transition duration-fast cursor-pointer whitespace-nowrap shrink-0 border border-[var(--sc-brand-primary)]/45 bg-white hover:bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] group ${
              isIconOnly ? 'px-2' : 'px-2.5 gap-1'
            }`}
            title="自定义固定顶部常用功能标签并同步云端"
          >
            <Settings2 className="w-3 h-3 text-[var(--sc-brand-primary)] shrink-0 group-hover:rotate-45 transition-transform" />
            <span
              className={`tracking-tight transition duration-normal overflow-hidden whitespace-nowrap ${
                isIconOnly
                  ? 'max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 group-hover:ml-1'
                  : ''
              }`}
            >
              自定义
            </span>
            <span className="text-[9.5px] tabular-nums font-bold px-1.5 py-0.2 rounded-full bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] shrink-0">
              {allowedQuickTabs.length}
            </span>
          </button>

          {/* 指令中枢 (Command+K) 快捷入口 */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className={`h-7 flex items-center bg-[var(--sc-brand-deep)] hover:bg-[#001a33] text-white rounded-full text-[11px] font-bold transition cursor-pointer shadow-sm group ${
              isIconOnly ? 'px-2' : 'px-2.5 gap-1.5'
            }`}
            title="战术指令中枢 (支持快捷键 Cmd+K / Ctrl+K 穿梭)"
          >
            <Command className="w-3.5 h-3.5 text-[var(--sc-brand-accent)] shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-normal" />
            <span className="hidden sm:inline text-[11px]">指令台</span>
            <span className="text-[9.5px] tabular-nums bg-white/15 px-1.5 py-0.2 rounded-[var(--sc-radius-xs)] font-mono hidden md:inline">
              ⌘K
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsRecycleBinOpen(true)}
            className={`h-7 flex items-center bg-white hover:bg-[var(--sc-surface-alt)] border border-[var(--sc-line-soft)] hover:border-[var(--sc-line-strong)] rounded-full text-[11px] font-bold text-[var(--sc-ink-strong)] transition cursor-pointer group ${
              isIconOnly ? 'px-2' : 'px-2.5 gap-1'
            }`}
            title="统一回收站（删除的业务数据 30 天内可恢复）"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0 text-[var(--sc-ink-body)] group-hover:scale-110 group-hover:text-[var(--sc-state-danger)] transition duration-normal" />
            <span
              className={`transition duration-normal overflow-hidden whitespace-nowrap ${
                isIconOnly
                  ? 'max-w-0 opacity-0 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:ml-1'
                  : 'hidden sm:inline'
              }`}
            >
              回收站
            </span>
            {recycleBinCount > 0 && (
              <span
                className={`text-[9.5px] tabular-nums font-bold px-1.5 py-0.2 rounded-full bg-[var(--sc-brand-deep)] text-white shrink-0 ${
                  isIconOnly ? 'ml-1' : ''
                }`}
              >
                {recycleBinCount}
              </span>
            )}
          </button>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setWsPanelOpen((v) => !v)}
              className={`h-7 flex items-center border rounded-full text-[11px] font-bold transition cursor-pointer group ${
                isIconOnly ? 'px-2' : 'px-2.5 gap-1'
              } ${
                wsPanelOpen
                  ? 'bg-[var(--sc-brand-primary)] text-white border-[var(--sc-brand-primary)] shadow-[0_0_0_2px_var(--sc-brand-glow)]'
                  : 'bg-white text-[var(--sc-ink-strong)] border-[var(--sc-line-soft)] hover:border-[var(--sc-brand-primary)]'
              }`}
              title="工作台显示设置（快捷与悬浮按钮显示模式 / 内容宽度 / 订单列数 / 毛利红线 / 客食端预览管控）"
            >
              <Settings2
                className={`w-3.5 h-3.5 shrink-0 transition duration-slow ${
                  wsPanelOpen
                    ? 'rotate-90 text-[var(--sc-brand-accent)]'
                    : 'text-[var(--sc-ink-body)] group-hover:rotate-90 group-hover:text-[var(--sc-brand-primary)]'
                }`}
              />
              <span
                className={`transition duration-normal overflow-hidden whitespace-nowrap ${
                  isIconOnly
                    ? 'max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 group-hover:ml-1'
                    : 'hidden sm:inline'
                }`}
              >
                显示设置
              </span>
            </button>
            <WorkspaceDisplaySettingsPanel
              open={wsPanelOpen}
              onClose={() => setWsPanelOpen(false)}
              prefs={wsPrefs}
              onChange={updateWsPrefs}
              syncState={wsSyncState}
              showToast={showToast}
              allTabs={allTabsConfig}
            />
          </div>

          <button
            type="button"
            onClick={toggleFullWidthWorkspace}
            className={`hidden xl:flex h-7 bg-white hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-body)] hover:text-[var(--sc-ink-strong)] rounded-full transition cursor-pointer items-center border border-[var(--sc-line-soft)] hover:border-[var(--sc-line-strong)] shrink-0 text-[11px] font-bold group ${
              isIconOnly ? 'px-2' : 'px-2.5 gap-1'
            }`}
            title={
              wsPrefs.contentWidth === 'wide'
                ? '切换为标准居中工作台（宽度三档可在显示设置调节）'
                : '切换为全宽铺满工作台 (100% Fluid)'
            }
          >
            {wsPrefs.contentWidth === 'wide' ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[var(--sc-ink-muted)] shrink-0 group-hover:scale-110 group-hover:text-[var(--sc-brand-primary)] transition duration-normal" />
                <span
                  className={`text-[11px] transition duration-normal overflow-hidden whitespace-nowrap ${
                    isIconOnly
                      ? 'max-w-0 opacity-0 group-hover:max-w-[60px] group-hover:opacity-100 group-hover:ml-1'
                      : 'hidden 2xl:inline'
                  }`}
                >
                  居中
                </span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[var(--sc-ink-muted)] shrink-0 group-hover:scale-110 group-hover:text-[var(--sc-brand-primary)] transition duration-normal" />
                <span
                  className={`text-[11px] transition duration-normal overflow-hidden whitespace-nowrap ${
                    isIconOnly
                      ? 'max-w-0 opacity-0 group-hover:max-w-[60px] group-hover:opacity-100 group-hover:ml-1'
                      : 'hidden 2xl:inline'
                  }`}
                >
                  全宽
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
