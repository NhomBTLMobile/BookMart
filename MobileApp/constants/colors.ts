// ============================================================
// BOOKMART — DESIGN SYSTEM TOKENS
// Áp dụng các lý thuyết tâm lý học UX:
//
// 1. AESTHETIC-USABILITY EFFECT  → giao diện đẹp = cảm giác dễ dùng hơn
// 2. COLOR PSYCHOLOGY            → xanh lá = tin tưởng, tươi mát, phát triển
// 3. VISUAL HIERARCHY            → kích thước, màu, weight phân cấp thông tin
// 4. FITTS'S LAW                 → button đủ lớn, dễ nhấn
// 5. COGNITIVE LOAD REDUCTION    → spacing đủ rộng, ít lựa chọn mỗi nhóm
// ============================================================

export const COLORS = {
  // ── Brand ──────────────────────────────────────────────────
  primary:      '#3E9B4F',   // Xanh lá chính — tin tưởng, tươi mát
  primaryDark:  '#236B32',   // Hover/active state
  primaryLight: '#EAF4E5',   // Nền nhạt — badge, chip
  primaryMid:   '#5BB369',   // Gradient giữa

  // ── Neutral ────────────────────────────────────────────────
  background:   '#F8FAF8',   // Nền tổng thể — xanh lá rất nhạt
  surface:      '#FFFFFF',   // Thẻ, modal, input
  surfaceAlt:   '#F2F7F2',   // Nền thứ cấp (header auth)

  // ── Text ───────────────────────────────────────────────────
  text:         '#183C27',   // Chữ chính — xanh đậm
  textSecondary:'#68736B',   // Chữ phụ — ghi xanh
  textHint:     '#A8B5A0',   // Placeholder

  // ── Semantic ───────────────────────────────────────────────
  error:        '#D9534F',   // Đỏ — lỗi, cảnh báo
  success:      '#3E9B4F',   // = primary
  warning:      '#F59E0B',   // Vàng — flash sale, timer
  info:         '#3B82F6',   // Xanh dương — thông tin

  // ── Border & Divider ───────────────────────────────────────
  border:       '#D9E0D8',
  divider:      '#EDF0EC',

  // ── Common ─────────────────────────────────────────────────
  white:        '#FFFFFF',
  black:        '#000000',
  overlay:      'rgba(0,0,0,0.45)',
} as const;

// ── Typography scale (Visual Hierarchy) ──────────────────────
export const FONT_SIZE = {
  xs:   11,
  sm:   12,
  md:   14,
  base: 15,
  lg:   17,
  xl:   20,
  '2xl':24,
  '3xl':28,
  '4xl':32,
} as const;

export const FONT_WEIGHT = {
  normal:    '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
} as const;

// ── Spacing scale (8pt grid — Cognitive Load Reduction) ──────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl':24,
  '3xl':32,
  '4xl':48,
  '5xl':60,
} as const;

// ── Border radius (Soft corners = friendlier feel) ────────────
export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const;

// ── Shadows (Depth & Material feel) ──────────────────────────
export const SHADOW = {
  sm: {
    shadowColor: '#183C27',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#183C27',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#183C27',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
