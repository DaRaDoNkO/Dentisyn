/**
 * Popup styling utilities - centralized CSS generation for modals and popovers
 */

export interface ThemeColors {
  isDark: boolean;
  textColor: string;
  labelColor: string;
  bgSubtle: string;
  inputBg: string;
  inputBorder: string;
}

export const getThemeColors = (): ThemeColors => {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  return {
    isDark,
    textColor: isDark ? '#e2e8f0' : '#1e293b',
    labelColor: isDark ? '#94a3b8' : '#64748b',
    bgSubtle: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    inputBg: isDark ? '#334155' : '#ffffff',
    inputBorder: isDark ? '#475569' : '#cbd5e1'
  };
};

export const getPopupCSS = (colors: ThemeColors): string => `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${colors.isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,${colors.isDark ? '0.5' : '0.18'});
  padding: 28px;
  z-index: 10000;
  border: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
`;

export const getOverlayCSS = (zIndex = 9999): string => `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: ${zIndex};
  backdrop-filter: blur(2px);
`;

export const getInputCSS = (colors: ThemeColors): string => `
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${colors.inputBorder};
  background: ${colors.inputBg};
  color: ${colors.textColor};
  font-size: 14px;
  outline: none;
`;

export const getLabelCSS = (): string => `
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
`;

export const getHeaderCSS = (): string => `
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
`;

export const getTitleCSS = (colors: ThemeColors): string => `
  margin: 0;
  color: ${colors.textColor};
  font-weight: 700;
  font-size: 1.15rem;
`;

export const getCloseButtonCSS = (colors: ThemeColors): string => `
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: ${colors.labelColor};
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
`;

export const getFieldContainerCSS = (): string => `
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const getReasoneBoxCSS = (colors: ThemeColors): string => `
  font-size: 14px;
  color: ${colors.textColor};
  padding: 10px 12px;
  background: ${colors.bgSubtle};
  border-radius: 8px;
`;
