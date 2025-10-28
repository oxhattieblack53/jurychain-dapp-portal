/**
 * RainbowKit Custom Theme Configuration
 *
 * This file defines a custom theme for RainbowKit that matches
 * JuryChain's design system with legal-blue and legal-gold colors.
 *
 * Theme Options:
 * - Dark mode by default (matches our dark UI)
 * - Legal blue as primary color
 * - Legal gold as accent color
 * - Elegant rounded corners and shadows
 */

import { Theme } from "@rainbow-me/rainbowkit";

/**
 * JuryChain Custom Theme for RainbowKit
 *
 * Colors:
 * - legal-blue: #1e3a8a (primary)
 * - legal-gold: #d4af37 (accent)
 * - Dark backgrounds for consistency
 */
export const juryChainTheme: Theme = {
  blurs: {
    modalOverlay: "blur(8px)",
  },
  colors: {
    accentColor: "#d4af37", // legal-gold
    accentColorForeground: "#ffffff",
    actionButtonBorder: "rgba(255, 255, 255, 0.04)",
    actionButtonBorderMobile: "rgba(255, 255, 255, 0.08)",
    actionButtonSecondaryBackground: "rgba(30, 58, 138, 0.1)", // legal-blue/10
    closeButton: "rgba(255, 255, 255, 0.7)",
    closeButtonBackground: "rgba(255, 255, 255, 0.08)",
    connectButtonBackground: "#ffffff",
    connectButtonBackgroundError: "#ef4444",
    connectButtonInnerBackground: "linear-gradient(90deg, #1e3a8a 0%, #d4af37 100%)", // legal-blue to legal-gold
    connectButtonText: "#ffffff",
    connectButtonTextError: "#ffffff",
    connectionIndicator: "#10b981",
    downloadBottomCardBackground: "linear-gradient(135deg, rgba(30, 58, 138, 0.15), rgba(212, 175, 55, 0.15))",
    downloadTopCardBackground: "linear-gradient(135deg, rgba(30, 58, 138, 0.25), rgba(212, 175, 55, 0.25))",
    error: "#ef4444",
    generalBorder: "rgba(255, 255, 255, 0.08)",
    generalBorderDim: "rgba(255, 255, 255, 0.04)",
    menuItemBackground: "rgba(255, 255, 255, 0.05)",
    modalBackdrop: "rgba(0, 0, 0, 0.7)",
    modalBackground: "#1a1a1a",
    modalBorder: "rgba(255, 255, 255, 0.08)",
    modalText: "#ffffff",
    modalTextDim: "rgba(255, 255, 255, 0.6)",
    modalTextSecondary: "rgba(255, 255, 255, 0.7)",
    profileAction: "rgba(255, 255, 255, 0.05)",
    profileActionHover: "rgba(255, 255, 255, 0.08)",
    profileForeground: "#1a1a1a",
    selectedOptionBorder: "#d4af37", // legal-gold
    standby: "#fbbf24",
  },
  fonts: {
    body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  radii: {
    actionButton: "12px",
    connectButton: "12px",
    menuButton: "12px",
    modal: "16px",
    modalMobile: "20px",
  },
  shadows: {
    connectButton: "0 4px 12px rgba(0, 0, 0, 0.3)",
    dialog: "0 8px 32px rgba(0, 0, 0, 0.6)",
    profileDetailsAction: "0 2px 8px rgba(0, 0, 0, 0.2)",
    selectedOption: "0 0 0 2px #d4af37", // legal-gold
    selectedWallet: "0 0 0 2px #1e3a8a", // legal-blue
    walletLogo: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
};

/**
 * Light theme variant (optional)
 * Uncomment if you want to support light mode
 */
export const juryChainLightTheme: Theme = {
  ...juryChainTheme,
  colors: {
    ...juryChainTheme.colors,
    modalBackground: "#ffffff",
    modalText: "#1a1a1a",
    modalTextDim: "rgba(0, 0, 0, 0.6)",
    modalTextSecondary: "rgba(0, 0, 0, 0.7)",
    generalBorder: "rgba(0, 0, 0, 0.08)",
    generalBorderDim: "rgba(0, 0, 0, 0.04)",
    menuItemBackground: "rgba(0, 0, 0, 0.05)",
    profileAction: "rgba(0, 0, 0, 0.05)",
    profileActionHover: "rgba(0, 0, 0, 0.08)",
    actionButtonSecondaryBackground: "rgba(30, 58, 138, 0.1)",
    closeButton: "rgba(0, 0, 0, 0.7)",
    closeButtonBackground: "rgba(0, 0, 0, 0.08)",
  },
};
