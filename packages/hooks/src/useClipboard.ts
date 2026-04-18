import { useState, useCallback } from 'react';

/**
 * Provides a clipboard copy utility with a transient "copied" state.
 */
export function useClipboard(resetDelay: number = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        // Fallback for older browsers
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          setCopied(true);
          setTimeout(() => setCopied(false), resetDelay);
          return true;
        } catch {
          return false;
        }
      }
    },
    [resetDelay]
  );

  return { copy, copied };
}
