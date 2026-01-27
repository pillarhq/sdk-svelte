<script lang="ts">
/**
 * PillarProvider
 * Svelte component that initializes and manages the Pillar SDK
 */

import { setContext, onMount, onDestroy } from 'svelte';
import { writable, derived, get } from 'svelte/store';
import {
  Pillar,
  type CardCallbacks,
  type PillarConfig,
  type PillarEvents,
  type PillarState,
  type TaskExecutePayload,
  type ThemeConfig,
} from '@pillar-ai/sdk';
import { PILLAR_CONTEXT_KEY } from './context';
import type { CardComponent, PillarContextValue } from './types';
import { mount, unmount } from 'svelte';

// Props
interface Props {
  productKey?: string;
  /** @deprecated Use productKey instead */
  helpCenter?: string;
  config?: Omit<PillarConfig, 'productKey' | 'helpCenter'>;
  onTask?: (task: TaskExecutePayload) => void;
  cards?: Record<string, CardComponent>;
  children?: import('svelte').Snippet;
}

let { productKey, helpCenter, config, onTask, cards, children }: Props = $props();

// Support both productKey (new) and helpCenter (deprecated)
const resolvedKey = productKey ?? helpCenter;

// Warn about deprecated helpCenter usage
if (helpCenter && !productKey) {
  console.warn(
    '[Pillar Svelte] "helpCenter" prop is deprecated. Use "productKey" instead.'
  );
}

// Create stores
const pillarStore = writable<Pillar | null>(null);
const stateStore = writable<PillarState>('uninitialized');
const isPanelOpenStore = writable<boolean>(false);
const isReadyStore = derived(stateStore, ($state) => $state === 'ready');

// Store cleanup functions
const cleanupFunctions: Array<() => void> = [];
const cardInstances: Map<HTMLElement, ReturnType<typeof mount>> = new Map();

// Actions
function open(options?: {
  view?: string;
  article?: string;
  search?: string;
  focusInput?: boolean;
}) {
  get(pillarStore)?.open(options);
}

function close() {
  get(pillarStore)?.close();
}

function toggle() {
  get(pillarStore)?.toggle();
}

function openArticle(slug: string) {
  get(pillarStore)?.open({ article: slug });
}

async function openCategory(slug: string) {
  get(pillarStore)?.navigate('category', { slug });
}

function search(query: string) {
  get(pillarStore)?.open({ search: query });
}

function navigate(view: string, params?: Record<string, string>) {
  get(pillarStore)?.navigate(view, params);
}

function setTheme(theme: Partial<ThemeConfig>) {
  get(pillarStore)?.setTheme(theme);
}

function setTextSelectionEnabled(enabled: boolean) {
  get(pillarStore)?.setTextSelectionEnabled(enabled);
}

function on<K extends keyof PillarEvents>(
  event: K,
  callback: (data: PillarEvents[K]) => void
): () => void {
  return get(pillarStore)?.on(event, callback) ?? (() => {});
}

// Register card renderers
function registerCards(instance: Pillar) {
  if (!cards) return;

  Object.entries(cards).forEach(([cardType, CardComponent]) => {
    const unsubscribe = instance.registerCard(
      cardType,
      (container, data, callbacks: CardCallbacks) => {
        // Mount the Svelte component into the container
        const component = mount(CardComponent, {
          target: container,
          props: {
            data,
            onConfirm: callbacks.onConfirm,
            onCancel: callbacks.onCancel,
            onStateChange: callbacks.onStateChange,
          },
        });

        cardInstances.set(container, component);

        // Return cleanup function
        return () => {
          const existingComponent = cardInstances.get(container);
          if (existingComponent) {
            unmount(existingComponent);
            cardInstances.delete(container);
          }
        };
      }
    );

    cleanupFunctions.push(unsubscribe);
  });
}

// Set context for child components
const contextValue: PillarContextValue = {
  pillar: pillarStore,
  state: stateStore,
  isReady: isReadyStore,
  isPanelOpen: isPanelOpenStore,
  open,
  close,
  toggle,
  openArticle,
  openCategory,
  search,
  navigate,
  setTheme,
  setTextSelectionEnabled,
  on,
};

setContext(PILLAR_CONTEXT_KEY, contextValue);

// Initialize SDK
onMount(async () => {
  try {
    // Pillar is a singleton - check if already initialized
    const existingInstance = Pillar.getInstance();
    if (existingInstance) {
      // Reuse existing instance (preserves chat history, panel state, etc.)
      pillarStore.set(existingInstance);
      stateStore.set(existingInstance.state);

      // Re-subscribe to events
      const unsubOpen = existingInstance.on('panel:open', () => {
        isPanelOpenStore.set(true);
      });
      cleanupFunctions.push(unsubOpen);

      const unsubClose = existingInstance.on('panel:close', () => {
        isPanelOpenStore.set(false);
      });
      cleanupFunctions.push(unsubClose);

      // Register cards
      registerCards(existingInstance);
      return;
    }

    // Initialize new instance
    const instance = await Pillar.init({
      productKey: resolvedKey,
      ...config,
    });

    pillarStore.set(instance);
    stateStore.set(instance.state);

    // Listen for panel open/close
    const unsubOpen = instance.on('panel:open', () => {
      isPanelOpenStore.set(true);
    });
    cleanupFunctions.push(unsubOpen);

    const unsubClose = instance.on('panel:close', () => {
      isPanelOpenStore.set(false);
    });
    cleanupFunctions.push(unsubClose);

    // Listen for state changes
    const unsubReady = instance.on('ready', () => {
      stateStore.set('ready');
    });
    cleanupFunctions.push(unsubReady);

    const unsubError = instance.on('error', () => {
      stateStore.set('error');
    });
    cleanupFunctions.push(unsubError);

    // Register task handler
    if (onTask) {
      const unsubTask = instance.on('task:execute', (task) => {
        onTask(task);
      });
      cleanupFunctions.push(unsubTask);
    }

    // Register cards
    registerCards(instance);
  } catch (error) {
    console.error('[Pillar Svelte] Failed to initialize:', error);
    stateStore.set('error');
  }
});

// Cleanup
onDestroy(() => {
  // Run all cleanup functions
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions.length = 0;

  // Unmount all card instances
  cardInstances.forEach((component) => unmount(component));
  cardInstances.clear();

  // Note: We intentionally don't call Pillar.destroy() here
  // The singleton persists to maintain state across route changes
});
</script>

{#if children}
  {@render children()}
{/if}
