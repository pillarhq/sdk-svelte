/**
 * usePillar Store
 * Access Pillar SDK instance and state with optional type-safe onTask
 */

import type {
  SyncActionDefinitions,
  ActionDefinitions,
  ActionDataType,
  ActionNames,
} from '@pillar-ai/sdk';
import { getContext } from 'svelte';
import { get } from 'svelte/store';
import { PILLAR_CONTEXT_KEY } from '../context';
import type { PillarContextValue } from '../types';

export type UsePillarResult = PillarContextValue;

/**
 * Extended result with type-safe onTask method.
 *
 * @template TActions - The action definitions for type inference
 */
export interface TypedUsePillarResult<
  TActions extends SyncActionDefinitions | ActionDefinitions,
> extends PillarContextValue {
  /**
   * Type-safe task handler registration.
   *
   * @param taskName - The action name (autocompleted from your actions)
   * @param handler - Handler function with typed data parameter
   * @returns Unsubscribe function
   */
  onTask: <TName extends ActionNames<TActions>>(
    taskName: TName,
    handler: (data: ActionDataType<TActions, TName>) => void
  ) => () => void;
}

/**
 * Get access to the Pillar SDK instance and state
 *
 * @example Basic usage (untyped)
 * ```svelte
 * <script lang="ts">
 *   import { usePillar } from '@pillar-ai/svelte';
 *
 *   const { isReady, open, close, isPanelOpen } = usePillar();
 * </script>
 *
 * {#if !$isReady}
 *   <div>Loading...</div>
 * {:else}
 *   <button on:click={() => open()}>
 *     {$isPanelOpen ? 'Close Help' : 'Get Help'}
 *   </button>
 * {/if}
 * ```
 *
 * @example Type-safe onTask with action definitions
 * ```svelte
 * <script lang="ts">
 *   import { usePillar } from '@pillar-ai/svelte';
 *   import { actions } from '$lib/pillar/actions';
 *   import { onMount, onDestroy } from 'svelte';
 *
 *   const { pillar, onTask } = usePillar<typeof actions>();
 *
 *   let unsub: (() => void) | undefined;
 *
 *   onMount(() => {
 *     // TypeScript knows data has { type, url, name }
 *     unsub = onTask('add_new_source', (data) => {
 *       console.log(data.url); // ✓ Typed!
 *     });
 *   });
 *
 *   onDestroy(() => {
 *     unsub?.();
 *   });
 * </script>
 * ```
 */
export function usePillar<
  TActions extends SyncActionDefinitions | ActionDefinitions = SyncActionDefinitions,
>(): TypedUsePillarResult<TActions> {
  const context = getContext<PillarContextValue>(PILLAR_CONTEXT_KEY);

  if (!context) {
    throw new Error('usePillar must be used within a PillarProvider');
  }

  // Create a type-safe wrapper around pillar.onTask
  const onTask = <TName extends ActionNames<TActions>>(
    taskName: TName,
    handler: (data: ActionDataType<TActions, TName>) => void
  ): (() => void) => {
    const pillar = get(context.pillar);
    if (!pillar) {
      // Return no-op if pillar not ready
      return () => {};
    }
    // Cast handler to match the SDK's expected type
    // The runtime behavior is the same, this is just for type narrowing
    return pillar.onTask(
      taskName as string,
      handler as (data: Record<string, unknown>) => void
    );
  };

  return {
    ...context,
    onTask,
  };
}
