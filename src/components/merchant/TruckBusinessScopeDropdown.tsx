import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Truck,
  ChevronDown,
  Power,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  Sliders,
  X,
  Layers,
  Lock,
  Star,
  Building2,
  Crown,
  Pencil,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BusinessStatusConfig,
  getTruckBusinessStatus,
  getAllTruckBusinessStatuses,
  toggleTruckOperating,
  toggleTruckChannelOperating
} from '../../utils/businessStatusEngine';
import { getUnifiedTruckName } from '../../utils/truckNaming';
import {
  globalFranchiseEngine,
  FRANCHISE_TENANT_EVENT,
  FRANCHISE_POLICY_EVENT
} from '../../utils/franchiseTenantEngine';
import { FranchiseTenantContext, FranchiseDishPolicy } from '../../types/franchise';
import { getSessions } from '../../utils/tableSessionEngine';
import {
  getAllTruckConfigs,
  TRUCK_LOCATION_EVENT
} from '../../utils/truckLocationEngine';
import { renameTruck, createTruck } from '../../utils/truckRegistry';
import { getMerchantSession } from '../../utils/staffAndRiderAuthEngine';

export interface TruckScopeItem {
  truckId: string;
  truckName: string;
  status?: string;
  address?: string;
  [key: string]: any;
}

/**
 * 由定位引擎派生管控列表：名称/地址以 getAllTruckConfigs()（已叠加云端覆盖）为准。
 * status 沿用旧逻辑：配置里没有就给 'active'。
 */
const deriveFleetTrucks = (): TruckScopeItem[] => {
  try {
    return getAllTruckConfigs().map((t) => ({
      truckId: t.id,
      truckName: t.name,
      address: ((t as any).address as string) || '',
      status: ((t as any).status as string) || 'active'
    }));
  } catch {
    return [];
  }
};

interface TruckBusinessScopeDropdownProps {
  selectedTruckId: string;
  onSelectTruck: (truckId: string) => void;
  merchantTruckConfigs: TruckScopeItem[];
  businessStatus: BusinessStatusConfig;
  onOpenDetailedModal: () => void;
  showToast: (msg: string) => void;
  onOpenHQModal?: () => void;
}

export const TruckBusinessScopeDropdown: React.FC<TruckBusinessScopeDropdownProps> = ({
  selectedTruckId,
  onSelectTruck,
  merchantTruckConfigs,
  businessStatus,
  onOpenDetailedModal,
  showToast,
  onOpenHQModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 站点列表改为定位引擎驱动：改名/新建后由 TRUCK_LOCATION_EVENT 触发重算
  const [fleetTrucks, setFleetTrucks] = useState<TruckScopeItem[]>(() => deriveFleetTrucks());

  // 行内编辑：同一时间只展开一行
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; address: string }>({
    name: '',
    address: ''
  });
  const [editError, setEditError] = useState('');

  // 内联新建表单
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<{ name: string; address: string }>({
    name: '',
    address: ''
  });
  const [createError, setCreateError] = useState('');

  // 防止重复提交（编辑/新建共用）
  const [submitting, setSubmitting] = useState(false);

  // 权限：仅总部账号（scope === 'all'）可改名/新建
  const isHqScope = getMerchantSession()?.scope === 'all';

  // Multi-tenant franchise context & policy states
  const [franchiseContext, setFranchiseContext] = useState<FranchiseTenantContext>(() =>
    globalFranchiseEngine.getContext()
  );
  const [policies, setPolicies] = useState<FranchiseDishPolicy[]>(() =>
    globalFranchiseEngine.getPolicies()
  );

  // Maintain reactive dictionary of all trucks' business configs
  const [allStatuses, setAllStatuses] = useState<Record<string, BusinessStatusConfig>>(() =>
    getAllTruckBusinessStatuses()
  );

  // Live in-session dining tables count
  const [activeTableCount, setActiveTableCount] = useState<number>(() => {
    try {
      const sessions = getSessions();
      const count = sessions.filter((s) => s.status === 'open').length;
      return count > 0 ? count : 7;
    } catch {
      return 7;
    }
  });

  useEffect(() => {
    const handleTenant = (e: Event) => {
      const custom = e as CustomEvent<FranchiseTenantContext>;
      if (custom.detail) setFranchiseContext(custom.detail);
      else setFranchiseContext(globalFranchiseEngine.getContext());
    };
    const handlePolicy = (e: Event) => {
      const custom = e as CustomEvent<FranchiseDishPolicy[]>;
      if (custom.detail) setPolicies(custom.detail);
      else setPolicies(globalFranchiseEngine.getPolicies());
    };

    window.addEventListener(FRANCHISE_TENANT_EVENT, handleTenant);
    window.addEventListener(FRANCHISE_POLICY_EVENT, handlePolicy);
    return () => {
      window.removeEventListener(FRANCHISE_TENANT_EVENT, handleTenant);
      window.removeEventListener(FRANCHISE_POLICY_EVENT, handlePolicy);
    };
  }, []);

  // Update open tables count when opened or periodically
  useEffect(() => {
    if (!isOpen) return;
    try {
      const sessions = getSessions();
      const count = sessions.filter((s) => s.status === 'open').length;
      setActiveTableCount(count > 0 ? count : 7);
    } catch {
      // fallback
    }
  }, [isOpen]);

  // Keep allStatuses reactive to external updates
  useEffect(() => {
    const handleStatusSync = () => {
      setAllStatuses(getAllTruckBusinessStatuses());
    };
    window.addEventListener('business-status-change', handleStatusSync);
    window.addEventListener('storage', handleStatusSync);
    return () => {
      window.removeEventListener('business-status-change', handleStatusSync);
      window.removeEventListener('storage', handleStatusSync);
    };
  }, []);

  // 改名/新建会由引擎广播 TRUCK_LOCATION_EVENT：挂载一次监听并卸载清理，确保列表即时重算
  useEffect(() => {
    const handleTruckLocation = () => setFleetTrucks(deriveFleetTrucks());
    window.addEventListener(TRUCK_LOCATION_EVENT, handleTruckLocation);
    return () => window.removeEventListener(TRUCK_LOCATION_EVENT, handleTruckLocation);
  }, []);

  // Keyboard escape handler & body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const lockedCount = policies.filter((p) => p.isHqLocked).length;

  const activeTruckStatus =
    allStatuses[selectedTruckId] || businessStatus || getTruckBusinessStatus(selectedTruckId);

  const currentTruck = merchantTruckConfigs.find((t) => t.truckId === selectedTruckId) || {
    truckId: selectedTruckId,
    truckName: getUnifiedTruckName(selectedTruckId, 'short'),
    status: 'active'
  };

  const getTruckLabel = (
    t: { truckId?: string; truckName?: string; id?: string; name?: string } | string,
    format: 'short' | 'standard' | 'full' = 'standard'
  ) => {
    return getUnifiedTruckName(t, format);
  };

  // --- Real Functional Handlers for any specific truck ---

  // 1. Toggle master switch for a given truck
  const handleToggleTruckMaster = (truckId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isAccessible =
      franchiseContext.isHqUser || franchiseContext.accessibleTruckIds.includes(truckId);
    const label = getTruckLabel({ truckId, truckName: '' }, 'short');

    if (!isAccessible) {
      showToast(`🔒【沙箱保护】您属于加盟商沙箱，无权管控非管辖餐车【${label}】`);
      return;
    }

    const targetStatus = allStatuses[truckId] || getTruckBusinessStatus(truckId);
    const nextIsOpen = !targetStatus.isOpen;

    const updated = toggleTruckOperating(truckId, nextIsOpen);
    setAllStatuses((prev) => ({ ...prev, [truckId]: updated }));

    if (nextIsOpen) {
      showToast(`🟢 【${label}】营业总开关已开启：该餐车全网恢复接单！`);
    } else {
      showToast(`🔴 【${label}】营业总开关已关闭：该餐车已暂停接单`);
    }
  };

  // 2, 3, 4. Toggle specific channel for a given truck
  const handleToggleTruckChannel = (
    truckId: string,
    channel: 'dine_in' | 'delivery' | 'pickup',
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    const isAccessible =
      franchiseContext.isHqUser || franchiseContext.accessibleTruckIds.includes(truckId);
    const label = getTruckLabel({ truckId, truckName: '' }, 'short');

    if (!isAccessible) {
      showToast(`🔒【沙箱保护】您属于加盟商沙箱，无权修改非管辖餐车【${label}】渠道`);
      return;
    }

    const targetStatus = allStatuses[truckId] || getTruckBusinessStatus(truckId);
    const currentVal =
      channel === 'dine_in'
        ? targetStatus.dineInOpen !== false
        : channel === 'delivery'
        ? targetStatus.deliveryOpen !== false
        : targetStatus.pickupOpen !== false;
    const nextVal = !currentVal;

    const updated = toggleTruckChannelOperating(truckId, channel, nextVal);
    setAllStatuses((prev) => ({ ...prev, [truckId]: updated }));

    const channelNames = {
      dine_in: '堂食',
      delivery: '外卖',
      pickup: '自提'
    };
    const icon = channel === 'dine_in' ? '🍽️' : channel === 'delivery' ? '🛵' : '🛍️';

    showToast(
      nextVal
        ? `${icon} 【${label}】${channelNames[channel]}渠道已开启：正常接单中`
        : `${icon} 【${label}】${channelNames[channel]}渠道已暂停：停止该渠道接单`
    );
  };

  // --- 门店改名 / 改地址（仅总部） ---

  const openEditTruck = (t: TruckScopeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHqScope) return;
    if (editingTruckId === t.truckId) {
      // 再次点击同一行收起编辑条
      setEditingTruckId(null);
      setEditError('');
      return;
    }
    setEditingTruckId(t.truckId);
    setEditForm({ name: t.truckName || '', address: t.address || '' });
    setEditError('');
    setIsCreating(false);
    setCreateError('');
  };

  const closeEditTruck = () => {
    setEditingTruckId(null);
    setEditError('');
  };

  const saveEditTruck = async (truckId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isHqScope || submitting) return;
    const name = editForm.name.trim();
    if (!name) {
      setEditError('门店名称不能为空');
      return;
    }
    setSubmitting(true);
    setEditError('');
    try {
      const res = await renameTruck(
        truckId,
        { name, address: editForm.address },
        getMerchantSession()?.phone
      );
      if (res.ok) {
        closeEditTruck();
        setFleetTrucks(deriveFleetTrucks());
        showToast(`✅ 【${name}】门店信息已更新`);
      } else {
        setEditError(res.message || '保存失败，请重试');
      }
    } catch {
      setEditError('保存失败，请检查网络后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // --- 新建餐车（仅总部） ---

  const toggleCreateForm = () => {
    if (!isHqScope) return;
    setIsCreating((prev) => !prev);
    setCreateForm({ name: '', address: '' });
    setCreateError('');
    setEditingTruckId(null);
    setEditError('');
  };

  const submitCreateTruck = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isHqScope || submitting) return;
    const name = createForm.name.trim();
    if (!name) {
      setCreateError('请填写门店名称');
      return;
    }
    setSubmitting(true);
    setCreateError('');
    try {
      const res = await createTruck(
        { name, address: createForm.address },
        getMerchantSession()?.phone
      );
      if (res.ok) {
        setIsCreating(false);
        setCreateForm({ name: '', address: '' });
        setFleetTrucks(deriveFleetTrucks());
        if (res.truckId) {
          onSelectTruck(res.truckId);
          globalFranchiseEngine.switchTruck(res.truckId);
        }
        showToast(`✅ 新门店【${name}】已创建`);
      } else {
        setCreateError(res.message || '创建失败，请重试');
      }
    } catch {
      setCreateError('创建失败，请检查网络后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const isDineInActive = activeTruckStatus.dineInOpen !== false;
  const isDeliveryActive = activeTruckStatus.deliveryOpen !== false;
  const isPickupActive = activeTruckStatus.pickupOpen !== false;

  // 列表来源：定位引擎派生的实时站点（替代原硬编码数组；改名/新建后由事件重算）
  // 「共 N 辆餐车」直接使用派生列表长度。
  const truckList = fleetTrucks;

  return (
    <div
      ref={containerRef}
      id="truck-business-scope-dropdown-container"
      className="relative shrink-0 flex items-center"
    >
      {/* 手机端：单图标按钮 */}
      <button
        type="button"
        id="truck-business-scope-dropdown-trigger-mobile"
        onClick={() => setIsOpen(true)}
        className="sm:hidden relative p-1.5 bg-white hover:bg-[var(--sc-surface-alt)] active:scale-95 text-[var(--sc-ink-strong)] rounded-[var(--sc-radius-xs)] transition cursor-pointer border border-[var(--sc-line-soft)] hover:border-[var(--sc-brand-primary)] flex items-center justify-center shrink-0"
        title={`餐车站台与渠道调度 (${getTruckLabel(currentTruck as any, 'short')}) · ${activeTruckStatus.isOpen ? '营业中' : '已暂停'}`}
        aria-label="打开餐车站台与渠道调度中枢"
        aria-expanded={isOpen}
      >
        <Truck className="w-4 h-4 text-[var(--sc-brand-primary)]" />
        <span
          className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white shrink-0 ${
            activeTruckStatus.isOpen ? 'bg-[var(--sc-brand-primary)] animate-pulse' : 'bg-[var(--sc-state-danger)]'
          }`}
          title={activeTruckStatus.isOpen ? '营业中' : '已暂停'}
        />
      </button>

      {/* 桌面与平板端：复合胶囊详细展示 */}
      <div className="hidden sm:flex items-center bg-white border border-[var(--sc-line-soft)] hover:border-[var(--sc-brand-primary)] rounded-[var(--sc-radius-xs)] px-2 py-0.5 shrink-0 transition-colors">
        <button
          type="button"
          id="truck-business-scope-dropdown-trigger"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 cursor-pointer text-left outline-none py-0.5"
          title="点击打开多餐车站台营业与渠道调度中枢"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          {/* Tenant Role Pill */}
          <div
            className={`flex items-center gap-1 px-1.5 py-0.2 rounded-[var(--sc-radius-xs)] border text-[10px] font-bold shrink-0 ${
              franchiseContext.isHqUser
                ? 'bg-[#FFF8EB] text-[var(--sc-state-warn)] border-[var(--sc-state-warn)]/35'
                : 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/30'
            }`}
            title={`当前身份: ${franchiseContext.isHqUser ? '品牌总部 HQ (Super Admin)' : '特许加盟商沙箱'} · 操作员: ${franchiseContext.operatorName}`}
          >
            {franchiseContext.isHqUser ? (
              <Crown className="w-3 h-3 text-[var(--sc-state-warn)] shrink-0" />
            ) : (
              <Building2 className="w-3 h-3 text-[var(--sc-brand-primary)] shrink-0" />
            )}
            <span>
              {franchiseContext.isHqUser ? 'HQ总部' : '加盟沙箱'}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-[var(--sc-line-soft)] shrink-0" />

          {(() => {
            const allConfigs = getAllTruckConfigs();
            const trkConfig = allConfigs.find((cfg) => cfg.id === selectedTruckId);
            const logo = trkConfig?.logo || trkConfig?.image;
            return logo ? (
              <div className="w-4 h-4 rounded-[var(--sc-radius-xs)] overflow-hidden border border-[var(--sc-brand-primary)]/40 shrink-0">
                <img loading="lazy" decoding="async" src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <Truck className="w-3.5 h-3.5 text-[var(--sc-brand-primary)] shrink-0" />
            );
          })()}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] font-bold text-[var(--sc-ink-strong)] truncate max-w-[112px] lg:max-w-[160px]">
              {getTruckLabel(currentTruck as any, 'standard')}
            </span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                activeTruckStatus.isOpen ? 'bg-[var(--sc-brand-primary)] animate-pulse' : 'bg-[var(--sc-state-danger)]'
              }`}
              title={activeTruckStatus.isOpen ? '当前餐车总开关: 营业中' : '当前餐车总开关: 已暂停'}
            />
          </div>

          {/* Channel quick indicator pills for active truck */}
          <div className="hidden lg:flex items-center gap-0.5 text-[9.5px] tabular-nums text-[var(--sc-ink-body)] pl-0.5">
            <span
              className={`px-1 py-0.2 rounded-[var(--sc-radius-xs)] font-bold ${
                isDineInActive && activeTruckStatus.isOpen
                  ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)]'
                  : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] line-through'
              }`}
              title={`堂食: ${isDineInActive ? '开启' : '关闭'}`}
            >
              堂
            </span>
            <span
              className={`px-1 py-0.2 rounded-[var(--sc-radius-xs)] font-bold ${
                isDeliveryActive && activeTruckStatus.isOpen
                  ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)]'
                  : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] line-through'
              }`}
              title={`外卖: ${isDeliveryActive ? '开启' : '关闭'}`}
            >
              外
            </span>
            <span
              className={`px-1 py-0.2 rounded-[var(--sc-radius-xs)] font-bold ${
                isPickupActive && activeTruckStatus.isOpen
                  ? 'bg-[#FFF8EB] text-[var(--sc-state-warn)]'
                  : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] line-through'
              }`}
              title={`自提: ${isPickupActive ? '开启' : '关闭'}`}
            >
              提
            </span>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--sc-ink-body)] shrink-0 transition-transform duration-normal ${
              isOpen ? 'rotate-180 text-[var(--sc-brand-primary)]' : ''
            }`}
          />
        </button>
      </div>

      {/* Modern Centered Modal Overlay (适配三端：Mobile / Tablet / Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <div
            id="truck-business-scope-modal-backdrop"
            className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              id="truck-business-scope-modal-card"
              data-purpose="dispatch-modal-card"
              className="w-full max-w-[560px] bg-[var(--sc-surface-base)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-md)] shadow-2xl flex flex-col overflow-hidden text-[13px] leading-snug my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BEGIN: HeaderSection */}
              <header className="px-4 py-3.5 border-b border-[var(--sc-line-soft)] bg-[var(--sc-surface-base)] flex items-start justify-between shrink-0">
                {/* Title Group */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-7 h-7 rounded-[var(--sc-radius-sm)] bg-[var(--sc-brand-primary-soft)] border border-[var(--sc-brand-primary)]/30 text-[var(--sc-brand-primary)] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-[var(--sc-brand-primary)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-[14px] font-bold text-[var(--sc-ink-strong)]">
                        多餐车站台营业与渠道调度中枢
                      </h1>
                      <span className="tabular-nums text-[10px] px-1.5 py-0.5 bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-sm)] font-bold">
                        v2.9-SC
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--sc-ink-body)] mt-0.5">
                      每辆餐车独立总开关 + 堂食 / 外卖 / 自提 3 大渠道独立调度
                    </p>
                  </div>
                </div>

                {/* Close Window Button */}
                <button
                  aria-label="关闭控制台"
                  className="text-[var(--sc-ink-muted)] hover:text-[var(--sc-ink-strong)] hover:bg-[var(--sc-surface-alt)] p-1 rounded-[var(--sc-radius-sm)] transition-colors duration-fast cursor-pointer"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </header>
              {/* END: HeaderSection */}

              {/* BEGIN: GovernanceBar */}
              <section className="px-4 py-2 bg-[var(--sc-surface-raised)] border-b border-[var(--sc-line-soft)] flex items-center justify-between text-[11px] shrink-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                  {/* HQ Label Badge */}
                  <span
                    className={`inline-flex items-center gap-1 tabular-nums font-bold px-1.5 py-0.5 rounded-[var(--sc-radius-sm)] text-[10px] shrink-0 border ${
                      franchiseContext.isHqUser
                        ? 'bg-[#FFF8EB] text-[var(--sc-state-warn)] border-[var(--sc-state-warn)]/40'
                        : 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/35'
                    }`}
                  >
                    {franchiseContext.isHqUser ? (
                      <Crown className="w-3 h-3 text-[var(--sc-state-warn)]" />
                    ) : (
                      <Building2 className="w-3 h-3 text-[var(--sc-brand-primary)]" />
                    )}
                    {franchiseContext.isHqUser ? '品牌总部(HQ)' : '特许加盟商沙箱'}
                  </span>
                  {isHqScope && (
                    <span
                      className="hidden sm:inline text-[10px] text-[var(--sc-brand-primary)] font-semibold shrink-0"
                      title="总部账号可修改门店名称/地址并新建餐车"
                    >
                      门店可改名/新建
                    </span>
                  )}

                  {/* Operator & Fleet Scope Identification */}
                  <span className="text-[var(--sc-line-strong)]">|</span>
                  <span className="text-[var(--sc-ink-body)] truncate font-medium">
                    {franchiseContext.operatorName || '黑曜石品控中心'}
                  </span>
                  <span className="tabular-nums text-[var(--sc-ink-muted)] text-[10px] shrink-0">#0924</span>
                  <span className="text-[var(--sc-line-strong)] hidden xs:inline">|</span>
                  <span className="text-[var(--sc-ink-body)] tabular-nums text-[10px] truncate hidden xs:inline">
                    管辖:{' '}
                    <span className="text-[var(--sc-ink-strong)] font-semibold">
                      {franchiseContext.accessibleTruckIds && franchiseContext.accessibleTruckIds.length > 0
                        ? franchiseContext.accessibleTruckIds.join(' ~ ')
                        : 'truck-01 ~ 03'}
                    </span>
                  </span>
                </div>

                {/* Super Admin Locked Core SKUs Action */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenHQModal) {
                      setIsOpen(false);
                      onOpenHQModal();
                    } else {
                      showToast(`已锁定 ${lockedCount} 款核心爆品`);
                    }
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-1 bg-white hover:bg-[var(--sc-surface-alt)] text-[var(--sc-ink-strong)] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] shadow-xs transition shrink-0 cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-[var(--sc-state-warn)]" />
                  <span>
                    爆品锁定: <strong className="tabular-nums text-[var(--sc-ink-strong)]">{lockedCount}款</strong>
                  </span>
                  <span className="text-[9.5px] px-1 bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-xs)] font-bold">
                    HQ中枢
                  </span>
                </button>
              </section>
              {/* END: GovernanceBar */}

              {/* Scrollable Content Zone */}
              <main className="custom-scrollbar overflow-y-auto max-h-[calc(86vh-130px)] p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 bg-[var(--sc-surface-sunken)]">
                {/* BEGIN: FocusedVehicleSection */}
                <section className="border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-sm)] bg-[var(--sc-surface-base)] p-3.5 shadow-xs space-y-3.5">
                  {/* Status Bar Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] text-[var(--sc-ink-muted)] font-medium shrink-0">当前重点管控:</span>
                      <span className="text-[13px] font-bold text-[var(--sc-ink-strong)] truncate">
                        {getTruckLabel(currentTruck as any, 'standard')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleToggleTruckMaster(selectedTruckId, e)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-bold rounded-[var(--sc-radius-sm)] shadow-xs transition-colors cursor-pointer shrink-0 ${
                        activeTruckStatus.isOpen
                          ? 'bg-[var(--sc-brand-primary-soft)] hover:bg-[#DCEDF8] border-[var(--sc-brand-primary)]/40 text-[var(--sc-brand-primary)]'
                          : 'bg-[#FDECEC] hover:bg-[#FADADA] border-[var(--sc-state-danger)]/45 text-[var(--sc-state-danger)]'
                      }`}
                      title="点击切换整车营业状态"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full pulse-indicator ${
                          activeTruckStatus.isOpen ? 'bg-[var(--sc-brand-primary)]' : 'bg-[var(--sc-state-danger)]'
                        }`}
                      />
                      <span className="tabular-nums font-bold">
                        {activeTruckStatus.isOpen ? '营业接单中' : '已暂停营业'}
                      </span>
                      <Power className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>

                  {/* Master Power Control Big Card */}
                  <div className="px-3 py-2 bg-[var(--sc-surface-raised)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-sm)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-[var(--sc-radius-sm)] flex items-center justify-center shrink-0 ${
                          activeTruckStatus.isOpen
                            ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)]'
                            : 'bg-[#FDECEC] text-[var(--sc-state-danger)]'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                      </div>
                      <span className="font-bold text-[12px] text-[var(--sc-ink-strong)] shrink-0">营业总开关</span>
                      <span
                        className={`text-[10px] font-bold border px-1.5 py-0.2 rounded-[var(--sc-radius-xs)] shrink-0 ${
                          activeTruckStatus.isOpen
                            ? 'text-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary-soft)] border-[var(--sc-brand-primary)]/35'
                            : 'text-[var(--sc-state-danger)] bg-[#FDECEC] border-[var(--sc-state-danger)]/40'
                        }`}
                      >
                        {activeTruckStatus.isOpen ? '正常接单' : '已暂停接单'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleTruckMaster(selectedTruckId, e)}
                      className={`px-2.5 py-1 bg-white border font-semibold text-[11px] rounded-[var(--sc-radius-sm)] flex items-center gap-1.5 shadow-xs active:scale-[0.99] transition shrink-0 cursor-pointer ${
                        activeTruckStatus.isOpen
                          ? 'border-[var(--sc-line-strong)] hover:border-[var(--sc-state-danger)]/50 hover:bg-[#FDECEC] text-[var(--sc-ink-strong)] hover:text-[var(--sc-state-danger)]'
                          : 'border-[var(--sc-line-strong)] hover:border-[var(--sc-brand-primary)] hover:bg-[var(--sc-brand-primary-soft)] text-[var(--sc-ink-strong)] hover:text-[var(--sc-brand-primary)]'
                      }`}
                      title={activeTruckStatus.isOpen ? '暂停接单' : '恢复接单'}
                    >
                      <Power
                        className={`w-3 h-3 shrink-0 ${
                          activeTruckStatus.isOpen ? 'text-[var(--sc-state-danger)]' : 'text-[var(--sc-brand-primary)]'
                        }`}
                      />
                      <span>{activeTruckStatus.isOpen ? '暂停接单' : '开启接单'}</span>
                    </button>
                  </div>

                  {/* 3 Independent Order Channels Grid */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[var(--sc-ink-body)] px-0.5">
                      <span>当前餐车 3 大渠道独立接单控制:</span>
                      <span className="text-[var(--sc-ink-muted)] text-[10px] font-medium">独立控制接单渠道</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Channel 1: Dine-in */}
                      <div
                        onClick={(e) => handleToggleTruckChannel(selectedTruckId, 'dine_in', e)}
                        className={`border p-2.5 rounded-[var(--sc-radius-sm)] flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-xs ${
                          isDineInActive
                            ? 'bg-white border-[var(--sc-brand-primary)]/45 hover:border-[var(--sc-brand-primary)]'
                            : 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-raised)] hover:border-[var(--sc-line-strong)] opacity-80'
                        }`}
                        title="点击切换堂食渠道接单状态"
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center mb-1.5 border group-hover:scale-105 transition-transform rounded-[var(--sc-radius-sm)] ${
                            isDineInActive
                              ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/30'
                              : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] border-[var(--sc-line-soft)]'
                          }`}
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div className="text-[12px] font-bold text-[var(--sc-ink-strong)] mb-1">堂食开关</div>
                        <span
                          className={`inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-[var(--sc-radius-xs)] border ${
                            isDineInActive
                              ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-primary)]/35'
                              : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)] border-[var(--sc-line-soft)]'
                          }`}
                        >
                          {isDineInActive ? '已开启' : '已暂停'}
                        </span>
                        <span className="text-[10px] text-[var(--sc-ink-muted)] mt-1 tabular-nums">
                          {isDineInActive ? `${activeTableCount}桌在席` : '暂停堂食'}
                        </span>
                      </div>

                      {/* Channel 2: Takeout Delivery */}
                      <div
                        onClick={(e) => handleToggleTruckChannel(selectedTruckId, 'delivery', e)}
                        className={`border p-2.5 rounded-[var(--sc-radius-sm)] flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-xs ${
                          isDeliveryActive
                            ? 'bg-white border-[var(--sc-brand-accent)]/60 hover:border-[var(--sc-brand-primary)]'
                            : 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-raised)] hover:border-[var(--sc-line-strong)] opacity-80'
                        }`}
                        title="点击切换外卖渠道接单状态"
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center mb-1.5 border group-hover:scale-105 transition-transform rounded-[var(--sc-radius-sm)] ${
                            isDeliveryActive
                              ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-accent)]/50'
                              : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] border-[var(--sc-line-soft)]'
                          }`}
                        >
                          <Bike className="w-4 h-4" />
                        </div>
                        <div className="text-[12px] font-bold text-[var(--sc-ink-strong)] mb-1">外卖开关</div>
                        <span
                          className={`inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-[var(--sc-radius-xs)] border ${
                            isDeliveryActive
                              ? 'bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] border-[var(--sc-brand-accent)]/50'
                              : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)] border-[var(--sc-line-soft)]'
                          }`}
                        >
                          {isDeliveryActive ? '已开启' : '已暂停'}
                        </span>
                        <span className="text-[10px] text-[var(--sc-ink-muted)] mt-1">美团 / 饿了么</span>
                      </div>

                      {/* Channel 3: Self Pickup */}
                      <div
                        onClick={(e) => handleToggleTruckChannel(selectedTruckId, 'pickup', e)}
                        className={`border p-2.5 rounded-[var(--sc-radius-sm)] flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-xs ${
                          isPickupActive
                            ? 'bg-white border-[var(--sc-state-warn)]/45 hover:border-[var(--sc-state-warn)]'
                            : 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-raised)] hover:border-[var(--sc-line-strong)] opacity-80'
                        }`}
                        title="点击切换自提渠道接单状态"
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center mb-1.5 border group-hover:scale-105 transition-transform rounded-[var(--sc-radius-sm)] ${
                            isPickupActive
                              ? 'bg-[#FFF8EB] text-[var(--sc-state-warn)] border-[var(--sc-state-warn)]/35'
                              : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] border-[var(--sc-line-soft)]'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="text-[12px] font-bold text-[var(--sc-ink-strong)] mb-1">自提开关</div>
                        <span
                          className={`inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-[var(--sc-radius-xs)] border ${
                            isPickupActive
                              ? 'bg-[#FFF8EB] text-[var(--sc-state-warn)] border-[var(--sc-state-warn)]/35'
                              : 'bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)] border-[var(--sc-line-soft)]'
                          }`}
                        >
                          {isPickupActive ? '已开启' : '已暂停'}
                        </span>
                        <span className="text-[10px] text-[var(--sc-ink-muted)] mt-1">恒温提餐柜</span>
                      </div>
                    </div>
                  </div>
                </section>
                {/* END: FocusedVehicleSection */}

                {/* BEGIN: FleetOverviewList */}
                <section className="space-y-2.5">
                  {/* List Header */}
                  <div className="flex items-center justify-between gap-2 px-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-[12px] text-[var(--sc-ink-strong)] min-w-0">
                      <Layers className="w-3.5 h-3.5 text-[var(--sc-brand-primary)] shrink-0" />
                      <span className="truncate">各餐车站台独立管控列表 (分别 4 开关)</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="tabular-nums text-[11px] text-[var(--sc-ink-body)]">
                        共 {truckList.length} 辆餐车
                      </span>
                      {isHqScope && (
                        <button
                          type="button"
                          onClick={toggleCreateForm}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 border border-[var(--sc-brand-primary)]/45 bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] text-[10.5px] font-bold rounded-[var(--sc-radius-sm)] hover:bg-[#DCEDF8] cursor-pointer"
                          title="总部账号可新建流动餐车"
                        >
                          <Plus className="w-3 h-3" />
                          新建餐车
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 新建餐车内联表单（仅总部，不弹新弹窗） */}
                  {isCreating && isHqScope && (
                    <div
                      className="px-2.5 py-2 rounded-[var(--sc-radius-sm)] border border-[var(--sc-brand-primary)]/40 bg-[var(--sc-brand-primary-soft)]/50 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--sc-brand-primary)]">
                        <Plus className="w-3.5 h-3.5" />
                        新建流动餐车
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-[10px] text-[var(--sc-ink-body)]">门店名称（必填）</span>
                          <input
                            type="text"
                            value={createForm.name}
                            maxLength={30}
                            placeholder="如：06 号流动餐车"
                            onChange={(e) =>
                              setCreateForm((f) => ({ ...f, name: e.target.value }))
                            }
                            className="w-full px-2 py-1 text-[12px] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] bg-white text-[var(--sc-ink-strong)] outline-none focus:border-[var(--sc-brand-primary)] placeholder:text-[var(--sc-ink-muted)]"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[10px] text-[var(--sc-ink-body)]">门店地址（可留空）</span>
                          <input
                            type="text"
                            value={createForm.address}
                            maxLength={60}
                            placeholder="门店地址（可留空）"
                            onChange={(e) =>
                              setCreateForm((f) => ({ ...f, address: e.target.value }))
                            }
                            className="w-full px-2 py-1 text-[12px] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] bg-white text-[var(--sc-ink-strong)] outline-none focus:border-[var(--sc-brand-primary)] placeholder:text-[var(--sc-ink-muted)]"
                          />
                        </label>
                      </div>
                      {createError && (
                        <p className="text-[11px] text-[var(--sc-state-danger)] leading-snug">{createError}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={toggleCreateForm}
                          className="px-2.5 py-1 text-[11px] border border-[var(--sc-line-strong)] bg-white text-[var(--sc-ink-body)] rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={submitCreateTruck}
                          className="px-2.5 py-1 text-[11px] border border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary)] text-white rounded-[var(--sc-radius-sm)] hover:bg-[#00527A] cursor-pointer disabled:opacity-50 font-semibold"
                        >
                          创建
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Column Header Bar */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-[var(--sc-surface-alt)] border border-[var(--sc-line-soft)] text-[10px] text-[var(--sc-ink-body)] rounded-[var(--sc-radius-sm)] mb-1.5">
                    <div className="flex-1 min-w-0 flex items-center gap-1">
                      <span className="text-[var(--sc-ink-strong)] font-bold">餐车站号 / 实体点位</span>
                      <span className="text-[var(--sc-ink-muted)]">· STATIONS</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 shrink-0 text-center">
                      <div
                        className="w-7 text-center font-bold text-[var(--sc-ink-strong)] truncate"
                        title="整车营业总控开关 (MASTER KILLSWITCH)"
                      >
                        总控
                      </div>
                      <div
                        className="w-7 text-center font-bold text-[var(--sc-ink-strong)] truncate"
                        title="堂食独立渠道"
                      >
                        堂食
                      </div>
                      <div
                        className="w-7 text-center font-bold text-[var(--sc-ink-strong)] truncate"
                        title="外卖独立渠道"
                      >
                        外卖
                      </div>
                      <div
                        className="w-7 text-center font-bold text-[var(--sc-ink-strong)] truncate"
                        title="自提独立渠道"
                      >
                        自提
                      </div>
                    </div>
                  </div>

                  {/* Vehicles Stack */}
                  <div className="space-y-2">
                    {truckList.map((t) => {
                      const isSelected = t.truckId === selectedTruckId;
                      const isAccessible =
                        franchiseContext.isHqUser ||
                        franchiseContext.accessibleTruckIds.includes(t.truckId);
                      const tStatus = allStatuses[t.truckId] || getTruckBusinessStatus(t.truckId);
                      const tDineIn = tStatus.dineInOpen !== false;
                      const tDelivery = tStatus.deliveryOpen !== false;
                      const tPickup = tStatus.pickupOpen !== false;

                      return (
                        <div key={t.truckId} className="space-y-1.5">
                          <article
                            className={`px-2.5 py-2 rounded-[var(--sc-radius-sm)] border transition flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'border-[var(--sc-brand-primary)] bg-[var(--sc-surface-base)] shadow-[0_0_0_2px_var(--sc-brand-glow)]'
                                : 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-base)] hover:border-[var(--sc-line-strong)] shadow-xs'
                            }`}
                          >
                            {/* Station label & selection trigger */}
                            <div
                              onClick={() => {
                                onSelectTruck(t.truckId);
                                globalFranchiseEngine.switchTruck(t.truckId);
                                showToast(
                                  `已切换当前重点管控餐车至: 【${getTruckLabel(t as any, 'standard')}】${
                                    !isAccessible ? ' (非管辖·只读沙箱)' : ''
                                  }`
                                );
                              }}
                              className="flex items-center gap-1.5 min-w-0 flex-1 truncate cursor-pointer group"
                              title={
                                isAccessible
                                  ? '点击切换为此餐车为当前重点管控'
                                  : '非管辖餐车（只读沙箱）'
                              }
                            >
                              {(() => {
                                const allConfigs = getAllTruckConfigs();
                                const trkConfig = allConfigs.find((cfg) => cfg.id === t.truckId);
                                const logo = trkConfig?.logo || trkConfig?.image;
                                return logo ? (
                                  <div className="w-5 h-5 rounded-[var(--sc-radius-xs)] overflow-hidden border border-[var(--sc-brand-primary)]/45 shrink-0">
                                    <img loading="lazy" decoding="async" src={logo} alt="Logo" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <Truck
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isSelected ? 'text-[var(--sc-brand-primary)]' : 'text-[var(--sc-ink-muted)]'
                                    }`}
                                  />
                                );
                              })()}
                              <span
                                className={`text-[12px] truncate ${
                                  isSelected
                                    ? 'font-bold text-[var(--sc-ink-strong)]'
                                    : 'font-semibold text-[var(--sc-ink-strong)]'
                                }`}
                              >
                                {getTruckLabel(t as any, 'standard')}
                              </span>
                              {isSelected && (
                                <span className="text-[9.5px] px-1.5 py-0.2 bg-[var(--sc-brand-primary)] text-white rounded-[var(--sc-radius-xs)] font-bold shrink-0">
                                  当前选中
                                </span>
                              )}
                              {!isAccessible && (
                                <span className="text-[9.5px] px-1 py-0.2 bg-[var(--sc-surface-chip)] text-[var(--sc-ink-body)] border border-[var(--sc-line-soft)] rounded-[var(--sc-radius-xs)] shrink-0">
                                  只读沙箱
                                </span>
                              )}
                              {isHqScope && (
                                <button
                                  type="button"
                                  onClick={(e) => openEditTruck(t, e)}
                                  className="ml-0.5 p-1 rounded-[var(--sc-radius-xs)] text-[var(--sc-ink-muted)] hover:text-[var(--sc-brand-primary)] hover:bg-[var(--sc-brand-primary-soft)] border border-transparent hover:border-[var(--sc-brand-primary)]/30 transition shrink-0 cursor-pointer"
                                  title={editingTruckId === t.truckId ? '收起编辑条' : '编辑门店名称与地址'}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* 4 Precision Switch Buttons */}
                            <div className="grid grid-cols-4 gap-1.5 shrink-0 tabular-nums text-[11px]">
                              {/* Switch 1: 总控 */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleTruckMaster(t.truckId, e)}
                                className={`w-7 h-7 rounded-[var(--sc-radius-sm)] border flex items-center justify-center transition-colors relative cursor-pointer active:scale-95 ${
                                  !isAccessible
                                    ? 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] cursor-not-allowed'
                                    : tStatus.isOpen
                                    ? 'border-[var(--sc-brand-primary)]/45 bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] hover:bg-[#DCEDF8]'
                                    : 'border-[var(--sc-state-danger)]/45 bg-[#FDECEC] text-[var(--sc-state-danger)] hover:bg-[#FADADA]'
                                }`}
                                title={
                                  isAccessible
                                    ? `总控开关: ${tStatus.isOpen ? '营业中 (点击打烊)' : '已暂停 (点击营业)'}`
                                    : '受沙箱保护无权修改'
                                }
                              >
                                <Power className="w-3.5 h-3.5" />
                                <span
                                  className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ${
                                    tStatus.isOpen ? 'bg-[var(--sc-brand-primary)]' : 'bg-[var(--sc-state-danger)]'
                                  }`}
                                />
                              </button>

                              {/* Switch 2: 堂食 */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleTruckChannel(t.truckId, 'dine_in', e)}
                                className={`w-7 h-7 rounded-[var(--sc-radius-sm)] border flex items-center justify-center transition-colors relative cursor-pointer active:scale-95 ${
                                  !isAccessible
                                    ? 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] cursor-not-allowed'
                                    : tDineIn
                                    ? 'border-[var(--sc-brand-primary)]/45 bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] hover:bg-[#DCEDF8]'
                                    : 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] hover:bg-[var(--sc-surface-chip-strong)]'
                                }`}
                                title={
                                  isAccessible
                                    ? `堂食渠道: ${tDineIn ? '开启中' : '已暂停接单'}`
                                    : '受沙箱保护无权修改'
                                }
                              >
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                <span
                                  className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ${
                                    tDineIn ? 'bg-[var(--sc-brand-primary)]' : 'bg-[var(--sc-ink-muted)]'
                                  }`}
                                />
                              </button>

                              {/* Switch 3: 外卖 */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleTruckChannel(t.truckId, 'delivery', e)}
                                className={`w-7 h-7 rounded-[var(--sc-radius-sm)] border flex items-center justify-center transition-colors relative cursor-pointer active:scale-95 ${
                                  !isAccessible
                                    ? 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] cursor-not-allowed'
                                    : tDelivery
                                    ? 'border-[var(--sc-brand-accent)]/55 bg-[var(--sc-brand-primary-soft)] text-[var(--sc-brand-primary)] hover:bg-[#DCEDF8]'
                                    : 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] hover:bg-[var(--sc-surface-chip-strong)]'
                                }`}
                                title={
                                  isAccessible
                                    ? `外卖渠道: ${tDelivery ? '开启中' : '已暂停接单'}`
                                    : '受沙箱保护无权修改'
                                }
                              >
                                <Bike className="w-3.5 h-3.5" />
                                <span
                                  className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ${
                                    tDelivery ? 'bg-[var(--sc-brand-accent)]' : 'bg-[var(--sc-ink-muted)]'
                                  }`}
                                />
                              </button>

                              {/* Switch 4: 自提 */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleTruckChannel(t.truckId, 'pickup', e)}
                                className={`w-7 h-7 rounded-[var(--sc-radius-sm)] border flex items-center justify-center transition-colors relative cursor-pointer active:scale-95 ${
                                  !isAccessible
                                    ? 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] cursor-not-allowed'
                                    : tPickup
                                    ? 'border-[var(--sc-state-warn)]/45 bg-[#FFF8EB] text-[var(--sc-state-warn)] hover:bg-[#FFEFD1]'
                                    : 'border-[var(--sc-line-soft)] bg-[var(--sc-surface-chip)] text-[var(--sc-ink-muted)] hover:bg-[var(--sc-surface-chip-strong)]'
                                }`}
                                title={
                                  isAccessible
                                    ? `自提渠道: ${tPickup ? '开启中' : '已暂停接单'}`
                                    : '受沙箱保护无权修改'
                                }
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span
                                  className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ${
                                    tPickup ? 'bg-[var(--sc-state-warn)]' : 'bg-[var(--sc-ink-muted)]'
                                  }`}
                                />
                              </button>
                            </div>
                          </article>

                          {/* 行内编辑条：改名 + 改地址（仅总部，同一时间只展开一行） */}
                          {editingTruckId === t.truckId && isHqScope && (
                            <div
                              className="px-2.5 py-2 rounded-[var(--sc-radius-sm)] border border-[var(--sc-brand-primary)]/40 bg-[var(--sc-brand-primary-soft)]/50 space-y-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--sc-brand-primary)]">
                                <Pencil className="w-3.5 h-3.5" />
                                编辑门店 · {getTruckLabel(t as any, 'short')}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <label className="flex flex-col gap-1">
                                  <span className="text-[10px] text-[var(--sc-ink-body)]">门店名称</span>
                                  <input
                                    type="text"
                                    value={editForm.name}
                                    maxLength={30}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    className="w-full px-2 py-1 text-[12px] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] bg-white text-[var(--sc-ink-strong)] outline-none focus:border-[var(--sc-brand-primary)]"
                                  />
                                </label>
                                <label className="flex flex-col gap-1">
                                  <span className="text-[10px] text-[var(--sc-ink-body)]">门店地址</span>
                                  <input
                                    type="text"
                                    value={editForm.address}
                                    maxLength={60}
                                    placeholder="门店地址（可留空）"
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, address: e.target.value }))
                                    }
                                    className="w-full px-2 py-1 text-[12px] border border-[var(--sc-line-strong)] rounded-[var(--sc-radius-sm)] bg-white text-[var(--sc-ink-strong)] outline-none focus:border-[var(--sc-brand-primary)] placeholder:text-[var(--sc-ink-muted)]"
                                  />
                                </label>
                              </div>
                              {editError && (
                                <p className="text-[11px] text-[var(--sc-state-danger)] leading-snug">{editError}</p>
                              )}
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={closeEditTruck}
                                  className="px-2.5 py-1 text-[11px] border border-[var(--sc-line-strong)] bg-white text-[var(--sc-ink-body)] rounded-[var(--sc-radius-sm)] hover:bg-[var(--sc-surface-alt)] cursor-pointer"
                                >
                                  取消
                                </button>
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={(e) => saveEditTruck(t.truckId, e)}
                                  className="px-2.5 py-1 text-[11px] border border-[var(--sc-brand-primary)] bg-[var(--sc-brand-primary)] text-white rounded-[var(--sc-radius-sm)] hover:bg-[#00527A] cursor-pointer disabled:opacity-50 font-semibold"
                                >
                                  保存
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtle Expand Indicator */}
                  <div className="flex justify-center pt-1">
                    <div className="inline-flex items-center gap-1 text-[10px] text-[var(--sc-ink-muted)] px-2 py-0.5 bg-[var(--sc-surface-chip)] rounded-[var(--sc-radius-sm)]">
                      <span>已加载全部站台</span>
                      <ChevronDown className="w-3 h-3 text-[var(--sc-ink-muted)]" />
                    </div>
                  </div>
                </section>
                {/* END: FleetOverviewList */}
              </main>

              {/* BEGIN: FooterSection */}
              <footer className="px-4 py-3 bg-[var(--sc-surface-raised)] border-t border-[var(--sc-line-soft)] flex items-center justify-between shrink-0">
                {/* Advanced Setting Link Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenDetailedModal();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--sc-ink-body)] hover:text-[var(--sc-brand-primary)] transition-colors cursor-pointer font-semibold"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="underline underline-offset-2">
                    设置打烊原因、恢复时间与预定配置...
                  </span>
                </button>

                {/* Complete / Confirm Action */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-8 px-5 bg-[var(--sc-brand-primary)] hover:bg-[#00527a] text-white font-bold text-[11px] rounded-[var(--sc-radius-sm)] shadow-[0_0_0_1px_var(--sc-brand-glow)] active:translate-y-px transition cursor-pointer"
                >
                  完成
                </button>
              </footer>
              {/* END: FooterSection */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
