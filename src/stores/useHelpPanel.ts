/**
 * useHelpPanel Store
 * Panel-specific controls and state
 */

import { getContext } from 'svelte';
import { derived, type Readable } from 'svelte/store';
import { PILLAR_CONTEXT_KEY } from '../context';
import type { PillarContextValue } from '../types';

export interface UseHelpPanelResult {
  /** Whether the panel is currently open (store) */
  isOpen: Readable<boolean>;

  /** Open the panel */
  open: (options?: { view?: string; article?: string; search?: string }) => void;

  /** Close the panel */
  close: () => void;

  /** Toggle the panel */
  toggle: () => void;

  /** Open a specific article in the panel */
  openArticle: (slug: string) => void;

  /** Open a specific category in the panel */
  openCategory: (slug: string) => Promise<void>;

  /** Open search with a query */
  openSearch: (query?: string) => void;

  /** Open the AI chat */
  openChat: () => void;
}

/**
 * Get panel-specific controls and state
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useHelpPanel } from '@pillar-ai/svelte';
 *
 *   const { isOpen, toggle, openChat } = useHelpPanel();
 * </script>
 *
 * <div>
 *   <button on:click={toggle}>
 *     {$isOpen ? 'Close' : 'Help'}
 *   </button>
 *   <button on:click={openChat}>
 *     Ask AI
 *   </button>
 * </div>
 * ```
 */
export function useHelpPanel(): UseHelpPanelResult {
  const context = getContext<PillarContextValue>(PILLAR_CONTEXT_KEY);

  if (!context) {
    throw new Error('useHelpPanel must be used within a PillarProvider');
  }

  const { isPanelOpen, open, close, toggle, openArticle, openCategory, search, navigate } = context;

  const isOpen = derived(isPanelOpen, ($isPanelOpen) => $isPanelOpen);

  const openSearch = (query?: string) => {
    if (query) {
      search(query);
    } else {
      open({ view: 'search' });
    }
  };

  const openChat = () => {
    navigate('chat');
  };

  return {
    isOpen,
    open,
    close,
    toggle,
    openArticle,
    openCategory,
    openSearch,
    openChat,
  };
}
