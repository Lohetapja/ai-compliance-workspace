import { useEffect } from 'react';
import { useAppearance } from '../store/useAppearance';

/**
 * Applies appearance preferences to the document root:
 * - data-theme (dark/light, resolving "system" via prefers-color-scheme)
 * - data-contrast (high contrast)
 * - root font-size (combines text size + density), which scales rem-based
 *   spacing and text together.
 * Renders nothing.
 */
export function AppearanceManager() {
  const { theme, density, textSize, highContrast } = useAppearance();

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const resolved =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'dark'
          : theme;
      root.setAttribute('data-theme', resolved);
      root.style.colorScheme = resolved;
    };
    apply();

    let mq: MediaQueryList | null = null;
    if (theme === 'system') {
      mq = window.matchMedia('(prefers-color-scheme: light)');
      mq.addEventListener('change', apply);
    }
    return () => mq?.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    root.setAttribute('data-density', density);
    root.setAttribute('data-textsize', textSize);
    // Combine text size + density into one root font-size (px).
    const base = textSize === 'large' ? 18 : 16;
    const px = density === 'compact' ? base - 1 : base;
    root.style.fontSize = `${px}px`;
  }, [density, textSize, highContrast]);

  return null;
}
