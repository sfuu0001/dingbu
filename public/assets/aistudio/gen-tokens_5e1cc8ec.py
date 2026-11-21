"""生成「供售打样 / 打烊盘点」设计令牌：json / css / ts 三份，同源防漂移。"""
import json
import os

OUT = r"C:/Users/Public/wb-p0-ws/deliverables/supply-close-design-tokens"
os.makedirs(OUT, exist_ok=True)

# name, value, count, usage, globalToken, exactGlobal
COLORS = [
    ("brand.primary",       "#006494", 41, "text 21 · bg 12 · border 8",   "--color-brand-primary", True),
    ("brand.primary-soft",  "#E8F3FA",  4, "bg 4（选中态浅底）",            "-", False),
    ("brand.accent",        "#3BB4FE",  5, "bg 3 · text 2",                 "-", False),
    ("brand.deep",          "#001020",  3, "bg 3（深色条）",                "-", False),
    ("ink.strong",          "#111827", 25, "text 24（标题 / 数值）",         "--color-app-text (#1a1c1c)", False),
    ("ink.body",            "#71767B", 39, "text 39（正文 / 标签）",         "--color-deck-ink-3 (#6b7480)", False),
    ("ink.muted",           "#8A9096",  5, "bg 5（次级分隔 / 占位）",        "-", False),
    ("line.strong",         "#CCCCCC", 13, "border 13",                     "--color-deck-line-1 (#ccd2d8)", False),
    ("line.soft",           "#E2E2DF", 16, "border 16",                     "-", False),
    ("surface.base",        "#FCFCFB",  2, "bg 2（面板底）",                "-", False),
    ("surface.raised",      "#F8F8F6",  3, "bg 3（卡片）",                  "-", False),
    ("surface.sunken",      "#F6F6F4",  2, "bg 2（凹陷区）",                "-", False),
    ("surface.alt",         "#F4F4F2",  2, "bg 2（交替行）",                "-", False),
    ("surface.dim",         "#F0F0EE",  1, "bg 1",                          "-", False),
    ("surface.high",        "#F9F9F8",  1, "bg 1",                          "-", False),
    ("surface.chip",        "#EAEAE8",  6, "bg 6（标签 / 胶囊）",           "-", False),
    ("surface.chip-strong", "#E4E4E0",  3, "bg 3（胶囊按下）",              "-", False),
    ("state.danger",        "#D32F2F",  6, "text 5 · bg 1",                 "--color-deck-danger (#b3261e)", False),
    ("state.warn",          "#C26D00",  7, "text 4 · bg 2",                 "--color-deck-warn (#c67c0a)", False),
]

EFFECTS = [
    ("brand.glow",        "rgba(0, 100, 148, 0.5)", 3, "box-shadow 3（主按钮聚焦）"),
    ("brand.accent-glow", "rgba(59, 180, 254, 0.6)", 1, "box-shadow 1（强调脉冲）"),
]

TYPE_SCALE = [
    ("2xs", "9.5px", 5), ("xs", "10px", 17), ("xs-plus", "10.5px", 8),
    ("sm", "11px", 13), ("sm-plus", "11.5px", 1), ("base", "13px", 5),
    ("md", "14px", 1), ("lg", "15px", 1), ("display", "32px", 1),
]
WEIGHTS = [("bold", "700", 68), ("semibold", "600", 7), ("medium", "500", 1), ("normal", "400", 1)]
RADII = [("xs", "2px", 7), ("sm", "3px", 12), ("md", "4px", 3), ("full", "9999px", 16)]
SHADOWS = [("sm", "shadow-sm", 2), ("lg", "shadow-lg", 1), ("xl", "shadow-xl", 1)]
SPACING = {"4px": 17, "6px": 25, "8px": 22, "10px": 9, "12px": 7, "16px": 3, "24px": 1}


def camel(name: str) -> str:
    parts = name.replace(".", "-").split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def var_name(name: str) -> str:
    return "--sc-" + name.replace(".", "-")


# ---------------- JSON ----------------
doc = {
    "meta": {
        "name": "供售打样 / 打烊盘点 设计令牌",
        "source": [
            "src/components/merchant/MerchantPrecisionConsoleV2.tsx（1056 行）",
            "src/components/merchant/InventoryView.tsx（675 行）",
        ],
        "project": "UrbanRadar 流动餐车 · 商户操作台",
        "build": "v2.9.0d0fdb27",
        "date": "2026-11-21",
        "note": "count = 该值在源码中出现次数（Tailwind 任意值写法 + 内联样式）；exactGlobal = 与全局 @theme 令牌完全等值",
    },
    "color": {
        n: {"value": v, "count": c, "usage": u, "globalToken": g, "exactGlobal": e}
        for n, v, c, u, g, e in COLORS
    },
    "effect": {n: {"value": v, "count": c, "usage": u} for n, v, c, u in EFFECTS},
    "typography": {
        "scale": {n: {"value": v, "count": c} for n, v, c in TYPE_SCALE},
        "weight": {n: {"value": v, "count": c} for n, v, c in WEIGHTS},
        "features": {
            "tabularNums": 9,
            "uppercase": 30,
            "letterSpacing": "无任意值写法（tracking-* 出现 0 次）",
        },
    },
    "radius": {n: {"value": v, "count": c} for n, v, c in RADII},
    "shadow": {n: {"value": v, "count": c} for n, v, c in SHADOWS},
    "spacing": {"gap": SPACING, "note": "按 gap/space 单位统计（Tailwind 1 = 4px）"},
    "border": {"width": "1px（170 处默认 border）", "dashed": 3},
}
with open(os.path.join(OUT, "design-tokens.json"), "w", encoding="utf-8") as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)

# ---------------- CSS ----------------
css = [
    "/* 供售打样 / 打烊盘点 · 设计令牌",
    "   由 design-tokens.json 同源生成，勿手改。",
    "   来源：MerchantPrecisionConsoleV2.tsx + InventoryView.tsx（2026-11-21） */",
    "",
    ":root {",
]
for n, v, c, u, g, e in COLORS:
    css.append(f"  {var_name(n)}: {v}; /* {c:2} 处 · {u} */")
for n, v, c, u in EFFECTS:
    css.append(f"  {var_name(n)}: {v}; /* {c} 处 · {u} */")
css.append("")
for n, v, c in TYPE_SCALE:
    css.append(f"  --sc-text-{n}: {v}; /* {c} 处 */")
for n, v, c in RADII:
    css.append(f"  --sc-radius-{n}: {v}; /* {c} 处 */")
for n, v, c in SHADOWS:
    css.append(f"  --sc-shadow-{n}: {v}; /* {c} 处 */")
for px, c in SPACING.items():
    css.append(f"  --sc-space-{px.replace('px', '')}: {px}; /* {c} 处 */")
css.append("}")
with open(os.path.join(OUT, "tokens.css"), "w", encoding="utf-8") as f:
    f.write("\n".join(css) + "\n")

# ---------------- TS ----------------
ts = [
    "/** 供售打样 / 打烊盘点 设计令牌（由 design-tokens.json 生成，勿手改）",
    " *  来源：MerchantPrecisionConsoleV2.tsx + InventoryView.tsx · 2026-11-21",
    " *  用法：import { sc, cssVar } from './tokens';",
    " *        <button style={{ background: sc.color.brandPrimary }} />",
    " *        <div style={{ borderColor: cssVar('line.soft') }} />",
    " */",
    "",
    "export const sc = {",
    "  color: {",
]
for n, v, c, u, g, e in COLORS:
    ts.append(f"    {camel(n)}: '{v}', // {c} 处 · {u}")
ts.append("  },")
ts.append("  effect: {")
for n, v, c, u in EFFECTS:
    ts.append(f"    {camel(n)}: '{v}', // {c} 处")
ts.append("  },")
ts.append("  text: {")
for n, v, c in TYPE_SCALE:
    ts.append(f"    {n.replace('-', '_')}: '{v}', // {c} 处")
ts.append("  },")
ts.append("  radius: { " + ", ".join(f"{n}: '{v}'" for n, v, c in RADII) + " },")
ts.append("  shadow: { " + ", ".join(f"{n}: '{v}'" for n, v, c in SHADOWS) + " },")
ts.append("  space: { " + ", ".join(f"s{k.replace('px','')}: '{k}'" for k in SPACING) + " },")
ts.append("} as const;")
ts.append("")
ts.append("export type ScTokenGroup = keyof typeof sc;")
ts.append("")
ts.append("/** 生成 CSS 变量引用：cssVar('color.brand.primary') → 'var(--sc-color-brand-primary)' */")
ts.append("export const cssVar = (path: string): string => `var(--sc-${path.replace(/\\./g, '-')})`;")
ts.append("")
with open(os.path.join(OUT, "tokens.ts"), "w", encoding="utf-8") as f:
    f.write("\n".join(ts))

print("generated:", sorted(os.listdir(OUT)))
