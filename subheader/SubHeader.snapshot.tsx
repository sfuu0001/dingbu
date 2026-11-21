// @ts-nocheck
/**
 * 实时经营状态条（模块面包屑 + 快捷胶囊）
 * ---------------------------------------------------------------------------
 * 实时经营 chip / 当前模块 / 计数徽标串 / 指令台 ⌘K / 回收站 / 显示设置 / 全宽
 * 摘自 src/components/merchant/MerchantSystemView.tsx 第 2171–2424 行（原样，未改逻辑）
 * ⚠ 依赖 MerchantSystemView 作用域内的 state/props，接回或独立运行前请先看 ../README.md
 */

export const SubHeaderSnapshot = () => (
  <>
          <div
            style={{
              paddingLeft: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined,
              paddingRight: (wsPrefs.windowSafeMargin ?? 0) > 0 ? `${Math.max(8, wsPrefs.windowSafeMargin)}px` : undefined
            }}
            className={`shrink-0 bg-card-bg/95 backdrop-blur-xs border-b border-border-main py-1.5 shadow-2xs flex items-center gap-2 z-20 transition duration-fast ${
              (wsPrefs.windowSafeMargin ?? 0) > 0 ? '' : 'pl-2.5 pr-2 sm:pl-3.5 sm:pr-3'
            }`}
          >
            {/* Active Module Capsule Pill (严格按照图片样式执行设计，移动端与桌面端保持一致可见) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-white border border-border-main text-[11px] font-normal text-text-secondary whitespace-nowrap shadow-2xs"
                title="所属功能分组"
              >
                {currentTabConfig.category}
              </span>
              <span
                className="h-8 px-3.5 rounded-full bg-white text-neutral-950 border border-neutral-900 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-2xs select-none shrink-0"
                title="当前所在模块"
              >
                <CurrentIcon className="w-3.5 h-3.5 shrink-0 text-neutral-950" />
                <span className="tracking-tight">{currentTabConfig.label}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                {currentTabConfig.badge !== undefined && currentTabConfig.badge > 0 && (
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full border ${
                      currentTabConfig.badgeAlert
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-neutral-100 text-neutral-900 border-neutral-300'
                    }`}
                  >
                    {currentTabConfig.badge}
                  </span>
                )}
              </span>
            </div>

            {/* Quick Frequent Modules (Desktop & Mobile horizontal scrollable capsule bar) */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
              <div
                id="merchant-quick-tabs-container"
                ref={tabsContainerRef}
                className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 w-full scroll-smooth"
              >
                {(() => {
                  const displayTabs = allowedQuickTabs;
                  const isIconOnly = wsPrefs.buttonDisplayMode === 'icon_only';

                  return (
                    <>
                      {displayTabs.map((quick) => {
                        const Icon = quick.icon;
                        const isSelected = activeTab === quick.id;
                        return (
                          <button
                            key={quick.id}
                            id={`merchant-tab-btn-${quick.id}`}
                            data-tab-id={quick.id}
                            type="button"
                            title={quick.label}
                            onClick={() => setActiveTab(quick.id as MerchantTab)}
                            className={`rounded-full text-xs font-normal flex items-center transition duration-fast cursor-pointer whitespace-nowrap shrink-0 border group ${
                              isIconOnly ? 'px-2 py-1' : 'px-2.5 py-1 gap-1.5'
                            } ${
                              isSelected
                                ? 'border border-[#1a1918] bg-white text-text-prominent shadow-2xs font-semibold'
                                : 'border border-transparent bg-transparent text-[#5c5a54] hover:border-border-main hover:bg-neutral-50 hover:text-text-prominent'
                            }`}
                          >
                            <Icon className={`w-3 h-3 shrink-0 transition-colors ${isSelected ? 'text-text-prominent' : 'text-[#8c8a85]'}`} />
                            <span
                              className={`font-normal tracking-tight transition duration-normal overflow-hidden whitespace-nowrap ${
                                isIconOnly
                                  ? 'max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 group-hover:ml-1'
                                  : ''
                              }`}
                            >
                              {quick.label}
                            </span>
                            {isSelected && (
                              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ${isIconOnly ? 'ml-0.5' : ''}`} />
                            )}
                            {quick.badge !== undefined && quick.badge > 0 && (
                              <span
                                className={`text-[9.5px] font-normal px-1.5 py-0.2 rounded-full border shrink-0 ${
                                  isIconOnly ? 'ml-0.5' : ''
                                } ${
                                  isSelected
                                    ? 'bg-neutral-100 text-text-prominent border-neutral-300'
                                    : quick.badgeAlert
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-page-bg text-[#5c5a54] border-transparent'
                                }`}
                              >
                                {quick.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* 自定义顶部常用标签快捷按钮（一键唤起工作台显示设置管理区） */}
                      <button
                        type="button"
                        id="merchant-customize-quick-tabs-btn"
                        onClick={() => setWsPanelOpen(true)}
                        className={`rounded-full text-xs font-normal flex items-center transition duration-fast cursor-pointer whitespace-nowrap shrink-0 border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 shadow-2xs group ${
                          isIconOnly ? 'px-2 py-1' : 'px-2.5 py-1 gap-1'
                        }`}
                        title="自定义固定顶部常用功能标签并同步云端"
                      >
                        <Settings2 className="w-3 h-3 text-emerald-700 shrink-0 group-hover:rotate-45 transition-transform" />
                        <span
                          className={`font-normal tracking-tight transition duration-normal overflow-hidden whitespace-nowrap ${
                            isIconOnly
                              ? 'max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 group-hover:ml-1'
                              : ''
                          }`}
                        >
                          自定义
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          {allowedQuickTabs.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="md:hidden px-2.5 py-1 rounded-full text-xs font-normal flex items-center gap-1 text-text-secondary hover:bg-page-bg hover:text-text-prominent shrink-0 border border-dashed border-border-main bg-white"
                        title="展开全部功能模块侧边栏"
                      >
                        <MenuIcon className="w-3 h-3 text-text-secondary" />
                        <span className="whitespace-nowrap font-normal">全部</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Right Inline Controls: 回收站 / 显示设置 / 宽度切换（行内排布，支持根据显示偏好折叠为纯图标模式） */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* 指令中枢 (Command+K) 快捷入口 */}
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className={`h-7 flex items-center bg-[#1c1e21] hover:bg-black text-white rounded-full text-[11px] font-mono transition cursor-pointer shadow-2xs group ${
                  wsPrefs.buttonDisplayMode === 'icon_only' ? 'px-2' : 'px-2.5 gap-1.5'
                }`}
                title="战术指令中枢 (支持快捷键 Cmd+K / Ctrl+K 穿梭)"
              >
                <Command className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-normal" />
                <span className="hidden sm:inline font-sans text-xs">指令台</span>
                <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-mono hidden md:inline">⌘K</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRecycleBinOpen(true)}
                className={`h-7 flex items-center bg-white hover:bg-[#f8f8f7] border border-border-main hover:border-[#000000] rounded-full text-[11px] font-bold text-text-prominent transition cursor-pointer group ${
                  wsPrefs.buttonDisplayMode === 'icon_only' ? 'px-2' : 'px-2 gap-1'
                }`}
                title="统一回收站（删除的业务数据 30 天内可恢复）"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 group-hover:text-rose-600 transition duration-normal" />
                <span
                  className={`transition duration-normal overflow-hidden whitespace-nowrap ${
                    wsPrefs.buttonDisplayMode === 'icon_only'
                      ? 'max-w-0 opacity-0 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:ml-1'
                      : 'hidden sm:inline'
                  }`}
                >
                  回收站
                </span>
                {recycleBinCount > 0 && (
                  <span className={`text-[9.5px] font-mono font-bold px-1 rounded-full bg-dark-container text-white shrink-0 ${wsPrefs.buttonDisplayMode === 'icon_only' ? 'ml-1' : ''}`}>
                    {recycleBinCount}
                  </span>
                )}
              </button>
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setWsPanelOpen((v) => !v)}
                  className={`h-7 flex items-center border rounded-full text-[11px] font-bold transition cursor-pointer group ${
                    wsPrefs.buttonDisplayMode === 'icon_only' ? 'px-2' : 'px-2 gap-1'
                  } ${
                    wsPanelOpen
                      ? 'bg-[#000000] text-white border-[#000000]'
                      : 'bg-white text-[#1a1c1b] border-border-main hover:border-[#000000]'
                  }`}
                  title="工作台显示设置（快捷与悬浮按钮显示模式 / 内容宽度 / 订单列数 / 毛利红线 / 客食端预览管控）"
                >
                  <Settings2 className={`w-3.5 h-3.5 shrink-0 transition duration-slow ${wsPanelOpen ? 'rotate-90 text-emerald-400' : 'group-hover:rotate-90 group-hover:text-emerald-600'}`} />
                  <span
                    className={`transition duration-normal overflow-hidden whitespace-nowrap ${
                      wsPrefs.buttonDisplayMode === 'icon_only'
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
                className={`hidden xl:flex h-7 bg-white hover:bg-[#f8f8f7] text-text-secondary hover:text-text-prominent rounded-full transition cursor-pointer items-center border border-border-main hover:border-border-main shrink-0 text-xs font-medium group ${
                  wsPrefs.buttonDisplayMode === 'icon_only' ? 'px-2' : 'px-2 gap-1'
                }`}
                title={wsPrefs.contentWidth === 'wide' ? '切换为标准居中工作台（宽度三档可在显示设置调节）' : '切换为全宽铺满工作台 (100% Fluid)'}
              >
                {wsPrefs.contentWidth === 'wide' ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:scale-110 group-hover:text-neutral-900 transition duration-normal" />
                    <span
                      className={`text-[11px] transition duration-normal overflow-hidden whitespace-nowrap ${
                        wsPrefs.buttonDisplayMode === 'icon_only'
                          ? 'max-w-0 opacity-0 group-hover:max-w-[60px] group-hover:opacity-100 group-hover:ml-1'
                          : 'hidden 2xl:inline'
                      }`}
                    >
                      居中
                    </span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:scale-110 group-hover:text-neutral-900 transition duration-normal" />
                    <span
                      className={`text-[11px] transition duration-normal overflow-hidden whitespace-nowrap ${
                        wsPrefs.buttonDisplayMode === 'icon_only'
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
