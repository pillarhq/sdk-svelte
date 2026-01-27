# @pillar-ai/svelte

Svelte bindings for the Pillar Embedded Help SDK — Add contextual help and AI-powered assistance to your Svelte application.

[![npm version](https://img.shields.io/npm/v/@pillar-ai/svelte)](https://www.npmjs.com/package/@pillar-ai/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@pillar-ai/svelte)](https://www.npmjs.com/package/@pillar-ai/svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## Features

- **Svelte Stores** — `usePillar` and `useHelpPanel` reactive stores
- **Components** — `PillarProvider` and `PillarPanel` components
- **Svelte 5 Support** — Full compatibility with Svelte 5 runes and snippets
- **SvelteKit Integration** — Works seamlessly with SvelteKit routing
- **Type-Safe Actions** — Full TypeScript support for custom actions
- **Custom Cards** — Render custom Svelte components for inline actions

## Documentation

**[View Full Documentation](https://trypillar.com/docs)** | [Svelte Guide](https://trypillar.com/docs/svelte/installation) | [API Reference](https://trypillar.com/docs/reference/svelte)

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

## Components

### PillarProvider

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

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `helpCenter` | `string` | Yes | Your help center identifier |
| `config` | `PillarConfig` | No | SDK configuration options |
| `onTask` | `(task) => void` | No | Handler for AI-suggested actions |
| `cards` | `Record<string, Component>` | No | Custom card components |

### PillarPanel

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

## Stores

### usePillar()

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

| Property | Type | Description |
|----------|------|-------------|
| `pillar` | Writable | The SDK instance |
| `state` | Writable | Current state (`'uninitialized'` \| `'ready'` \| `'error'`) |
| `isReady` | Readable | Derived from state |
| `isPanelOpen` | Writable | Panel open state |
| `open(options?)` | Function | Open the panel |
| `close()` | Function | Close the panel |
| `toggle()` | Function | Toggle the panel |
| `openArticle(slug)` | Function | Open a specific article |
| `openCategory(slug)` | Function | Open a specific category |
| `search(query)` | Function | Open with search query |
| `setTheme(theme)` | Function | Update theme at runtime |

### useHelpPanel()

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

## Related Packages

| Package | Description |
|---------|-------------|
| [@pillar-ai/sdk](https://github.com/pillarhq/sdk) | Core vanilla JavaScript SDK |
| [@pillar-ai/react](https://github.com/pillarhq/sdk-react) | React bindings |
| [@pillar-ai/vue](https://github.com/pillarhq/sdk-vue) | Vue 3 bindings |

## Requirements

- Svelte 4.0.0 or higher

## License

MIT
