# 供售打样 / 打烊盘点 · 设计令牌

从商户操作台「**供售打样**」与「**打烊盘点**」两个页面源码里抽出的设计令牌。
不是设计稿抄的，是**从代码里实测统计**出来的——每个值都带出现次数，便于判断重要性。

来源：`MerchantPrecisionConsoleV2.tsx`（1056 行）+ `InventoryView.tsx`（675 行）
工程：UrbanRadar 流动餐车 · 商户操作台　构建：`v2.9.0d0fdb27`　日期：2026-11-21

## 文件

| 文件 | 用途 |
|---|---|
| `design-tokens.json` | 完整数据（值 / 次数 / 用途 / 对应全局令牌 / 是否等值） |
| `tokens.css` | `:root` CSS 变量，前缀 `--sc-` |
| `tokens.ts` | 类型化常量 `sc` + `cssVar()` 辅助函数 |
| `gen-tokens.py` | 生成器，改数据后重跑保证三份文件不漂移 |

## 颜色

### 品牌与强调

| 令牌 | 值 | 次数 | 用途 |
|---|---|---|---|
| `brand.primary` | `#006494` | 41 | text 21 · bg 12 · border 8 —— 全页主色 |
| `brand.primary-soft` | `#E8F3FA` | 4 | 选中态浅底 |
| `brand.accent` | `#3BB4FE` | 5 | 强调脉冲（bg 3 / text 2） |
| `brand.deep` | `#001020` | 3 | 深色条底 |

### 文字

| 令牌 | 值 | 次数 | 用途 |
|---|---|---|---|
| `ink.strong` | `#111827` | 25 | 标题、关键数值 |
| `ink.body` | `#71767B` | 39 | 正文、字段标签（出现最多） |
| `ink.muted` | `#8A9096` | 5 | 次级分隔、占位 |

### 描边与面层

| 令牌 | 值 | 次数 | 用途 |
|---|---|---|---|
| `line.soft` | `#E2E2DF` | 16 | 常规分隔线 |
| `line.strong` | `#CCCCCC` | 13 | 表格线、卡边 |
| `surface.chip` | `#EAEAE8` | 6 | 标签 / 胶囊底 |
| `surface.chip-strong` | `#E4E4E0` | 3 | 胶囊按下态 |
| `surface.raised` | `#F8F8F6` | 3 | 卡片底 |
| `surface.base` | `#FCFCFB` | 2 | 面板底 |
| `surface.sunken` | `#F6F6F4` | 2 | 凹陷区 |
| `surface.alt` | `#F4F4F2` | 2 | 交替行 |
| `surface.high` | `#F9F9F8` | 1 | 高亮行 |
| `surface.dim` | `#F0F0EE` | 1 | 置灰区 |

### 状态

| 令牌 | 值 | 次数 | 用途 |
|---|---|---|---|
| `state.warn` | `#C26D00` | 7 | 待打样 / 异常提示 |
| `state.danger` | `#D32F2F` | 6 | 报损 / 差额告警 |

### 光效（box-shadow）

| 令牌 | 值 | 次数 |
|---|---|---|
| `brand.glow` | `rgba(0,100,148,0.5)` | 3（主按钮聚焦） |
| `brand.accent-glow` | `rgba(59,180,254,0.6)` | 1（强调脉冲） |

## 排版

字号（实测取值，非标准 Tailwind scale）：

| 令牌 | 值 | 次数 |
|---|---|---|
| `text.2xs` | 9.5px | 5 |
| `text.xs` | 10px | 17 |
| `text.xs-plus` | 10.5px | 8 |
| `text.sm` | 11px | 13 |
| `text.sm-plus` | 11.5px | 1 |
| `text.base` | 13px | 5 |
| `text.md` | 14px | 1 |
| `text.lg` | 15px | 1 |
| `text.display` | 32px | 1 |

字重：`bold 700`（68 处，绝对主力）· `semibold 600`（7）· `medium 500`（1）· `normal 400`（1）

其他：`tabular-nums` 9 处（数值对齐）、`uppercase` 30 处（英文小标签）；**没有**用 `tracking-*` 任意值，字距靠默认。

## 圆角 / 阴影 / 间距

| 类别 | 值 | 次数 |
|---|---|---|
| 圆角 | 3px（12）· 2px（7）· 4px（3）· full（16） | — |
| 阴影 | `shadow-sm`（2）· `shadow-lg`（1）· `shadow-xl`（1） | — |
| 间距 | 6px（25）· 8px（22）· 4px（17）· 10px（9）· 12px（7） | — |
| 描边 | 1px 实线 170 处；虚线 3 处 | — |

## 关键发现：和全局令牌「像但不等」

工程里 `src/index.css` 有 `@theme` 令牌层。逐值比对结果：

| 本页值 | 全局令牌 | 差异 | 能否直接替换 |
|---|---|---|---|
| `#006494` | `--color-brand-primary` | **完全一致** | ✅ 可以 |
| `#71767B` | `--color-deck-ink-3` `#6b7480` | RGB 最大差 6 | ⚠️ 会轻微变灰 |
| `#111827` | `--color-app-text` `#1a1c1c` | 最大差 11 | ⚠️ 会变亮 |
| `#CCCCCC` | `--color-deck-line-1` `#ccd2d8` | 最大差 12 | ⚠️ 会偏蓝 |
| `#C26D00` | `--color-deck-warn` `#c67c0a` | 最大差 15 | ⚠️ 会偏黄 |
| `#D32F2F` | `--color-deck-danger` `#b3261e` | **最大差 32** | ❌ 明显偏暗红 |
| 其余 14 个 | 无对应令牌 | — | ❌ 需新增 |

也就是说：这两页是**独立配色**，只借用了品牌主色。19 个主色值里只有 1 个能直接换成现有令牌，其余替换都会产生可见色差——所以先抽成 `--sc-*` 独立命名空间，比强行并进全局令牌安全。

## 用法

```tsx
import { sc, cssVar } from './tokens';

<button style={{ background: sc.color.brandPrimary }}>打样</button>
<div style={{ color: sc.color.inkBody, borderColor: cssVar('line.soft') }} />
```

Tailwind 里也可直接引用变量：

```html
<div class="text-[color:var(--sc-ink-body)] border-[color:var(--sc-line-soft)]" />
```

## 建议（收敛路径）

1. **先冻结现状**：把 `tokens.css` 引到这两个页面的作用域，把硬编码 hex 逐个换成 `var(--sc-*)`，
   视觉零变化（值完全一致），但从此可改一处生效
2. **再合并**：把 `--sc-*` 与 `@theme` 里语义相同的令牌对齐（尤其 `state.danger` 差 32、`state.warn` 差 15 这两处，
   需要设计确认哪个是准的）
3. **顺手统一字号**：10 / 10.5 / 11 / 11.5 四档混用，实际只差 0.5px，建议压成 10 / 11 / 13 三档

## 注意

- 统计口径是**源码字面量**：`bg-[#006494]` 这类 Tailwind 任意值 + `style={{}}` 内联样式都计入；
  通过 CSS 变量间接使用的颜色不会被统计进来
- `#8A9096` 在源码里主要出现在 `bg-`，但语义像分隔/占位，命名取了 `ink.muted`，
  使用时按实际语义判断
- 阴影 `shadow-sm/lg/xl` 是 Tailwind 预设值，未展开成具体 px
