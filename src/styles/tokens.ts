/** 供售打样 / 打烊盘点 设计令牌（由 design-tokens.json 生成，勿手改）
 *  来源：MerchantPrecisionConsoleV2.tsx + InventoryView.tsx · 2026-11-21
 */

export const sc = {
  color: {
    brandPrimary: '#006494',
    brandPrimarySoft: '#E8F3FA',
    brandAccent: '#3BB4FE',
    brandDeep: '#001020',
    inkStrong: '#111827',
    inkBody: '#71767B',
    inkMuted: '#8A9096',
    lineStrong: '#CCCCCC',
    lineSoft: '#E2E2DF',
    surfaceBase: '#FCFCFB',
    surfaceRaised: '#F8F8F6',
    surfaceSunken: '#F6F6F4',
    surfaceAlt: '#F4F4F2',
    surfaceDim: '#F0F0EE',
    surfaceHigh: '#F9F9F8',
    surfaceChip: '#EAEAE8',
    surfaceChipStrong: '#E4E4E0',
    stateDanger: '#D32F2F',
    stateWarn: '#C26D00'
  },
  effect: {
    brandGlow: 'rgba(0, 100, 148, 0.5)',
    brandAccentGlow: 'rgba(59, 180, 254, 0.6)'
  },
  text: {
    '2xs': '9.5px',
    xs: '10px',
    xs_plus: '10.5px',
    sm: '11px',
    sm_plus: '11.5px',
    base: '13px',
    md: '14px',
    lg: '15px',
    display: '32px'
  },
  radius: { xs: '2px', sm: '3px', md: '4px', full: '9999px' },
  shadow: { sm: 'shadow-sm', lg: 'shadow-lg', xl: 'shadow-xl' },
  space: { s4: '4px', s6: '6px', s8: '8px', s10: '10px', s12: '12px', s16: '16px', s24: '24px' }
} as const;

export type ScTokenGroup = keyof typeof sc;

/** 生成 CSS 变量引用：cssVar('color.brand.primary') → 'var(--sc-color-brand-primary)' */
export const cssVar = (path: string): string => `var(--sc-${path.replace(/\./g, '-')})`;
