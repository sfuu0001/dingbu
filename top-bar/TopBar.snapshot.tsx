// @ts-nocheck
/**
 * 顶部控制条（Global Navigation Top Bar）
 * ---------------------------------------------------------------------------
 * 切回前台 / 商家总控+在线 / 店铺胶囊 / 本店账号 / 员工账号 / 健康分 / 右侧图标组 / 骑手端入口
 * 摘自 src/components/merchant/MerchantSystemView.tsx 第 1649–2135 行（原样，未改逻辑）
 * ⚠ 依赖 MerchantSystemView 作用域内的 state/props，接回或独立运行前请先看 ../README.md
 */

export const TopBarSnapshot = () => (
  <>
      {/* 1. Global Navigation Top Bar */}
      <header
        style={{
          paddingLeft: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined,
          paddingRight: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined
        }}
        className={`h-12 sm:h-13 shrink-0 bg-card-bg border-b border-border-main py-1.5 flex items-center justify-between shadow-2xs gap-1.5 sm:gap-3 z-30 transition duration-fast ${
          (wsPrefs.windowSafeMargin ?? 0) > 0 ? '' : 'px-2 sm:px-3'
        }`}
      >
        {/* Left: Mobile Sidebar Toggle + Back + Store Brand + Truck Selector */}
        <div className="flex items-center gap-1 sm:gap-2.5 min-w-0 shrink">
          {/* Mobile Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-1.5 bg-white hover:bg-[#f7f7f5] text-text-prominent rounded-console transition cursor-pointer border border-border-main flex items-center justify-center shrink-0 shadow-2xs"
            title={`展开${allTabsConfig.length}个功能模块侧边栏`}
            aria-label="展开功能模块侧边栏"
          >
            <MenuIcon className="w-4 h-4 text-text-prominent" />
          </button>

          {/* Return to Customer Storefront */}
          <button
            type="button"
            onClick={() => onSwitchRole('customer')}
            className="px-2 sm:px-2.5 py-1 bg-white hover:bg-[#f7f7f5] text-[#37352f] border border-[#1a1918] rounded-full transition cursor-pointer flex items-center gap-1 font-normal text-xs shadow-2xs shrink-0 whitespace-nowrap"
            title="返回前台顾客点餐"
            aria-label="返回前台顾客点餐"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="font-normal whitespace-nowrap">切回前台</span>
          </button>

          {/* Vertical Separator */}
          <div className="h-4 w-[1px] bg-[#e6e6e4] shrink-0" />

          {/* Store Brand Badge */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-[#1a1918] text-[#37352f] flex items-center justify-center font-normal text-xs shrink-0 shadow-2xs">
              <Store className="w-3.5 h-3.5 text-[#37352f]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-normal text-xs sm:text-sm text-[#37352f] whitespace-nowrap tracking-tight">
                商家总控
              </span>
              <span className="text-[10px] font-mono bg-[#edf3ec] text-[#2b593f] border border-[#c4dcbc] px-1.5 py-0.2 rounded-full shrink-0 hidden lg:inline-block font-normal">
                在线
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#e6e6e4] shrink-0 hidden sm:block" />

          {/* Truck Scope & Business Switches Dropdown Popover (含租户沙箱与渠道调度一体化复合胶囊) */}
          <TruckBusinessScopeDropdown
            selectedTruckId={selectedTruckId}
            onSelectTruck={handleSelectTruck}
            merchantTruckConfigs={merchantTruckConfigs}
            businessStatus={businessStatus}
            onOpenDetailedModal={() => setIsBusinessStatusModalOpen(true)}
            showToast={showToast}
            onOpenHQModal={() => setIsFranchiseHQModalOpen(true)}
          />

          {/* 账号门店作用域徽标：本店账号 / 总部账号（紧邻顶部门店名） */}
          {merchantAuthSession && (
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded-[3px] border text-[10px] font-medium whitespace-nowrap ${
                isHqScoped
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
              title={isHqScoped ? '总部账号：可跨店管理' : '本店账号：仅限所属门店'}
            >
              {isHqScoped ? '总部账号' : '本店账号'}
            </span>
          )}

          <div className="h-4 w-[1px] bg-[#e6e6e4] shrink-0 hidden md:block" />

          {/* Verified Phone Staff Dropdown Capsule (精简折叠卡片) */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setIsStaffMenuOpen((prev) => !prev)}
              className={`h-7 sm:h-8 px-2 rounded-console border text-left flex items-center gap-1.5 transition cursor-pointer ${
                isStaffMenuOpen
                  ? 'bg-white border-[#1a1918] shadow-2xs'
                  : 'bg-white border-[#e8e7e3] hover:border-[#1a1918] hover:bg-[#f7f7f5]'
              }`}
              title="员工账号与当班状态"
            >
              <Smartphone className="w-3 h-3 text-text-prominent shrink-0" />
              <span className="text-[11px] sm:text-[11.5px] font-bold text-text-prominent truncate max-w-[100px]">
                {merchantSession?.name || '张伟 (店长)'}
              </span>
              <span className="font-mono text-[10px] text-[#787770]">
                {merchantSession?.phone ? maskPhoneNumber(merchantSession.phone) : '138****8000'}
              </span>
              <span
                className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono font-bold"
                title="已完成指纹与设备硬件绑定"
              >
                🪪
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#787770] transition-transform ${
                  isStaffMenuOpen ? 'rotate-180 text-text-prominent' : ''
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
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#1a1918] rounded-[6px] shadow-xl p-2 z-50 text-xs space-y-1.5">
                  <div className="px-2 py-1.5 bg-[#f9f9f7] rounded-console border border-[#e8e7e3]">
                    <div className="font-bold text-text-prominent text-[11.5px] flex items-center justify-between">
                      <span>{merchantSession?.name || '张伟 (店长)'}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">在岗执勤</span>
                    </div>
                    <div className="font-mono text-[#787770] text-[10px] mt-0.5">
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
                      className="w-full px-2.5 py-1.5 rounded-console text-left hover:bg-page-bg text-text-prominent flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-medium"><ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" /> 当班交接班结算</span>
                      <span className="text-[10px] text-[#787770]">对账</span>
                    </button>

                    {onOpenPhoneAuth && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsStaffMenuOpen(false);
                          onOpenPhoneAuth();
                        }}
                        className="w-full px-2.5 py-1.5 rounded-console text-left hover:bg-page-bg text-text-prominent flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-medium"><Smartphone className="w-3.5 h-3.5 text-blue-600" /> 切换员工账号</span>
                        <span className="text-[10px] text-[#787770]">换号</span>
                      </button>
                    )}

                    {onLogoutMerchant && (
                      <>
                        <div className="h-px bg-[#e8e7e3] my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsStaffMenuOpen(false);
                            onLogoutMerchant();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-console text-left hover:bg-rose-50 text-rose-600 flex items-center justify-between cursor-pointer font-bold"
                        >
                          <span className="flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> 退出商家端</span>
                          <span className="text-[10px] text-rose-400">登出</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 五维自动化安全中枢常驻胶囊 (精简版微标) */}
          <button
            type="button"
            id="global-sentinel-status-capsule"
            onClick={() => setActiveTab('data_fallback')}
            className={`hidden md:flex items-center gap-1 h-7 sm:h-8 px-2 rounded-console border text-xs font-mono font-bold cursor-pointer transition ${
              sentinelState.threatLevel === 'SECURE'
                ? 'bg-white text-text-prominent border-[#e8e7e3] hover:border-[#1a1918] hover:bg-page-bg'
                : sentinelState.threatLevel === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title="五维自动化安全与自闭环中枢 (Sensing-Safety)"
          >
            <Zap className={`w-3 h-3 ${sentinelState.threatLevel === 'SECURE' ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span>{sentinelState.overallHealthScore}</span>
            {sentinelState.activeDecisions.length > 0 && (
              <span className="px-1 py-0.1 rounded-console text-[9px] bg-red-600 text-white font-medium">
                {sentinelState.activeDecisions.length}
              </span>
            )}
          </button>
        </div>

        {/* Top Right Quick Switches */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* 手机端专属：快捷功能下拉菜单 (Mobile Quick Actions Dropdown Menu) */}
          <div className="relative md:hidden">
            <button
              type="button"
              id="mobile-header-quick-menu-trigger"
              onClick={() => setIsMobileMoreMenuOpen((v) => !v)}
              className="px-2 py-1 bg-white hover:bg-neutral-50 active:scale-95 text-text-prominent rounded-console border border-border-main text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
              aria-label="快捷工具中枢菜单"
              aria-expanded={isMobileMoreMenuOpen}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-medium whitespace-nowrap">快捷中枢</span>
              <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${isMobileMoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 下拉菜单面板 */}
            {isMobileMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMobileMoreMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-[#1a1918] rounded-[6px] shadow-2xl p-1.5 z-50 text-xs space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    快捷工具与中枢
                  </div>
                  {/* 1. 即时喊号广播 */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreMenuOpen(false);
                      setIsQuickCallModalOpen(true);
                    }}
                    className="w-full px-2 py-1.5 rounded-console text-left hover:bg-neutral-100 text-neutral-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                      <span>全域喊号广播小窗</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">Alt+C</span>
                  </button>
                  {/* 3. 特许加盟与总部爆品 */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreMenuOpen(false);
                      setIsFranchiseHQModalOpen(true);
                    }}
                    className="w-full px-2 py-1.5 rounded-console text-left hover:bg-neutral-100 text-neutral-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Crown className="w-3.5 h-3.5 text-amber-700" />
                      <span>加盟商/HQ爆品中枢</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">HQ</span>
                  </button>
                  {/* 4. 硬件与协同中枢 */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreMenuOpen(false);
                      setIsHardwareHubOpen(true);
                    }}
                    className="w-full px-2 py-1.5 rounded-console text-left hover:bg-neutral-100 text-neutral-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-700" />
                      <span>硬件与多设备协同</span>
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </button>
                  {/* 5. 餐车驻点与工况热配置 (商家专属) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreMenuOpen(false);
                      setActiveTab('gps');
                    }}
                    className="w-full px-2 py-1.5 rounded-console text-left hover:bg-neutral-100 text-neutral-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>餐车驻点与工况热更新</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
                      商家设置
                    </span>
                  </button>
                  {/* 6. 营业状态与渠道总控 */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreMenuOpen(false);
                      setIsBusinessStatusModalOpen(true);
                    }}
                    className="w-full px-2 py-1.5 rounded-console text-left hover:bg-neutral-100 text-neutral-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className={`w-2.5 h-2.5 rounded-full ${businessStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>营业状态与渠道总控</span>
                    </span>
                    <span className="text-[10px] text-neutral-500">{businessStatus.isOpen ? '营业中' : '已打烊'}</span>
                  </button>
                  {/* 6. 五维安全中枢 */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreMenuOpen(false);
                      setActiveTab('data_fallback');
                    }}
                    className="w-full px-2 py-1.5 rounded-console text-left hover:bg-neutral-100 text-neutral-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>安全与自愈中枢</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">{sentinelState.overallHealthScore}分</span>
                  </button>
                  {/* 7. 交接班对账 */}
                  <div className="h-px bg-neutral-200 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreMenuOpen(false);
                      setIsShiftHandoverOpen(true);
                    }}
                    className="w-full px-2 py-1.5 rounded-console text-left hover:bg-neutral-100 text-neutral-900 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                      <span>当班交接班对账</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">结算</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 桌面端/平板端平铺按钮组 (Desktop/Tablet Expanded Buttons: hidden on < md) */}
          <div className="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* 方案 C：全局顶部常驻即时喊号浮窗入口 */}
            <button
              type="button"
              id="global-header-quick-call-btn"
              onClick={() => setIsQuickCallModalOpen(true)}
              className="group/btn p-1.5 sm:px-2 sm:py-1 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-semibold text-xs rounded-console transition cursor-pointer border border-amber-500 flex items-center justify-center shadow-2xs shrink-0"
              title="全域即时叫号广播小窗（自提催取/呼叫骑手/堂食传菜/全域喊客，快捷键: Alt+C）"
              aria-label="喊号广播"
            >
              <Megaphone className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[80px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-semibold">喊号广播</span>
            </button>

            {/* 特许加盟与总部爆品中枢 */}
            <button
              type="button"
              id="franchise-hq-hub-btn"
              onClick={() => setIsFranchiseHQModalOpen(true)}
              className="group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-slate-50 active:scale-95 text-black font-semibold text-xs rounded-console transition cursor-pointer border border-border-main flex items-center justify-center shadow-2xs shrink-0"
              title="特许经营与加盟商多租户中枢 · 核心爆品全国强锁定"
              aria-label="加盟/HQ爆品中枢"
            >
              <Crown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[120px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-semibold text-black">加盟/HQ爆品中枢</span>
            </button>
          </div>

          {/* 营业状态总开关 (All devices) */}
          <button
            type="button"
            onClick={() => setIsBusinessStatusModalOpen(true)}
            className={`group/btn p-1.5 sm:px-2 sm:py-1 rounded-console font-semibold text-xs transition cursor-pointer border flex items-center justify-center shadow-2xs shrink-0 whitespace-nowrap ${
              businessStatus.isOpen
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
            }`}
            title={`流动餐车营业状态总控（当前: ${businessStatus.isOpen ? '营业中' : '已打烊'}）`}
            aria-label={businessStatus.isOpen ? '营业中' : '已打烊'}
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${businessStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[60px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-semibold">{businessStatus.isOpen ? '营业中' : '已打烊'}</span>
          </button>

          {/* 协同中枢聚合胶囊 (Tablet: md ~ xl) */}
          <button
            type="button"
            onClick={() => setIsHardwareHubOpen(true)}
            className="hidden md:flex xl:hidden group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-slate-50 text-black rounded-console font-semibold text-xs transition cursor-pointer border border-border-main items-center justify-center shadow-2xs shrink-0"
            title="打开硬件与协同中枢"
            aria-label="硬件与协同中枢"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal text-black">协同</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-0.5" />
          </button>

          {/* Desktop Expanded Buttons: Only visible on >= xl screens */}
          <div className="hidden xl:flex items-center gap-1 sm:gap-1.5 shrink-0">
            <MerchantVoiceControls showToast={showToast} />

            {/* Bluetooth Audio Player */}
            <button
              type="button"
              onClick={() => setIsBluetoothModalOpen(true)}
              style={{ backgroundColor: '#ffffff' }}
              className={`group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-neutral-50 rounded-console font-semibold text-xs transition cursor-pointer border flex items-center shadow-2xs shrink-0 ${
                activeBtDevice && activeBtDevice.status === 'connected'
                  ? 'text-blue-900 border-blue-200'
                  : 'text-neutral-700 border-border-main'
              }`}
              title={`流动餐车蓝牙音箱 · 当前: ${
                activeBtDevice?.status === 'connected' ? activeBtDevice.name : '未连接'
              }`}
            >
              <Bluetooth className={`w-3.5 h-3.5 shrink-0 ${
                activeBtDevice && activeBtDevice.status === 'connected' ? 'text-blue-600' : 'text-neutral-500'
              }`} />
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">蓝牙</span>
              {activeBtDevice && activeBtDevice.status === 'connected' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('scanner');
                showToast('已切换至扫码枪');
              }}
              className={`group/btn p-1.5 sm:px-2 sm:py-1 rounded-console font-semibold text-xs transition cursor-pointer border flex items-center shadow-2xs shrink-0 ${
                activeTab === 'scanner'
                  ? 'bg-[#2b593f] text-white border-[#2b593f]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
              title="扫码枪"
            >
              <Barcode className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'scanner' ? 'text-white' : 'text-emerald-700'}`} />
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">扫码</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMessageFormModalOpen(true)}
              className="group/btn p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-neutral-50 text-neutral-800 rounded-console font-semibold text-xs transition cursor-pointer border border-border-main flex items-center shadow-2xs shrink-0"
              title="订单协同消息与历史表单"
            >
              <div className="relative shrink-0">
                <MessageSquareText className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover/btn:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">消息</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCloudbaseModalOpen(true)}
              className="group/btn p-1.5 sm:px-2 sm:py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-console font-semibold text-xs transition cursor-pointer border border-sky-200 flex items-center shadow-2xs shrink-0"
              title="腾讯云数据同步"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[48px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal">同步</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-0.5" />
            </button>
          </div>

          {/* 骑手端入口 */}
          <button
            type="button"
            onClick={() => onSwitchRole('rider')}
            style={{ backgroundColor: '#ffffff' }}
            className="group/btn hidden sm:flex p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-[#f8f8f7] text-text-prominent rounded-console font-semibold text-xs transition cursor-pointer border border-border-main items-center shrink-0 shadow-2xs"
            title="切换至骑手端配送界面"
          >
            <Bike className="w-3.5 h-3.5 text-[#2b593f] shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/btn:max-w-[60px] group-hover/btn:opacity-100 group-hover/btn:ml-1 transition duration-normal font-semibold">骑手端</span>
          </button>
        </div>
      </header>
  </>
);
