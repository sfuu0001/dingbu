import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Truck,
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  UtensilsCrossed,
  ShoppingBag,
  ArrowLeft,
  Sliders
} from 'lucide-react';
import { MerchantTopBar, SentinelState } from './components/merchant/MerchantTopBar';
import { MerchantSubHeader } from './components/merchant/MerchantSubHeader';
import { allTabsConfig, MerchantTab } from './components/merchant/MerchantSidebar';
import { BluetoothSpeakerModal } from './components/merchant/BluetoothSpeakerModal';
import {
  CommandPaletteModal,
  QuickCallModal,
  FranchiseHQModal,
  BusinessStatusDetailedModal,
  PhoneAuthModal,
  SimpleUtilityModal,
  MobileSidebarDrawer
} from './components/merchant/MerchantModals';
import {
  WorkspacePrefs,
  DEFAULT_WORKSPACE_PREFS,
  loadLocalPrefs,
  saveLocalPrefs,
  savePrefsToCloud,
  getDefaultPinnedTabs
} from './utils/workspacePreferences';
import {
  getAllTruckConfigs,
  TRUCK_LOCATION_EVENT
} from './utils/truckLocationEngine';
import { getUnifiedTruckName } from './utils/truckNaming';
import {
  getTruckBusinessStatus,
  BusinessStatusConfig
} from './utils/businessStatusEngine';
import {
  globalBluetoothAudio,
  BluetoothSpeakerDevice
} from './utils/bluetoothAudioEngine';
import {
  getMerchantSession,
  setMerchantSession,
  MerchantSession
} from './utils/staffAndRiderAuthEngine';
import {
  globalFranchiseEngine,
  FRANCHISE_TENANT_EVENT,
  FRANCHISE_POLICY_EVENT
} from './utils/franchiseTenantEngine';
import { canAccessMerchantTab } from './utils/rbacEngine';
import { TruckScopeItem } from './components/merchant/TruckBusinessScopeDropdown';

export function App() {
  const [roleView, setRoleView] = useState<'merchant' | 'customer' | 'rider'>('merchant');
  const [activeTab, setActiveTab] = useState<MerchantTab>('supply_proofing');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('truck-01');

  const [merchantSession, setMerchantSessionState] = useState<MerchantSession | null>(() =>
    getMerchantSession()
  );
  const [truckConfigs, setTruckConfigs] = useState(() => getAllTruckConfigs());
  const [businessStatus, setBusinessStatus] = useState<BusinessStatusConfig>(() =>
    getTruckBusinessStatus('truck-01')
  );
  const [activeBtDevice, setActiveBtDevice] = useState<BluetoothSpeakerDevice | null>(() =>
    globalBluetoothAudio.getActiveDevice()
  );
  const [franchiseContext, setFranchiseContext] = useState(() =>
    globalFranchiseEngine.getContext()
  );
  const [franchisePolicies, setFranchisePolicies] = useState(() =>
    globalFranchiseEngine.getPolicies()
  );

  // Workspace preferences
  const [wsPrefs, setWsPrefs] = useState<WorkspacePrefs>(() => loadLocalPrefs() ?? DEFAULT_WORKSPACE_PREFS);
  const [wsSyncState, setWsSyncState] = useState<'idle' | 'saving' | 'synced' | 'local_only'>('synced');
  const [wsPanelOpen, setWsPanelOpen] = useState(false);

  // Dropdown & Modal states
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [recycleBinCount, setRecycleBinCount] = useState(3);
  const [isQuickCallModalOpen, setIsQuickCallModalOpen] = useState(false);
  const [isFranchiseHQModalOpen, setIsFranchiseHQModalOpen] = useState(false);
  const [isBusinessStatusModalOpen, setIsBusinessStatusModalOpen] = useState(false);
  const [isHardwareHubOpen, setIsHardwareHubOpen] = useState(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [isMessageFormModalOpen, setIsMessageFormModalOpen] = useState(false);
  const [isCloudbaseModalOpen, setIsCloudbaseModalOpen] = useState(false);
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState(false);
  const [isPhoneAuthOpen, setIsPhoneAuthOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  // Sync external engine events
  useEffect(() => {
    const syncTrucks = () => setTruckConfigs(getAllTruckConfigs());
    const syncStatus = () => setBusinessStatus(getTruckBusinessStatus(selectedTruckId));
    const syncBt = () => setActiveBtDevice(globalBluetoothAudio.getActiveDevice());
    const syncTenant = () => setFranchiseContext(globalFranchiseEngine.getContext());
    const syncPolicy = () => setFranchisePolicies(globalFranchiseEngine.getPolicies());

    window.addEventListener(TRUCK_LOCATION_EVENT, syncTrucks);
    window.addEventListener('business-status-change', syncStatus);
    window.addEventListener('obsidian_bluetooth_speaker_changed', syncBt);
    window.addEventListener(FRANCHISE_TENANT_EVENT, syncTenant);
    window.addEventListener(FRANCHISE_POLICY_EVENT, syncPolicy);
    return () => {
      window.removeEventListener(TRUCK_LOCATION_EVENT, syncTrucks);
      window.removeEventListener('business-status-change', syncStatus);
      window.removeEventListener('obsidian_bluetooth_speaker_changed', syncBt);
      window.removeEventListener(FRANCHISE_TENANT_EVENT, syncTenant);
      window.removeEventListener(FRANCHISE_POLICY_EVENT, syncPolicy);
    };
  }, [selectedTruckId]);

  useEffect(() => {
    setBusinessStatus(getTruckBusinessStatus(selectedTruckId));
  }, [selectedTruckId]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K & Alt+C)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((v) => !v);
      } else if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsQuickCallModalOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const updateWsPrefs = useCallback((patch: Partial<WorkspacePrefs>) => {
    setWsPrefs((prev) => {
      const next: WorkspacePrefs = {
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString()
      };
      saveLocalPrefs(next);
      setWsSyncState('saving');
      window.setTimeout(() => {
        void savePrefsToCloud(next).then((ok) => {
          setWsSyncState(ok ? 'synced' : 'local_only');
        });
      }, 260);
      return next;
    });
  }, []);

  const toggleFullWidthWorkspace = useCallback(() => {
    const isCurrentlyWide = wsPrefs.contentWidth === 'wide';
    updateWsPrefs({
      contentWidth: isCurrentlyWide ? 'standard' : 'wide',
      contentWidthPercent: isCurrentlyWide ? 75 : 100
    });
    showToast(isCurrentlyWide ? '已切换为标准居中工作台 (75%)' : '已切换为全宽铺满工作台 (100% Fluid)');
  }, [wsPrefs.contentWidth, updateWsPrefs, showToast]);

  const handleSelectTruck = useCallback((truckId: string) => {
    setSelectedTruckId(truckId);
    setBusinessStatus(getTruckBusinessStatus(truckId));
  }, []);

  const handleSelectSession = useCallback(
    (s: MerchantSession) => {
      setMerchantSession(s);
      setMerchantSessionState(s);
      globalFranchiseEngine.setContext({
        isHqUser: s.scope === 'all',
        accessibleTruckIds: s.scope === 'all' ? ['truck-01', 'truck-02', 'truck-03', 'truck-04'] : [s.truckId || 'truck-01']
      });
      showToast(`已切换当班账号：${s.name}（${s.scope === 'all' ? '总部账号' : '本店账号'}）`);
    },
    [showToast]
  );

  const merchantTruckConfigs: TruckScopeItem[] = useMemo(
    () =>
      truckConfigs.map((t) => ({
        truckId: t.id,
        truckName: t.name,
        address: t.address,
        status: t.status
      })),
    [truckConfigs]
  );

  const pinnedIds = useMemo(
    () => wsPrefs.pinnedTabs ?? getDefaultPinnedTabs(allTabsConfig.map((t) => t.id)),
    [wsPrefs.pinnedTabs]
  );

  const allowedQuickTabs = useMemo(
    () =>
      allTabsConfig.filter(
        (tab) => pinnedIds.includes(tab.id) && canAccessMerchantTab(merchantSession, tab.id)
      ),
    [pinnedIds, merchantSession]
  );

  const currentTabConfig = useMemo(
    () => allTabsConfig.find((t) => t.id === activeTab) || allTabsConfig[0],
    [activeTab]
  );

  const sentinelState: SentinelState = {
    threatLevel: 'SECURE',
    overallHealthScore: 100,
    activeDecisions: []
  };

  const isHqScoped = merchantSession ? merchantSession.scope === 'all' : true;

  const contentMaxWidthStyle = useMemo(() => {
    const pct = wsPrefs.contentWidthPercent ?? 100;
    if (pct >= 100) return { maxWidth: '100%' };
    return { maxWidth: `${pct}vw` };
  }, [wsPrefs.contentWidthPercent]);

  const ordersGridColsClass =
    wsPrefs.ordersColumns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : wsPrefs.ordersColumns === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : wsPrefs.ordersColumns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  // Customer / Rider lightweight role-switch views so "切回前台" & "骑手端" work cleanly
  if (roleView !== 'merchant') {
    return (
      <div className="min-h-screen bg-[var(--sc-surface-sunken)] flex flex-col items-center justify-center p-6 text-[var(--sc-ink-strong)]">
        <div className="w-full max-w-md bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary-soft)] border border-[var(--sc-brand-primary)]/30 flex items-center justify-center text-[var(--sc-brand-primary)]">
              {roleView === 'customer' ? <Store className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-[var(--sc-ink-strong)]">
                {roleView === 'customer' ? '前台顾客扫码点餐端' : '自营骑手即时配送端'}
              </h2>
              <p className="text-[11px] text-[var(--sc-ink-body)]">
                当前门店：{getUnifiedTruckName(selectedTruckId, 'full')}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-[var(--sc-radius-sm)] bg-[var(--sc-surface-raised)] border border-[var(--sc-line-soft)] text-[12px] text-[var(--sc-ink-body)]">
            {roleView === 'customer'
              ? `营业状态：${businessStatus.isOpen ? '营业接单中' : '已暂停营业'} · 堂食${businessStatus.dineInOpen !== false ? '开放' : '关闭'} / 自提${businessStatus.pickupOpen !== false ? '开放' : '关闭'}`
              : '顺路配送池已就绪，可通过商家端右上角广播入口即时派单。'}
          </div>
          <button
            type="button"
            onClick={() => setRoleView('merchant')}
            className="w-full py-2.5 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-deep)] hover:bg-[#001a33] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--sc-brand-accent)]" />
            返回商家总控操作台
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sc-surface-sunken)] flex flex-col text-[var(--sc-ink-strong)]">
      {/* 1. 顶部控制条 (TopBar + StaffMenu + MobileQuickMenu + TruckBusinessScopeDropdown + MerchantVoiceControls) */}
      <MerchantTopBar
        wsPrefs={wsPrefs}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        allTabsConfig={allTabsConfig}
        onSwitchRole={(role) => setRoleView(role)}
        selectedTruckId={selectedTruckId}
        handleSelectTruck={handleSelectTruck}
        merchantTruckConfigs={merchantTruckConfigs}
        businessStatus={businessStatus}
        setIsBusinessStatusModalOpen={setIsBusinessStatusModalOpen}
        showToast={showToast}
        setIsFranchiseHQModalOpen={setIsFranchiseHQModalOpen}
        merchantAuthSession={Boolean(merchantSession)}
        isHqScoped={isHqScoped}
        isStaffMenuOpen={isStaffMenuOpen}
        setIsStaffMenuOpen={setIsStaffMenuOpen}
        merchantSession={merchantSession}
        setIsShiftHandoverOpen={setIsShiftHandoverOpen}
        onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
        onLogoutMerchant={() => {
          setIsPhoneAuthOpen(true);
          showToast('请选择要切换或重新登录的员工账号');
        }}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        sentinelState={sentinelState}
        isMobileMoreMenuOpen={isMobileMoreMenuOpen}
        setIsMobileMoreMenuOpen={setIsMobileMoreMenuOpen}
        setIsQuickCallModalOpen={setIsQuickCallModalOpen}
        setIsHardwareHubOpen={setIsHardwareHubOpen}
        setIsBluetoothModalOpen={setIsBluetoothModalOpen}
        activeBtDevice={activeBtDevice}
        setIsMessageFormModalOpen={setIsMessageFormModalOpen}
        setIsCloudbaseModalOpen={setIsCloudbaseModalOpen}
      />

      {/* 2. 实时经营状态条 (SubHeader + WorkspaceDisplaySettingsPanel) */}
      <MerchantSubHeader
        wsPrefs={wsPrefs}
        currentTabConfig={currentTabConfig}
        tabsContainerRef={tabsContainerRef}
        allowedQuickTabs={allowedQuickTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setWsPanelOpen={setWsPanelOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        setIsRecycleBinOpen={setIsRecycleBinOpen}
        recycleBinCount={recycleBinCount}
        wsPanelOpen={wsPanelOpen}
        updateWsPrefs={updateWsPrefs}
        wsSyncState={wsSyncState}
        showToast={showToast}
        allTabsConfig={allTabsConfig}
        toggleFullWidthWorkspace={toggleFullWidthWorkspace}
      />

      {/* 3. 工作区承载容器：实时响应宽度占比与安全边距设置 */}
      <main
        className="flex-1 w-full mx-auto transition-all duration-fast"
        style={{
          ...contentMaxWidthStyle,
          padding: `${Math.max(12, wsPrefs.windowSafeMargin ?? 0)}px`
        }}
      >
        <div className="space-y-4">
          {/* 当前模块摘要卡 */}
          <section className="bg-[var(--sc-surface-base)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-md)] p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary-soft)] border border-[var(--sc-brand-primary)]/30 text-[var(--sc-brand-primary)] flex items-center justify-center shrink-0">
                <currentTabConfig.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[var(--sc-surface-chip)] border border-[var(--sc-line-soft)] text-[var(--sc-ink-body)] font-semibold">
                    {currentTabConfig.category}
                  </span>
                  <h1 className="text-[14px] sm:text-[15px] font-bold text-[var(--sc-ink-strong)]">
                    {currentTabConfig.label}
                  </h1>
                  <span className="text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded-[var(--sc-radius-xs)] bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border border-[var(--sc-brand-primary)]/30">
                    {getUnifiedTruckName(selectedTruckId, 'short')}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--sc-ink-body)] mt-1">
                  {currentTabConfig.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-[12px]">
              <button
                type="button"
                onClick={() => setIsPhoneAuthOpen(true)}
                className="px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-strong)] bg-white hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] font-semibold cursor-pointer transition"
              >
                切换账号 ({isHqScoped ? '总部' : '本店'})
              </button>
              <button
                type="button"
                onClick={() => setWsPanelOpen(true)}
                className="px-2.5 py-1.5 rounded-[var(--sc-radius-sm)] border border-[var(--sc-brand-primary)]/45 bg-[var(--sc-brand-primary-soft)] hover:bg-[#DCEDF8] text-[var(--sc-brand-primary)] font-bold flex items-center gap-1 cursor-pointer tabular-nums transition"
              >
                <Sliders className="w-3.5 h-3.5" />
                显示设置 ({wsPrefs.contentWidthPercent}%)
              </button>
            </div>
          </section>

          {/* 实时状态网格：响应订单列数偏好 (2 / 3 / 4 列) */}
          <section className={`grid gap-3 ${ordersGridColsClass}`}>
            <div className="bg-[var(--sc-surface-base)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-md)] p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[var(--sc-ink-strong)] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[var(--sc-brand-primary)]" />
                  当前驻点与渠道开关
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    businessStatus.isOpen
                      ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/35'
                      : 'bg-[#FDECEC] text-[var(--sc-state-danger)] border-[var(--sc-state-danger)]/40'
                  }`}
                >
                  {businessStatus.isOpen ? '营业中' : '已打烊'}
                </span>
              </div>
              <div className="text-[12px] text-[var(--sc-ink-body)] font-medium">
                {getUnifiedTruckName(selectedTruckId, 'full')}
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-semibold">
                <div className="p-2 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-[var(--sc-surface-raised)] flex items-center gap-1 text-[var(--sc-ink-strong)]">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--sc-brand-primary)]" />
                  <span>堂食 {businessStatus.dineInOpen !== false ? '开' : '关'}</span>
                </div>
                <div className="p-2 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-[var(--sc-surface-raised)] flex items-center gap-1 text-[var(--sc-ink-strong)]">
                  <Bike className="w-3.5 h-3.5 text-[var(--sc-brand-accent)]" />
                  <span>外卖 {businessStatus.deliveryOpen !== false ? '开' : '关'}</span>
                </div>
                <div className="p-2 rounded-[var(--sc-radius-sm)] border border-[var(--sc-line-soft)] bg-[var(--sc-surface-raised)] flex items-center gap-1 text-[var(--sc-ink-strong)]">
                  <ShoppingBag className="w-3.5 h-3.5 text-[var(--sc-state-warn)]" />
                  <span>自提 {businessStatus.pickupOpen !== false ? '开' : '关'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--sc-surface-base)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-md)] p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[var(--sc-ink-strong)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--sc-brand-primary)]" />
                  五维安全与显示偏好镜像
                </span>
                <span className="text-[10px] tabular-nums font-bold text-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] border border-[var(--sc-brand-primary)]/30 px-2 py-0.5 rounded-full">
                  健康分 {sentinelState.overallHealthScore}
                </span>
              </div>
              <div className="text-[12px] text-[var(--sc-ink-body)] space-y-1">
                <div className="flex justify-between">
                  <span>按钮模式</span>
                  <span className="font-bold text-[var(--sc-ink-strong)]">
                    {wsPrefs.buttonDisplayMode === 'icon_only' ? '动态图标·悬停显字' : '常驻图文模式'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>内容区宽度 / 安全边距</span>
                  <span className="tabular-nums font-bold text-[var(--sc-ink-strong)]">
                    {wsPrefs.contentWidthPercent}% / {wsPrefs.windowSafeMargin ?? 0}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>毛利红线预警</span>
                  <span className="tabular-nums font-bold text-[var(--sc-state-danger)]">
                    {wsPrefs.marginFloorPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--sc-surface-base)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-md)] p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[var(--sc-ink-strong)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--sc-state-warn)]" />
                  快捷互动索引
                </span>
                <span className="text-[10px] text-[var(--sc-ink-muted)] tabular-nums font-mono">⌘K / Alt+C</span>
              </div>
              <ul className="text-[11px] text-[var(--sc-ink-body)] space-y-1">
                <li>• 点击顶栏「店铺胶囊」打开多餐车营业与渠道调度浮层</li>
                <li>• 点击「张伟 (店长)」或移动端点「快捷中枢」查看小菜单</li>
                <li>• 点击状态条「显示设置 / 自定义」测试动态图标、宽屏与钉选栏</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Modals & Drawers */}
      <CommandPaletteModal
        open={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tabs={allTabsConfig}
        onSelectTab={setActiveTab}
      />
      <QuickCallModal
        open={isQuickCallModalOpen}
        onClose={() => setIsQuickCallModalOpen(false)}
        showToast={showToast}
      />
      <FranchiseHQModal
        open={isFranchiseHQModalOpen}
        onClose={() => setIsFranchiseHQModalOpen(false)}
        policies={franchisePolicies}
        onToggleLock={(id) => globalFranchiseEngine.togglePolicyLock(id)}
        isHqUser={franchiseContext.isHqUser}
        onToggleRoleMode={() => {
          const nextHq = !franchiseContext.isHqUser;
          globalFranchiseEngine.setContext({
            isHqUser: nextHq,
            accessibleTruckIds: nextHq ? ['truck-01', 'truck-02', 'truck-03', 'truck-04'] : ['truck-01']
          });
          showToast(nextHq ? '已切换至品牌总部 HQ 跨店视角' : '已切换至特许加盟商沙箱视角');
        }}
      />
      <BusinessStatusDetailedModal
        open={isBusinessStatusModalOpen}
        onClose={() => setIsBusinessStatusModalOpen(false)}
        truckId={selectedTruckId}
        truckName={getUnifiedTruckName(selectedTruckId, 'short')}
        status={businessStatus}
        showToast={showToast}
      />
      <BluetoothSpeakerModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        showToast={showToast}
      />
      <PhoneAuthModal
        open={isPhoneAuthOpen}
        onClose={() => setIsPhoneAuthOpen(false)}
        currentSession={merchantSession}
        onSelectSession={handleSelectSession}
      />
      <SimpleUtilityModal
        open={isShiftHandoverOpen}
        onClose={() => setIsShiftHandoverOpen(false)}
        title="当班交接班结算对账"
        kind="shift"
        showToast={showToast}
      />
      <SimpleUtilityModal
        open={isHardwareHubOpen}
        onClose={() => setIsHardwareHubOpen(false)}
        title="硬件与多设备协同中枢"
        kind="hardware"
        showToast={showToast}
      />
      <SimpleUtilityModal
        open={isMessageFormModalOpen}
        onClose={() => setIsMessageFormModalOpen(false)}
        title="订单协同消息与历史表单"
        kind="message"
        showToast={showToast}
      />
      <SimpleUtilityModal
        open={isCloudbaseModalOpen}
        onClose={() => setIsCloudbaseModalOpen(false)}
        title="腾讯云数据双向同步"
        kind="cloud"
        showToast={showToast}
      />
      <SimpleUtilityModal
        open={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        title="统一回收站"
        kind="recycle"
        recycleBinCount={recycleBinCount}
        onRestoreAll={() => {
          setRecycleBinCount(0);
          showToast('✅ 已从回收站无损恢复全部暂存记录');
        }}
        showToast={showToast}
      />
      <MobileSidebarDrawer
        open={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        tabs={allTabsConfig}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[150] px-4 py-2 rounded-full bg-[var(--sc-brand-deep)] text-white text-[12px] font-semibold shadow-xl border border-[var(--sc-brand-primary)]/45 whitespace-nowrap max-w-[92vw] truncate">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default App;
