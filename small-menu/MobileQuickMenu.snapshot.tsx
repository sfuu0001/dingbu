// @ts-nocheck
/**
 * 手机端快捷菜单（内联浮层）
 * ---------------------------------------------------------------------------
 * 移动端「更多」下拉面板
 * 摘自 src/components/merchant/MerchantSystemView.tsx 第 1871–1992 行（原样，未改逻辑）
 * ⚠ 依赖 MerchantSystemView 作用域内的 state/props，接回或独立运行前请先看 ../README.md
 */

export const MobileQuickMenuSnapshot = () => (
  <>
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
  </>
);
