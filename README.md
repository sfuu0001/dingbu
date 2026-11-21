# 商户操作台 · 顶栏 / 状态条 / 小菜单 源码切片

从 `src/components/merchant/MerchantSystemView.tsx`（2998 行）里切出的三段界面，
以及它们依赖的独立子组件。**原样摘录，未改逻辑**。

来源工程：UrbanRadar 流动餐车 · 构建 `v2.9.0d0fdb27`　日期：2026-11-21

---

## 包内容

四个 snapshot 文件都做了 `// @ts-nocheck` + fragment 包裹，语法可通过 TypeScript 解析，
在编辑器里能正常高亮折叠；但因为引用的是父组件作用域的状态，直接运行会报未定义，属预期。


| 文件 | 行数 | 说明 |
|---|---|---|
| `top-bar/TopBar.snapshot.tsx` | 487 | 顶部控制条（`<header>`），原文件 1649–2135 |
| `top-bar/MerchantVoiceControls.tsx` | — | 语音播报控件（独立组件，顶栏右侧引用） |
| `subheader/SubHeader.snapshot.tsx` | 254 | 实时经营状态条，原文件 2171–2424 |
| `subheader/WorkspaceDisplaySettingsPanel.tsx` | — | 显示设置面板（独立组件） |
| `small-menu/StaffMenu.snapshot.tsx` | 65 | 员工账号下拉（内联），原文件 1763–1827 |
| `small-menu/MobileQuickMenu.snapshot.tsx` | 122 | 手机端快捷菜单（内联），原文件 1871–1992 |
| `small-menu/TruckBusinessScopeDropdown.tsx` | — | 店铺/业务范围下拉（独立组件，顶栏店铺胶囊就是它） |

## 三块界面的实际构成

### 1. 顶部控制条 `top-bar`

从左到右：切回前台胶囊 → 商家总控 + 绿色「在线」→ **店铺胶囊**（`TruckBusinessScopeDropdown`，
里面才是 HQ总部徽标 / 店名 / 堂·外·提 三枚小标 / 下拉箭头）→ 本店账号标 →
员工账号胶囊（点开是 `StaffMenu.snapshot`）→ 五维安全健康分（`sentinelState.overallHealthScore`，
截图里那个「100」）→ 桌面按钮组 → 右侧图标组（语音、蓝牙、扫码、消息、云同步）→ 骑手端入口。

⚠ 截图里的「关闭」按钮与「铃铛/时钟」图标，在这条 `<header>` 里**并不存在**：
`Bell`/`Clock`/`RotateCcw` 只有 import、未渲染；「关闭」在 `TruckBusinessScopeDropdown.tsx:570`
（弹窗的 `aria-label="关闭控制台"`）。

### 2. 实时经营状态条 `subheader`

不是页脚（页脚是 `<footer>` 2813–2860）。这一段是**模块面包屑 + 快捷胶囊条**：

- 「实时经营」chip ← `currentTabConfig.category`
- 「供售打样」当前模块 ← `currentTabConfig.label` + `CurrentIcon` + 绿点 + 徽标
- 图标+数字串 ← `displayTabs.map`，数据来自 `allTabsConfig`（原文件 912–954）
- 「指令台 ⌘K」黑色胶囊（不是「飞售台桌区」，全项目检索「飞售」零命中）
- 右侧：回收站（含计数）、显示设置、全宽切换

### 3. 小菜单 `small-menu`

三个浮层，别混：

| 菜单 | 触发 | 实现 |
|---|---|---|
| 员工账号下拉 | 点「张伟（店长）138\*\*\*\*8000」 | 内联在顶栏，65 行 |
| 手机端快捷菜单 | 移动端点「更多」 | 内联在顶栏，122 行 |
| 店铺/业务范围下拉 | 点店铺胶囊 | 独立组件 `TruckBusinessScopeDropdown.tsx` |

---

## 依赖清单（接回主工程时必须提供）

这些片段引用了 `MerchantSystemView` 作用域内的状态，**不能单独编译**：

**Props**（组件签名 239–259）
`onSwitchRole`、`merchantSession`、`onOpenPhoneAuth`、`onLogoutMerchant`、`showToast`

**内部 state / 派生值**
`activeTab`、`setActiveTab`、`setIsMobileSidebarOpen`、`isCloudbaseModalOpen`、
`isMessageFormModalOpen`、`isBluetoothModalOpen`、`isHardwareHubOpen`、`isQuickCallModalOpen`、
`isShiftHandoverOpen`、`btConfig`、`activeBtDevice`、`sentinelState`、`merchantAuthSession`、
`isHqScoped`、`merchantTruckConfigs`、`selectedTruckId`、`handleSelectTruck`、`businessStatus`、
`wsPrefs` / `updateWsPrefs`、`allowedQuickTabs`、`tabsContainerRef`、`isCommandPaletteOpen`、
`wsPanelOpen`、`isRecycleBinOpen`、`recycleBinCount`、`toggleFullWidthWorkspace`、
`isStaffMenuOpen`、`isMobileMoreMenuOpen`

**工具 / 数据**
`maskPhoneNumber`（`utils/staffAndRiderAuthEngine`）、`canAccessMerchantTab`（`utils/rbacEngine`）、
`getDefaultPinnedTabs` / `RECOMMENDED_PINNED_TABS`（`utils/workspacePreferences`）、
`allTabsConfig`（同文件 912–954）

**样式**
全部 Tailwind 工具类 + 项目主题扩展（`bg-card-bg`、`text-text-prominent`、`border-border-main`、
`rounded-console`、`duration-fast/normal/slow`、`shadow-2xs`），无自定义非 Tailwind 类。

---

## 用法建议

- **只想看/改视觉**：直接读 `*.snapshot.tsx`，这几段是纯 JSX + Tailwind，改样式不需要理解业务逻辑
- **想独立预览**：把这些 state 换成 mock（参考 `cebian` 工程里 `src/App.tsx` 的 `DEMO_SESSIONS` 写法），
  再补 `allTabsConfig` 与 `canAccessMerchantTab` 就能跑起来
- **想接回主工程**：不建议直接把 snapshot 文件塞回去（会造成第二份真相），
  改动请直接落在 `MerchantSystemView.tsx` 对应行号区间

## 注意

行号基于 `v2.9.0d0fdb27`。本次已把功能导航换成了新版（`MerchantSidebar.tsx` 从 685 行变 1574 行），
但 `MerchantSystemView.tsx` **没有改动**，所以上面的行号仍然有效。
