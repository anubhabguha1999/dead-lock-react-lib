import React, { useState, useRef, useEffect, type CSSProperties } from 'react';

export interface TruncateProps {
  children?: React.ReactNode;
  /** Tooltip text shown while truncated. Defaults to the string form of `children`. */
  title?: string;
  /** Tailwind (or any) utility classes. Purely additive — truncation itself works without it. */
  className?: string;
  /** Lowercase alias for `className`, kept for typo-tolerance. */
  classname?: string;
  /** Inline CSS. Merged over the component's computed truncation styles, so anything here wins. */
  style?: CSSProperties;
  /** Explicit truncation width. Number is treated as px; string is used as-is (e.g. '20rem', '100%'). */
  width?: number | string;
  /** On mobile viewports (<768px), skip truncation entirely and render the full text. */
  noMobileTransform?: boolean;
  /** Force single-line (nowrap) instead of wrapping when truncation is bypassed on mobile. */
  whitespace?: boolean;
  /** Disable the click-to-expand/collapse interaction. */
  disableClickExpand?: boolean;
  /** @deprecated Use `disableClickExpand` instead. Kept for backward compatibility. */
  'dont-work-onCLick'?: boolean;
  /** Number of lines to clamp the text to before truncating. If specified and > 1, multi-line truncation is used. */
  lines?: number;
}

function toCssSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export default function Truncate({
  children,
  title,
  className,
  classname,
  style,
  width,
  lines,
  noMobileTransform = false,
  whitespace = false,
  disableClickExpand = false,
  'dont-work-onCLick': dontWorkOnClickLegacy = false,
}: TruncateProps) {
  const dontWorkOnClick = disableClickExpand || dontWorkOnClickLegacy;
  const combinedClassName = className || classname || '';
  const [isTruncated, setIsTruncated] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isMultiLine = lines !== undefined && lines > 1;

  // Measure if we are on a mobile viewport
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!noMobileTransform) return;

    // Check match on mount and listen for resize changes
    const media = window.matchMedia('(max-width: 767px)');
    const updateMatch = () => setIsMobile(media.matches);

    updateMatch();
    media.addEventListener('change', updateMatch);
    return () => media.removeEventListener('change', updateMatch);
  }, [noMobileTransform]);

  const handleMouseEnter = () => {
    const el = elementRef.current;
    if (el) {
      // If scrollWidth is larger than clientWidth (or scrollHeight is larger than clientHeight for multi-line clamp),
      // it means the text is overflowing/truncating
      const isOverflowing = isMultiLine
        ? el.scrollHeight > el.clientHeight
        : el.scrollWidth > el.clientWidth;
      setIsTruncated(isOverflowing);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (dontWorkOnClick) return;
    if (!isTruncated && !expanded) return;
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  // Expanding wraps the text across multiple lines, which can leave the element
  // horizontally scrolled to wherever the click landed. Collapsing back to a
  // single-line box without resetting that offset shows whatever substring
  // happened to be scrolled into view instead of the start of the text.
  useEffect(() => {
    if (expanded) return;
    const el = elementRef.current;
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  }, [expanded]);

  // If title is explicitly provided (even if empty string), use it.
  // Otherwise, default to the text representation of children if it is a string or number.
  const displayTitle =
    title !== undefined
      ? title
      : typeof children === 'string' || typeof children === 'number'
        ? String(children)
        : undefined;

  // If noMobileTransform is active and we are on mobile, bypass truncation entirely!
  const shouldTruncate = !noMobileTransform || !isMobile;
  const clickable = !dontWorkOnClick && (isTruncated || expanded);
  const cssWidth = toCssSize(width);

  // Inline styles drive the actual truncation behavior, so it works identically whether
  // or not Tailwind (or any stylesheet) is present. `className` stays purely additive —
  // colors, padding, custom max-widths, etc. — and `style` always wins last.
  const baseStyle: CSSProperties = expanded
    ? { display: 'inline-block', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: cssWidth }
    : shouldTruncate
      ? isMultiLine
        ? {
            display: '-webkit-box',
            WebkitLineClamp: lines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: cssWidth,
          }
        : {
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: cssWidth,
          }
      : {
          display: 'block',
          overflow: 'visible',
          whiteSpace: whitespace ? 'nowrap' : 'normal',
        };

  if (clickable) baseStyle.cursor = 'pointer';

  const finalStyle: CSSProperties = { ...baseStyle, ...style };

  // On mobile view with noMobileTransform, strip any width limit (ours or the caller's)
  // so the text displays naturally. On desktop we leave className/style width untouched.
  let finalClassName = combinedClassName;
  if (!shouldTruncate) {
    finalClassName = combinedClassName
      .split(/\s+/)
      .filter((c) => !c.includes('max-w') && !c.startsWith('w-') && c !== 'truncate')
      .join(' ');
    finalStyle.maxWidth = 'none';
    finalStyle.width = undefined;
  }

  return (
    <span
      // Forces a fresh DOM node on every expand/collapse toggle. Chromium can get
      // stuck showing the plain clipped text with no "…" glyph after a `nowrap` →
      // `normal` → `nowrap` cycle on the same node — the box is genuinely clipped
      // (scrollWidth > clientWidth) but the ellipsis repaint never re-triggers.
      // Remounting sidesteps that stale-paint state entirely.
      key={expanded ? 'expanded' : 'collapsed'}
      ref={elementRef}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={finalClassName || undefined}
      style={finalStyle}
      title={!expanded && isTruncated && shouldTruncate ? displayTitle : undefined}
    >
      {children}
    </span>
  );
}
