# dead-lock-react-lib

A collection of React components. Starting with `Truncate`, a single-line-truncating `<span>` for React with click-to-expand and a hover tooltip. Truncation is driven by inline styles, so it works out of the box — no Tailwind (or any CSS framework) required. Tailwind users can keep using utility classes for everything else via `className`.

## Install

```bash
npm install dead-lock-react-lib
```

## Usage

You can import components using named imports:

```tsx
import { Truncate } from 'dead-lock-react-lib';

<Truncate width={240}>A long string that will be truncated with an ellipsis</Truncate>
<Truncate style={{ maxWidth: '20rem', color: 'crimson' }}>...</Truncate>
```

### Multi-line Clamping (Line Clamp)

You can clamp the text to a specific number of lines before truncating:

```tsx
<Truncate lines={3} width="300px">
  A very long paragraph of text that will be clamped to exactly three lines before it truncates with an ellipsis.
</Truncate>
```

### Tailwind

```tsx
<Truncate className="max-w-xs text-sm text-gray-600">
  A long string that will be truncated with an ellipsis
</Truncate>
```

`className`, `style`, and `width` can be combined; `style` always has final
say over the computed truncation styles, and `width` becomes `maxWidth` when
neither `className` nor `style` already define one.

## Props

| Prop                 | Type                 | Default | Description                                                              |
| -------------------- | -------------------- | ------- | -------------------------------------------------------------------------- |
| `children`           | `ReactNode`          | —       | Content to render/truncate.                                              |
| `title`              | `string`             | —       | Tooltip shown while truncated. Defaults to the text form of `children`.  |
| `className`          | `string`             | —       | Tailwind or plain CSS classes. Purely additive.                          |
| `classname`          | `string`             | —       | Lowercase alias for `className` (typo-tolerant).                         |
| `style`              | `CSSProperties`      | —       | Inline CSS, merged over the computed truncation styles.                  |
| `width`              | `number \| string`   | —       | Truncation width. A number is treated as px.                             |
| `lines`              | `number`             | —       | Number of lines to clamp to before truncating. If > 1, multi-line is used.|
| `noMobileTransform`  | `boolean`            | `false` | Below 768px, skip truncation and render the full text.                   |
| `whitespace`         | `boolean`            | `false` | When truncation is bypassed on mobile, force single-line instead of wrap.|
| `disableClickExpand` | `boolean`            | `false` | Disable the click-to-expand/collapse interaction.                        |

## Behavior notes

- Hovering measures overflow; if the text is actually clipped, the element
  becomes clickable and shows a native tooltip.
- Clicking a truncated (or expanded) element toggles between the ellipsis
  view and a fully wrapped, multi-line view.
- With `noMobileTransform`, any width limit — from `className`, `style`, or
  `width` — is dropped on mobile viewports so the text renders naturally.
