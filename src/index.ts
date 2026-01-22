/**
 * @pillar-ai/svelte - Svelte bindings for Pillar Embedded Help SDK
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { PillarProvider, usePillar, useHelpPanel } from '@pillar-ai/svelte';
 * </script>
 *
 * <PillarProvider helpCenter="your-help-center">
 *   <MyApp />
 * </PillarProvider>
 * ```
 *
 * @example
 * ```svelte
 * <!-- MyApp.svelte -->
 * <script lang="ts">
 *   import { usePillar, useHelpPanel } from '@pillar-ai/svelte';
 *
 *   const { isReady } = usePillar();
 *   const { toggle } = useHelpPanel();
 * </script>
 *
 * <div>
 *   <h1>Welcome!</h1>
 *   <button on:click={toggle}>Get Help</button>
 * </div>
 * ```
 *
 * @example Custom panel placement
 * ```svelte
 * <script lang="ts">
 *   import { PillarProvider, PillarPanel } from '@pillar-ai/svelte';
 * </script>
 *
 * <PillarProvider
 *   helpCenter="your-help-center"
 *   config={{ panel: { container: 'manual' } }}
 * >
 *   <div class="layout">
 *     <PillarPanel class="custom-panel" />
 *     <main>Your content</main>
 *   </div>
 * </PillarProvider>
 * ```
 */

// Components
export { default as PillarProvider } from './PillarProvider.svelte';
export { default as PillarPanel } from './PillarPanel.svelte';

// Context
export { PILLAR_CONTEXT_KEY } from './context';

// Types
export type {
  CardComponent,
  CardComponentProps,
  PillarContextValue,
  PillarPanelProps,
  PillarProviderProps,
} from './types';

// Stores
export { useHelpPanel, type UseHelpPanelResult } from './stores/useHelpPanel';
export { usePillar, type TypedUsePillarResult, type UsePillarResult } from './stores/usePillar';

// Re-export types from core SDK for convenience
export type {
  ActionDataType,
  ActionDefinitions,
  ActionNames,
  CardCallbacks,
  CardRenderer,
  EdgeTriggerConfig,
  PanelConfig,
  PillarConfig,
  PillarEvents,
  PillarState,
  ResolvedConfig,
  ResolvedThemeConfig,
  SidebarTabConfig,
  SyncActionDefinitions,
  TaskExecutePayload,
  TextSelectionConfig,
  ThemeColors,
  ThemeConfig,
  ThemeMode,
} from '@pillar-ai/sdk';
