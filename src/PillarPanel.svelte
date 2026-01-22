<script lang="ts">
/**
 * PillarPanel Component
 * Renders the Pillar help panel at a custom location in the DOM
 */

import { getContext, onMount } from 'svelte';
import { get } from 'svelte/store';
import { PILLAR_CONTEXT_KEY } from './context';
import type { PillarContextValue } from './types';

// Props
interface Props {
  class?: string;
  style?: string;
}

let { class: className, style }: Props = $props();

let containerRef: HTMLDivElement;
let hasMounted = false;

// Get context from PillarProvider
const context = getContext<PillarContextValue>(PILLAR_CONTEXT_KEY);

if (!context) {
  console.error('[Pillar Svelte] PillarPanel must be used within a PillarProvider');
}

onMount(() => {
  // Only mount once when SDK is ready and we have a container
  const isReady = get(context?.isReady ?? { subscribe: () => () => {} });
  const pillar = get(context?.pillar ?? { subscribe: () => () => {} });

  if (!isReady || !pillar || !containerRef || hasMounted) {
    // If not ready yet, subscribe to ready state
    if (context && !isReady) {
      const unsubscribe = context.on('ready', () => {
        const pillarInstance = get(context.pillar);
        if (containerRef && pillarInstance && !hasMounted) {
          pillarInstance.mountPanelTo(containerRef);
          hasMounted = true;
        }
      });
      return unsubscribe;
    }
    return;
  }

  // Mount the panel into our container
  pillar.mountPanelTo(containerRef);
  hasMounted = true;

  // Cleanup is handled by Pillar.destroy() in the provider
});
</script>

<div
  bind:this={containerRef}
  class={className}
  {style}
  data-pillar-panel-container
></div>
