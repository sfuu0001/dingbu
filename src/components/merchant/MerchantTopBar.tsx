import React from 'react';
import {
  Menu as MenuIcon,
  ArrowLeft,
  Store,
  Smartphone,
  ChevronDown,
  ArrowRightLeft,
  LogOut,
  Zap,
  Sparkles,
  Megaphone,
  Crown,
  SlidersHorizontal,
  MapPin,
  Bluetooth,
  Barcode,
  MessageSquareText,
  Cloud,
  Bike
} from 'lucide-react';
import { TruckBusinessScopeDropdown, TruckScopeItem } from './TruckBusinessScopeDropdown';
import { MerchantVoiceControls } from './MerchantVoiceControls';
import { maskPhoneNumber, MerchantSession } from '../../utils/staffAndRiderAuthEngine';
import { BusinessStatusConfig } from '../../utils/businessStatusEngine';
import { BluetoothSpeakerDevice } from '../../utils/bluetoothAudioEngine';
import { WorkspacePrefs } from '../../utils/workspacePreferences';
import { MerchantTab, TabItemConfig } from './MerchantSidebar';

export interface SentinelState {
  threatLevel: 'SECURE' | 'WARN' | 'CRITICAL';
  overallHealthScore: number;
  activeDecisions: string[];
}

export interface MerchantTopBarProps {
  wsPrefs: WorkspacePrefs;
  setIsMobileSidebarOpen: (open: boolean) => void;
  allTabsConfig: TabItemConfig[];
  onSwitchRole: (role: 'customer' | 'rider' | 'merchant') => void;
  selectedTruckId: string;
  handleSelectTruck: (truckId: string) => void;
  merchantTruckConfigs: TruckScopeItem[];
  businessStatus: BusinessStatusConfig;
  setIsBusinessStatusModalOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  setIsFranchiseHQModalOpen: (open: boolean) => void;
  merchantAuthSession: boolean;
  isHqScoped: boolean;
  isStaffMenuOpen: boolean;
  setIsStaffMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  merchantSession: MerchantSession | null;
  setIsShiftHandoverOpen: (open: boolean) => void;
  onOpenPhoneAuth?: () => void;
  onLogoutMerchant?: () => void;
  setActiveTab: (tab: MerchantTab) => void;
  activeTab: MerchantTab;
  sentinelState: SentinelState;
  isMobileMoreMenuOpen: boolean;
  setIsMobileMoreMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsQuickCallModalOpen: (open: boolean) => void;
  setIsHardwareHubOpen: (open: boolean) => void;
  setIsBluetoothModalOpen: (open: boolean) => void;
  activeBtDevice: BluetoothSpeakerDevice | null;
  setIsMessageFormModalOpen: (open: boolean) => void;
  setIsCloudbaseModalOpen: (open: boolean) => void;
}

export const MerchantTopBar: React.FC<MerchantTopBarProps> = ({
  wsPrefs,
  setIsMobileSidebarOpen,
  allTabsConfig,
  onSwitchRole,
  selectedTruckId,
  handleSelectTruck,
  merchantTruckConfigs,
  businessStatus,
  setIsBusinessStatusModalOpen,
  showToast,
  setIsFranchiseHQModalOpen,
  merchantAuthSession,
  isHqScoped,
  isStaffMenuOpen,
  setIsStaffMenuOpen,
  merchantSession,
  setIsShiftHandoverOpen,
  onOpenPhoneAuth,
  onLogoutMerchant,
  setActiveTab,
  activeTab,
  sentinelState,
  isMobileMoreMenuOpen,
  setIsMobileMoreMenuOpen,
  setIsQuickCallModalOpen,
  setIsHardwareHubOpen,
  setIsBluetoothModalOpen,
  activeBtDevice,
  setIsMessageFormModalOpen,
  setIsCloudbaseModalOpen
}) => (
  <>
    {/* 1. Global Navigation Top Bar (--sc-* 视觉设计令牌重构) */}
    <header
      style={{
        paddingLeft: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined,
        paddingRight: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined
      }}
      className={`h-12 sm:h-13 shrink-0 bg-[var(--sc-surface-base)] border-b border-[var(--sc-line-soft)] py-1.5 flex items-center justify-between gap-2 z-30 transition duration-fast ${
        (wsPrefs.windowSafeMargin ?? 0) > 0 ? '' : 'px-2 sm:px-3'
      }`}
    >
      {/* Left: Mobile Sidebar Toggle + Back + Store Brand + Truck Selector + Staff + Sentinel */}
      <div className="flex items-center gap-1.5 lg:gap-2 min-w-0 flex-1">
        {/* Mobile Sidebar Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-1.5 bg-[var(--sc-surface-base)] hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] rounded-[var(--sc-radius-sm)] transition cursor-pointer border border-[var(--sc-line-soft)] hover:border-[var(--sc-line-strong)] flex items-center justify-center shrink-0 shadow-sm"
          title={`展开${allTabsConfig.length}个功能模块侧边栏`}
          aria-label="展开功能模块侧边栏"
        >
          <MenuIcon className="w-4 h-4 text-[var(--sc-ink-strong)]" />
        </button>

        {/* Return to Customer Storefront */}
        <button
          type="button"
          onClick={() => onSwitchRole('customer')}
          className="px-2 sm:px-2.5 py-1 bg-white hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] border border-[var(--sc-line-strong)] hover:border-[var(--sc-brand-primary)] rounded-full transition cursor-pointer flex items-center gap-1 font-semibold text-[11px] shrink-0 whitespace-nowrap"
          title="返回前台顾客点餐"
          aria-label="返回前台顾客点餐"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0 text-[var(--sc-ink-body)]" />
          <span className="whitespace-nowrap">切回前台</span>
        </button>

        {/* Vertical Separator */}
        <div className="hidden lg:block h-4 w-[1px] bg-[var(--sc-line-soft)] shrink-0" />

        {/* Store Brand Badge */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-[var(--sc-brand-primary-soft)] border border-[var(--sc-brand-primary)]/30 text-[var(--sc-brand-primary)] flex items-center justify-center shrink-0">
            <Store className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] text-[var(--sc-ink-strong)] whitespace-nowrap">
              商家总控
            </span>
            <span className="text-[10px] tabular-nums bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border border-[var(--sc-brand-primary)]/30 px-1.5 py-0.5 rounded-full shrink-0 hidden xl:inline-block font-bold">
              在线
            </span>
          </div>
        </div>

        <div className="hidden lg:block h-4 w-[1px] bg-[var(--sc-line-soft)] shrink-0" />

        {/* Truck Scope & Business Switches Dropdown Popover */}
        <TruckBusinessScopeDropdown
          selectedTruckId={selectedTruckId}
          onSelectTruck={handleSelectTruck}
          merchantTruckConfigs={merchantTruckConfigs}
          businessStatus={businessStatus}
          onOpenDetailedModal={() => setIsBusinessStatusModalOpen(true)}
          showToast={showToast}
          onOpenHQModal={() => setIsFranchiseHQModalOpen(true)}
        />

        {/* 账号门店作用域徽标：本店账号 / 总部账号 */}
        {merchantAuthSession && (
          <span
            className={`hidden sm:inline-block shrink-0 px-1.5 py-0.5 rounded-[var(--sc-radius-xs)] border text-[10px] font-bold whitespace-nowrap ${
              isHqScoped
                ? 'bg-[#FFF8EB] text-[var(--sc-state-warn)] border-[var(--sc-state-warn)]/40'
                : 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/35'
            }`}
            title={isHqScoped ? '总部账号：可跨店管理' : '本店账号：仅限所属门店'}
          >
            {isHqScoped ? '总部账号' : '本店账号'}
          </span>
        )}

        <div className="hidden xl:block h-4 w-[1px] bg-[var(--sc-line-soft)] shrink-0" />

        {/* Verified Phone Staff Dropdown Capsule */}
        <div className="relative hidden md:block shrink-0">
          <button
            type="button"
            onClick={() => setIsStaffMenuOpen((prev) => !prev)}
            className={`h-7 sm:h-8 px-2 rounded-[var(--sc-radius-sm)] border text-left flex items-center gap-1.5 transition cursor-pointer ${
              isStaffMenuOpen
                ? 'bg-[var(--sc-brand-primary-soft)] border-[var(--sc-brand-primary)] shadow-[0_0_0_2px_var(--sc-brand-glow)]'
                : 'bg-white border-[var(--sc-line-soft)] hover:border-[var(--sc-brand-primary)] hover:bg-[var(--sc-surface-high)]'
            }`}
            title="员工账号与当班状态"
          >
            <Smartphone className="w-3 h-3 text-[var(--sc-brand-primary)] shrink-0" />
            <span className="text-[11px] font-bold text-[var(--sc-ink-strong)] truncate max-w-[92px]">
              {merchantSession?.name || '张伟 (店长)'}
            </span>
            <span className="hidden xl:inline tabular-nums text-[10px] font-medium text-[var(--sc-ink-body)]">
              {merchantSession?.phone ? maskPhoneNumber(merchantSession.phone) : '138****8000'}
            </span>
            <span
              className="hidden lg:inline-flex text-[9.5px] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border border-[var(--sc-brand-primary)]/25 px-1 py-0.2 rounded-[var(--sc-radius-xs)] font-bold"
              title="已完成指纹与设备硬件绑定"
            >
              ID
            </span>
            <ChevronDown
              className={`w-3 h-3 text-[var(--sc-ink-body)] transition-transform ${
                isStaffMenuOpen ? 'rotate-180 text-[var(--sc-brand-primary)]' : ''
              }`}
            />
          </button>

          {/* 员工下拉气泡菜单 */}
          {isStaffMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsStaffMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-xl p-2 z-50 text-[11px] space-y-1.5">
                <div className="px-2 py-1.5 bg-[var(--sc-surface-sunken)] rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)]">
                  <div className="font-bold text-[var(--sc-ink-strong)] text-[11.5px] flex items-center justify-between">
                    <span>{merchantSession?.name || '张伟 (店长)'}</span>
                    <span className="text-[9.5px] px-1.5 py-0.5 bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] rounded-[var(--sc-radius-xs)] font-bold">
                      在岗执勤
                    </span>
                  </div>
                  <div className="tabular-nums text-[var(--sc-ink-body)] text-[10px] mt-0.5">
                    手机号: {merchantSession?.phone ? maskPhoneNumber(merchantSession.phone) : '138****8000'}
                  </div>
                </div>

                <div className="pt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStaffMenuOpen(false);
                      setIsShiftHandoverOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--sc-state-warn)]" />
                      当班交接班结算
                    </span>
                    <span className="text-[10px] text-[var(--sc-ink-body)]">对账</span>
                  </button>

                  {onOpenPhoneAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsStaffMenuOpen(false);
                        onOpenPhoneAuth();
                      }}
                      className="w-full px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Smartphone className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />
                        切换员工账号
                      </span>
                      <span className="text-[10px] text-[var(--sc-ink-body)]">换号</span>
                    </button>
                  )}

                  {onLogoutMerchant && (
                    <>
                      <div className="h-px bg-[var(--sc-line-soft)] my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsStaffMenuOpen(false);
                          onLogoutMerchant();
                        }}
                        className="w-full px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[#FDECEC] text-[var(--sc-state-danger)] flex items-center justify-between cursor-pointer font-bold"
                      >
                        <span className="flex items-center gap-1.5">
                          <LogOut className="w-3.5 h-3.5" />
                          退出商家端
                        </span>
                        <span className="text-[10px] opacity-75">登出</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 五维自动化安全中枢常驻胶囊 */}
        <button
          type="button"
          id="global-sentinel-status-capsule"
          onClick={() => setActiveTab('data_fallback')}
          className={`hidden md:flex items-center gap-1 h-7 sm:h-8 px-2 rounded-[var(--sc-radius-sm)] border text-[11px] tabular-nums font-bold cursor-pointer transition shrink-0 ${
            sentinelState.threatLevel === 'SECURE'
              ? 'bg-white text-[var(--sc-ink-strong)] border-[var(--sc-line-soft)] hover:border-[var(--sc-brand-primary)] hover:bg-[var(--sc-brand-primary-soft)]'
              : sentinelState.threatLevel === 'CRITICAL'
              ? 'bg-[#FDECEC] text-[var(--sc-state-danger)] border-[var(--sc-state-danger)]/50 animate-pulse'
              : 'bg-[#FFF8EB] text-[var(--sc-state-warn)] border-[var(--sc-state-warn)]/50'
          }`}
          title="五维自动化安全与自闭环中枢 (Sensing-Safety)"
        >
          <Zap
            className={`w-3 h-3 ${
              sentinelState.threatLevel === 'SECURE'
                ? 'text-[var(--sc-brand-primary)]'
                : sentinelState.threatLevel === 'CRITICAL'
                ? 'text-[var(--sc-state-danger)]'
                : 'text-[var(--sc-state-warn)]'
            }`}
          />
          <span>{sentinelState.overallHealthScore}</span>
          {sentinelState.activeDecisions.length > 0 && (
            <span className="px-1 py-0.2 rounded-[var(--sc-radius-xs)] text-[9.5px] bg-[var(--sc-state-danger)] text-white font-bold">
              {sentinelState.activeDecisions.length}
            </span>
          )}
        </button>
      </div>

      {/* Top Right Quick Switches (shrink-0 防止任何分辨率下与左侧发生重叠) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* 手机端专属：快捷功能下拉菜单 */}
        <div className="relative md:hidden">
          <button
            type="button"
            id="mobile-header-quick-menu-trigger"
            onClick={() => setIsMobileMoreMenuOpen((v) => !v)}
            className="px-2 py-1 bg-white hover:bg-[var(--sc-surface-alt)] active:scale-95 text-[var(--sc-ink-strong)] rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] hover:border-[var(--sc-line-strong)] text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            aria-label="快捷工具中枢菜单"
            aria-expanded={isMobileMoreMenuOpen}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--sc-brand-primary)] shrink-0" />
            <span className="whitespace-nowrap">快捷中枢</span>
            <ChevronDown
              className={`w-3 h-3 text-[var(--sc-ink-body)] transition-transform ${
                isMobileMoreMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isMobileMoreMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMobileMoreMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-xl p-1.5 z-50 text-[11px] space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-bold text-[var(--sc-ink-muted)] uppercase">
                  快捷工具与中枢
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMoreMenuOpen(false);
                    setIsQuickCallModalOpen(true);
                  }}
                  className="w-full px-2 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Megaphone className="w-3.5 h-3.5 text-[var(--sc-state-warn)]" />
                    <span>全域喊号广播小窗</span>
                  </span>
                  <span className="text-[10px] text-[var(--sc-ink-muted)] tabular-nums">Alt+C</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMoreMenuOpen(false);
                    setIsFranchiseHQModalOpen(true);
                  }}
                  className="w-full px-2 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Crown className="w-3.5 h-3.5 text-[var(--sc-state-warn)]" />
                    <span>加盟商/HQ爆品中枢</span>
                  </span>
                  <span className="text-[10px] text-[var(--sc-ink-muted)]">HQ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMoreMenuOpen(false);
                    setIsHardwareHubOpen(true);
                  }}
                  className="w-full px-2 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />
                    <span>硬件与多设备协同</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--sc-brand-accent)]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMoreMenuOpen(false);
                    setActiveTab('gps');
                  }}
                  className="w-full px-2 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />
                    <span>餐车驻点与工况热更新</span>
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] font-bold border border-[var(--sc-brand-primary)]/30">
                    商家设置
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMoreMenuOpen(false);
                    setIsBusinessStatusModalOpen(true);
                  }}
                  className="w-full px-2 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        businessStatus.isOpen ? 'bg-[var(--sc-brand-primary)]' : 'bg-[var(--sc-state-danger)]'
                      }`}
                    />
                    <span>营业状态与渠道总控</span>
                  </span>
                  <span className="text-[10px] text-[var(--sc-ink-body)]">
                    {businessStatus.isOpen ? '营业中' : '已打烊'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMoreMenuOpen(false);
                    setActiveTab('data_fallback');
                  }}
                  className="w-full px-2 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />
                    <span>安全与自愈中枢</span>
                  </span>
                  <span className="text-[10px] tabular-nums text-[var(--sc-brand-primary)] font-bold">
                    {sentinelState.overallHealthScore}分
                  </span>
                </button>
                <div className="h-px bg-[var(--sc-line-soft)] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMoreMenuOpen(false);
                    setIsShiftHandoverOpen(true);
                  }}
                  className="w-full px-2 py-1.5 rounded-[var(--sc-radius-sm)] text-left hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--sc-state-warn)]" />
                    <span>当班交接班对账</span>
                  </span>
                  <span className="text-[10px] text-[var(--sc-ink-muted)]">结算</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 桌面端/平板端平铺按钮组 */}
        <div className="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* 全局即时叫号广播入口 */}
          <button
            type="button"
            id="global-header-quick-call-btn"
            onClick={() => setIsQuickCallModalOpen(true)}
            className="group/btn p-1.5 sm:px-2 sm:py-1 bg-[#FFF8EB] hover:bg-[#FFEFD1] active:scale-95 text-[var(--sc-state-warn)] font-bold text-[11px] rounded-[var(--sc-radius-sm)] transition cursor-pointer border border-[var(--sc-state-warn)]/45 flex items-center justify-center shrink-0"
            title="全域即时叫号广播小窗（自提催取/呼叫骑手/堂食传菜/全域喊客，快捷键: Alt+C）"
            aria-label="喊号广播"
          >
            <Megaphone className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[80px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-bold">
              喊号广播
            </span>
          </button>

          {/* 特许加盟与总部爆品中枢 */}
          <button
            type="button"
            id="franchise-hq-hub-btn"
            onClick={() => setIsFranchiseHQModalOpen(true)}
            className="group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-[var(--sc-surface-alt)] active:scale-95 text-[var(--sc-ink-strong)] font-bold text-[11px] rounded-[var(--sc-radius-sm)] transition cursor-pointer border border-[var(--sc-line-soft)] hover:border-[var(--sc-line-strong)] flex items-center justify-center shrink-0"
            title="特许经营与加盟商多租户中枢 · 核心爆品全国强锁定"
            aria-label="加盟/HQ爆品中枢"
          >
            <Crown className="w-3.5 h-3.5 text-[var(--sc-state-warn)] shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[120px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-bold">
              加盟/HQ爆品中枢
            </span>
          </button>
        </div>

        {/* 营业状态总开关 */}
        <button
          type="button"
          onClick={() => setIsBusinessStatusModalOpen(true)}
          className={`group/btn p-1.5 sm:px-2 sm:py-1 rounded-[var(--sc-radius-sm)] font-bold text-[11px] transition cursor-pointer border flex items-center justify-center shrink-0 whitespace-nowrap ${
            businessStatus.isOpen
              ? 'bg-[var(--sc-brand-primary-soft)] hover:bg-[#DCEDF8] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/40'
              : 'bg-[#FDECEC] hover:bg-[#FADADA] text-[var(--sc-state-danger)] border-[var(--sc-state-danger)]/50 animate-pulse'
          }`}
          title={`流动餐车营业状态总控（当前: ${businessStatus.isOpen ? '营业中' : '已打烊'}）`}
          aria-label={businessStatus.isOpen ? '营业中' : '已打烊'}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              businessStatus.isOpen ? 'bg-[var(--sc-brand-primary)]' : 'bg-[var(--sc-state-danger)]'
            }`}
          />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[60px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-bold">
            {businessStatus.isOpen ? '营业中' : '已打烊'}
          </span>
        </button>

        {/* 协同中枢聚合胶囊 (Tablet: md ~ xl) */}
        <button
          type="button"
          onClick={() => setIsHardwareHubOpen(true)}
          className="hidden md:flex xl:hidden group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] rounded-[var(--sc-radius-sm)] font-bold text-[11px] transition cursor-pointer border border-[var(--sc-line-soft)] hover:border-[var(--sc-line-strong)] items-center justify-center shrink-0"
          title="打开硬件与协同中枢"
          aria-label="硬件与协同中枢"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--sc-ink-strong)] shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">
            协同
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sc-brand-accent)] animate-pulse shrink-0 ml-0.5" />
        </button>

        {/* Desktop Expanded Buttons: Only visible on >= xl screens */}
        <div className="hidden xl:flex items-center gap-1 sm:gap-1.5 shrink-0">
          <MerchantVoiceControls showToast={showToast} />

          {/* Bluetooth Audio Player */}
          <button
            type="button"
            onClick={() => setIsBluetoothModalOpen(true)}
            className={`group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-[var(--sc-surface-alt)] rounded-[var(--sc-radius-sm)] font-bold text-[11px] transition cursor-pointer border flex items-center shrink-0 ${
              activeBtDevice && activeBtDevice.status === 'connected'
                ? 'text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/40 bg-[var(--sc-brand-primary-soft)]/50'
                : 'text-[var(--sc-ink-body)] border-[var(--sc-line-soft)]'
            }`}
            title={`流动餐车蓝牙音箱 · 当前: ${
              activeBtDevice?.status === 'connected' ? activeBtDevice.name : '未连接'
            }`}
          >
            <Bluetooth
              className={`w-3.5 h-3.5 shrink-0 ${
                activeBtDevice && activeBtDevice.status === 'connected'
                  ? 'text-[var(--sc-brand-primary)]'
                  : 'text-[var(--sc-ink-body)]'
              }`}
            />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">
              蓝牙
            </span>
            {activeBtDevice && activeBtDevice.status === 'connected' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--sc-brand-accent)] animate-pulse shrink-0 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('scanner');
              showToast('已切换至扫码枪');
            }}
            className={`group/btn p-1.5 sm:px-2 sm:py-1 rounded-[var(--sc-radius-sm)] font-bold text-[11px] transition cursor-pointer border flex items-center shrink-0 ${
              activeTab === 'scanner'
                ? 'bg-[var(--sc-brand-primary)] text-white border-[var(--sc-brand-primary)] shadow-[0_0_0_2px_var(--sc-brand-glow)]'
                : 'bg-[var(--sc-brand-primary-soft)] hover:bg-[#DCEDF8] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/35'
            }`}
            title="扫码枪"
          >
            <Barcode
              className={`w-3.5 h-3.5 shrink-0 ${
                activeTab === 'scanner' ? 'text-white' : 'text-[var(--sc-brand-primary)]'
              }`}
            />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">
              扫码
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ml-0.5 ${
                activeTab === 'scanner' ? 'bg-white' : 'bg-[var(--sc-brand-accent)]'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsMessageFormModalOpen(true)}
            className="group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] rounded-[var(--sc-radius-sm)] font-bold text-[11px] transition cursor-pointer border border-[var(--sc-line-soft)] hover:border-[var(--sc-line-strong)] flex items-center shrink-0"
            title="订单协同消息与历史表单"
          >
            <div className="relative shrink-0">
              <MessageSquareText className="w-3.5 h-3.5 text-[var(--sc-brand-primary)] shrink-0 group-hover/btn:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--sc-brand-accent)] animate-pulse" />
            </div>
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">
              消息
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsCloudbaseModalOpen(true)}
            className="group/btn p-1.5 sm:px-2 sm:py-1 bg-[var(--sc-brand-primary-soft)] hover:bg-[#DCEDF8] text-[var(--sc-brand-primary)] rounded-[var(--sc-radius-sm)] font-bold text-[11px] transition cursor-pointer border border-[var(--sc-brand-primary)]/35 flex items-center shrink-0"
            title="腾讯云数据同步"
          >
            <Cloud className="w-3.5 h-3.5 text-[var(--sc-brand-primary)] shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">
              同步
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--sc-brand-accent)] animate-pulse shrink-0 ml-0.5" />
          </button>
        </div>

        {/* 骑手端入口 */}
        <button
          type="button"
          onClick={() => onSwitchRole('rider')}
          className="group/btn hidden sm:flex p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] rounded-[var(--sc-radius-sm)] font-bold text-[11px] transition cursor-pointer border border-[var(--sc-line-soft)] hover:border-[var(--sc-brand-primary)] items-center shrink-0"
          title="切换至骑手端配送界面"
        >
          <Bike className="w-3.5 h-3.5 text-[var(--sc-brand-primary)] shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[60px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-bold">
            骑手端
          </span>
        </button>
      </div>
    </header>
  </>
);
