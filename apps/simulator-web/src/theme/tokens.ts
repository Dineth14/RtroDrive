/**
 * Design tokens for the RetroDrive cluster UI.
 *
 * These map directly onto primitives available in embedded graphics
 * toolkits (LVGL): solid rects, lines, text, bars, simple two-stop
 * gradients, single-color icons, alpha-blended glows via blur-free
 * text-shadow (approximable in LVGL as a duplicated dim-color label).
 *
 * Cluster canvas is fixed at 1024x600 — see CLUSTER_WIDTH/CLUSTER_HEIGHT.
 * Every cluster screen must lay out against this exact coordinate system.
 */

export const CLUSTER_WIDTH = 1024
export const CLUSTER_HEIGHT = 600

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
}

export const radii = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
}

export const borders = {
  hairline: 1,
  thin: 2,
  thick: 3,
}

export const fontSizes = {
  micro: 12,
  label: 14,
  body: 18,
  value: 24,
  gauge: 32,
  hero: 96,
}

export const glow = {
  none: 'none',
  soft: '0 0 6px currentColor',
  medium: '0 0 10px currentColor, 0 0 2px currentColor',
  strong: '0 0 16px currentColor, 0 0 4px currentColor',
}

export const fontStack = {
  mono: '"JetBrains Mono", "Consolas", "SF Mono", "Courier New", monospace',
  segment: '"Segment7", "JetBrains Mono", monospace',
}

export const zIndex = {
  base: 0,
  overlay: 100,
  warning: 200,
  critical: 300,
}
