# @pillar-ai/svelte

Svelte bindings for the [Pillar](https://trypillar.com) Embedded Help SDK.

## Installation

```bash
npm install @pillar-ai/svelte
# or
pnpm add @pillar-ai/svelte
# or
yarn add @pillar-ai/svelte
```

## Quick Start

Wrap your app with `PillarProvider`:

```svelte
<!-- +layout.svelte or App.svelte -->
<script lang="ts">
  import { PillarProvider } from '@pillar-ai/svelte';
</script>

<PillarProvider helpCenter="your-help-center">
  <slot />
</PillarProvider>
```

Then use the SDK anywhere in your app:

```svelte
<script lang="ts">
  import { usePillar, useHelpPanel } from '@pillar-ai/svelte';

  const { isReady } = usePillar();
  const { toggle, isOpen } = useHelpPanel();
</script>

{#if $isReady}
  <button on:click={toggle}>
    {$isOpen ? 'Close Help' : 'Get Help'}
  </button>
{/if}
```

## API Reference

### Components

#### `PillarProvider`

The main provider component that initializes the SDK.

```svelte
<PillarProvider
  helpCenter="your-help-center"
  config={{
    panel: { position: 'right' },
    edgeTrigger: { enabled: true },
  }}
  onTask={(task) => {
    // Handle AI-suggested actions
    if (task.name === 'open_settings') {
      goto('/settings');
    }
  }}
>
  <slot />
</PillarProvider>
```

**Props:**
- `helpCenter` (required): Your help center identifier
- `config`: SDK configuration options
- `onTask`: Handler for AI-suggested actions
- `cards`: Custom card components for inline UI actions

#### `PillarPanel`

Renders the help panel at a custom location (for advanced layouts).

```svelte
<PillarProvider
  helpCenter="your-help-center"
  config={{ panel: { container: 'manual' } }}
>
  <div class="layout">
    <PillarPanel class="sidebar-panel" />
    <main>Your content</main>
  </div>
</PillarProvider>
```

### Stores

#### `usePillar()`

Access the full SDK instance and state.

```svelte
<script lang="ts">
  import { usePillar } from '@pillar-ai/svelte';

  const { pillar, state, isReady, isPanelOpen, open, close, toggle, setTheme } = usePillar();
</script>

{#if $isReady}
  <p>SDK is ready!</p>
{/if}
```

**Returns:**
- `pillar`: Writable store with the SDK instance
- `state`: Writable store with current state (`'uninitialized' | 'ready' | 'error'`)
- `isReady`: Readable store (derived from state)
- `isPanelOpen`: Writable store
- `open(options?)`: Open the panel
- `close()`: Close the panel
- `toggle()`: Toggle the panel
- `openArticle(slug)`: Open a specific article
- `openCategory(slug)`: Open a specific category
- `search(query)`: Open with search query
- `navigate(view, params?)`: Navigate to a view
- `setTheme(theme)`: Update theme at runtime
- `setTextSelectionEnabled(enabled)`: Toggle text selection popover
- `on(event, callback)`: Subscribe to SDK events

#### `useHelpPanel()`

Simplified panel controls.

```svelte
<script lang="ts">
  import { useHelpPanel } from '@pillar-ai/svelte';

  const { isOpen, toggle, openChat, openSearch } = useHelpPanel();
</script>

<button on:click={toggle}>{$isOpen ? 'Close' : 'Help'}</button>
<button on:click={openChat}>Ask AI</button>
<button on:click={() => openSearch('how to')}>Search</button>
```

**Returns:**
- `isOpen`: Readable store
- `open(options?)`: Open the panel
- `close()`: Close the panel
- `toggle()`: Toggle the panel
- `openArticle(slug)`: Open a specific article
- `openCategory(slug)`: Open a specific category
- `openSearch(query?)`: Open search view
- `openChat()`: Open AI chat view

## Type-Safe Actions

For type-safe action handling, pass your action definitions:

```svelte
<script lang="ts">
  import { usePillar } from '@pillar-ai/svelte';
  import { actions } from '$lib/pillar/actions';
  import { onMount, onDestroy } from 'svelte';

  const { onTask } = usePillar<typeof actions>();

  let unsub: (() => void) | undefined;

  onMount(() => {
    // TypeScript knows the exact shape of data
    unsub = onTask('invite_member', (data) => {
      console.log(data.email); // Fully typed!
    });
  });

  onDestroy(() => unsub?.());
</script>
```

## Custom Cards

Render custom UI for inline actions:

```svelte
<!-- InviteCard.svelte -->
<script lang="ts">
  import type { CardComponentProps } from '@pillar-ai/svelte';

  let { data, onConfirm, onCancel, onStateChange }: CardComponentProps<{
    email: string;
    role: string;
  }> = $props();

  async function handleConfirm() {
    onStateChange?.('loading', 'Sending invite...');
    try {
      await sendInvite(data.email, data.role);
      onStateChange?.('success', 'Invite sent!');
      onConfirm();
    } catch (e) {
      onStateChange?.('error', 'Failed to send invite');
    }
  }
</script>

<div class="card">
  <p>Invite {data.email} as {data.role}?</p>
  <button on:click={handleConfirm}>Confirm</button>
  <button on:click={onCancel}>Cancel</button>
</div>
```

Register in the provider:

```svelte
<script lang="ts">
  import { PillarProvider } from '@pillar-ai/svelte';
  import InviteCard from './InviteCard.svelte';
</script>

<PillarProvider
  helpCenter="your-help-center"
  cards={{
    invite_member: InviteCard,
  }}
>
  <slot />
</PillarProvider>
```

## SvelteKit Integration

For SvelteKit apps, add the provider in your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { PillarProvider } from '@pillar-ai/svelte';
  import { goto } from '$app/navigation';

  let { children } = $props();
</script>

<PillarProvider
  helpCenter="your-help-center"
  onTask={(task) => {
    if (task.name === 'navigate') {
      goto(task.data.path);
    }
  }}
>
  {@render children()}
</PillarProvider>
```

## License

MIT
