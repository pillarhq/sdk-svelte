# @pillar-ai/svelte

Svelte bindings for Pillar — Cursor for your product.

[![npm version](https://img.shields.io/npm/v/@pillar-ai/svelte)](https://www.npmjs.com/package/@pillar-ai/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@pillar-ai/svelte)](https://www.npmjs.com/package/@pillar-ai/svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## What is Pillar?

Pillar is an embedded AI co-pilot that helps users complete tasks, not just answer questions. Users say what they want, and Pillar uses your UI to make it happen — navigating pages, pre-filling forms, and calling your APIs.

## Features

- **Task Execution** — Navigate pages, pre-fill forms, call APIs on behalf of users
- **Svelte Stores** — `usePillar` and `useHelpPanel` reactive stores
- **Svelte 5 Support** — Full compatibility with runes and snippets
- **SvelteKit Integration** — Works seamlessly with SvelteKit routing
- **Multi-Step Plans** — Chain actions into workflows for complex tasks
- **Type-Safe Actions** — Full TypeScript support for action definitions
- **Custom Action Cards** — Render Svelte components for confirmations and data input

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

### 1. Get Your Product Key

First, register your product in the [Pillar app](https://app.trypillar.com):

1. Sign up or log in at [app.trypillar.com](https://app.trypillar.com)
2. Create a new product
3. Copy your **Product Key** from the settings page

### 2. Add the Provider

Wrap your app with `PillarProvider` and define actions:

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { PillarProvider } from '@pillar-ai/svelte';
  import { goto } from '$app/navigation';

  const actions = {
    export_to_csv: {
      type: 'trigger' as const,
      label: 'Export to CSV',
      description: 'Export current data to CSV file',
    },
    go_to_settings: {
      type: 'navigate' as const,
      label: 'Open Settings',
      description: 'Navigate to settings page',
    },
  };

  function handleTask(task: { name: string; data: any }) {
    if (task.name === 'go_to_settings') {
      goto('/settings');
    }
    if (task.name === 'export_to_csv') {
      downloadCSV();
    }
  }
</script>

<PillarProvider
  productKey="your-product-key"
  {actions}
  onTask={handleTask}
>
  <slot />
</PillarProvider>
```

## Defining Actions

Actions define what your co-pilot can do. When users make requests, Pillar matches intent to actions:

```typescript
const actions = {
  // Navigation actions
  go_to_billing: {
    type: 'navigate' as const,
    label: 'Open Billing',
    description: 'Navigate to billing and subscription settings',
  },

  // Trigger actions that execute code
  export_report: {
    type: 'trigger' as const,
    label: 'Export Report',
    description: 'Export the current report to PDF or CSV',
  },

  // Actions with data schemas (AI extracts parameters)
  invite_team_member: {
    type: 'trigger' as const,
    label: 'Invite Team Member',
    description: 'Send an invitation to join the team',
    dataSchema: {
      email: { type: 'string' as const, required: true },
      role: { type: 'string' as const, enum: ['admin', 'member', 'viewer'] },
    },
  },
};
```

## Stores

### usePillar()

Access the full SDK instance and state:

```svelte
<script lang="ts">
  import { usePillar } from '@pillar-ai/svelte';

  const { isReady, isPanelOpen, open, close, toggle } = usePillar();
</script>

{#if $isReady}
  <button on:click={toggle}>
    {$isPanelOpen ? 'Close Co-pilot' : 'Open Co-pilot'}
  </button>
{/if}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `pillar` | Writable | The SDK instance |
| `isReady` | Readable | SDK initialization state |
| `isPanelOpen` | Writable | Panel open state |
| `open(options?)` | Function | Open the panel |
| `close()` | Function | Close the panel |
| `toggle()` | Function | Toggle the panel |
| `openArticle(slug)` | Function | Open a specific article |
| `setTheme(theme)` | Function | Update theme at runtime |

### useHelpPanel()

Simplified panel controls:

```svelte
<script lang="ts">
  import { useHelpPanel } from '@pillar-ai/svelte';

  const { isOpen, toggle, openChat } = useHelpPanel();
</script>

<button on:click={toggle}>{$isOpen ? 'Close' : 'Ask Co-pilot'}</button>
<button on:click={openChat}>Start Chat</button>
```

## Components

### PillarProvider

The main provider component:

```svelte
<PillarProvider
  productKey="your-product-key"
  actions={actions}
  onTask={(task) => handleTask(task)}
  config={{
    panel: { position: 'right' },
    edgeTrigger: { enabled: true },
  }}
>
  <slot />
</PillarProvider>
```

### PillarPanel

For custom panel placement:

```svelte
<PillarProvider
  productKey="your-product-key"
  config={{ panel: { container: 'manual' } }}
>
  <div class="layout">
    <PillarPanel class="sidebar-panel" />
    <main>Your content</main>
  </div>
</PillarProvider>
```

## Custom Action Cards

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
  <button on:click={handleConfirm}>Send Invite</button>
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
  productKey="your-product-key"
  cards={{ invite_team_member: InviteCard }}
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

  const actions = {
    navigate: {
      type: 'navigate' as const,
      label: 'Navigate',
      description: 'Navigate to a page in the app',
    },
  };
</script>

<PillarProvider
  productKey="your-product-key"
  {actions}
  onTask={(task) => {
    if (task.name === 'navigate') {
      goto(task.data.path);
    }
  }}
>
  {@render children()}
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
