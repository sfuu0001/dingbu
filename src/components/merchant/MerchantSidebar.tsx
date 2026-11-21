import React from 'react';
import {
  ChefHat,
  ClipboardList,
  CreditCard,
  Megaphone,
  MapPin,
  Utensils,
  Package,
  ShieldCheck,
  Barcode,
  Users,
  BarChart3,
  Crown,
  Truck,
  Clock
} from 'lucide-react';

export type MerchantTab =
  | 'supply_proofing'
  | 'orders'
  | 'pos_cashier'
  | 'calling_screen'
  | 'gps'
  | 'menu_manage'
  | 'inventory'
  | 'data_fallback'
  | 'scanner'
  | 'queue_wait'
  | 'riders'
  | 'analytics'
  | 'franchise_hq'
  | 'staff_rbac';

export interface TabItemConfig {
  id: MerchantTab;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeAlert?: boolean;
  description?: string;
}

export const allTabsConfig: TabItemConfig[] = [
  {
    id: 'supply_proofing',
    label: '供售打样',
    category: '实时经营',
    icon: ChefHat,
    badge: 3,
    description: '实时出品打样、备餐节奏与热售窗口供给管控'
  },
  {
    id: 'orders',
    label: '订单中枢',
    category: '实时经营',
    icon: ClipboardList,
    badge: 12,
    badgeAlert: true,
    description: '堂食 / 外卖 / 自提全渠道实时订单调度与异常预警'
  },
  {
    id: 'pos_cashier',
    label: '前台收银',
    category: '实时经营',
    icon: CreditCard,
    badge: 2,
    description: '扫码收银、组合支付与挂单/退单快速处理'
  },
  {
    id: 'calling_screen',
    label: '叫号大屏',
    category: '实时经营',
    icon: Megaphone,
    badge: 4,
    description: '餐车前窗叫号大屏与真人语音同步广播队列'
  },
  {
    id: 'queue_wait',
    label: '排队等位',
    category: '实时经营',
    icon: Clock,
    badge: 5,
    description: '露天餐吧桌位叫号与候餐进度实时推送'
  },
  {
    id: 'gps',
    label: '驻点工况',
    category: '车队调度',
    icon: MapPin,
    description: '流动餐车实时 GPS 驻点位、电力水位与热更新配置'
  },
  {
    id: 'riders',
    label: '骑手协同',
    category: '车队调度',
    icon: Truck,
    badge: 6,
    description: '自营顺路骑手派单池与取餐核销追踪'
  },
  {
    id: 'scanner',
    label: '扫码核销',
    category: '硬件协同',
    icon: Barcode,
    description: '蓝牙扫码枪自提码核销与券码快速验真'
  },
  {
    id: 'menu_manage',
    label: '菜品沽清',
    category: '商品供应链',
    icon: Utensils,
    badge: 1,
    description: 'SKU 上下架、时段菜单与总部爆品锁定价格同步'
  },
  {
    id: 'inventory',
    label: '原料库存',
    category: '商品供应链',
    icon: Package,
    description: '餐车冷链仓剩余库存预警与日配补货单'
  },
  {
    id: 'analytics',
    label: '毛利看板',
    category: '经营分析',
    icon: BarChart3,
    description: '分时段营业额、毛利红线对比与渠道占比透视'
  },
  {
    id: 'franchise_hq',
    label: '总部多租户',
    category: '治理中心',
    icon: Crown,
    description: '特许加盟商沙箱隔离与核心 SKU 全国强锁定'
  },
  {
    id: 'staff_rbac',
    label: '当班权限',
    category: '治理中心',
    icon: Users,
    description: '门店员工手机号硬件绑定与 RBAC 菜单权限控制'
  },
  {
    id: 'data_fallback',
    label: '安全自愈',
    category: '治理中心',
    icon: ShieldCheck,
    description: '五维自动化安全健康分与离线三轨沙箱自愈状态'
  }
];
