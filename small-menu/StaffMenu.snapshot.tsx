// @ts-nocheck
/**
 * 员工账号下拉菜单（内联浮层）
 * ---------------------------------------------------------------------------
 * 点「张伟（店长）」弹出的账号菜单
 * 摘自 src/components/merchant/MerchantSystemView.tsx 第 1763–1827 行（原样，未改逻辑）
 * ⚠ 依赖 MerchantSystemView 作用域内的 state/props，接回或独立运行前请先看 ../README.md
 */

export const StaffMenuSnapshot = () => (
  <>
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
  </>
);
