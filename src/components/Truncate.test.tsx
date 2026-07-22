import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Truncate from './Truncate';

describe('Truncate', () => {
  it('renders children', () => {
    render(<Truncate>Hello world</Truncate>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies width prop as inline maxWidth', () => {
    render(<Truncate width={120}>Hello world</Truncate>);
    expect(screen.getByText('Hello world')).toHaveStyle({ maxWidth: '120px' });
  });

  it('lets the style prop override computed truncation styles', () => {
    render(<Truncate style={{ whiteSpace: 'pre-wrap' }}>Hello world</Truncate>);
    expect(screen.getByText('Hello world')).toHaveStyle({ whiteSpace: 'pre-wrap' });
  });

  it('keeps className additive alongside inline styles', () => {
    render(<Truncate className="text-sm text-gray-600">Hello world</Truncate>);
    expect(screen.getByText('Hello world')).toHaveClass('text-sm', 'text-gray-600');
  });

  it('supports the lowercase classname alias', () => {
    render(<Truncate classname="alias-class">Hello world</Truncate>);
    expect(screen.getByText('Hello world')).toHaveClass('alias-class');
  });

  it('does not toggle expand when disableClickExpand is set', () => {
    const { container } = render(<Truncate disableClickExpand>Hello world</Truncate>);
    const el = container.querySelector('span')!;
    fireEvent.click(el);
    expect(el).toHaveStyle({ whiteSpace: 'nowrap', userSelect: 'none' });
    expect(el).toHaveClass('select-none');
    expect(el).not.toHaveStyle({ pointerEvents: 'none' });
    expect(el).not.toHaveClass('pointer-events-none');
  });

  it('applies line clamp styles when lines prop is 1', () => {
    render(<Truncate lines={1}>Hello single line clamp world</Truncate>);
    const el = screen.getByText('Hello single line clamp world');
    expect(el).toHaveStyle({
      display: '-webkit-box',
      webkitLineClamp: '1',
      overflow: 'hidden',
      whiteSpace: 'normal',
      wordBreak: 'break-all',
    });
  });

  it('applies line clamp styles when lines prop is provided and > 1', () => {
    render(<Truncate lines={3}>Hello multi line world</Truncate>);
    const el = screen.getByText('Hello multi line world');
    expect(el).toHaveStyle({
      display: '-webkit-box',
      webkitLineClamp: '3',
      overflow: 'hidden',
      whiteSpace: 'normal',
      wordBreak: 'break-all',
    });
    expect(el).toHaveClass('break-all');
  });

  it('removes line clamp styles when expanded', () => {
    render(<Truncate lines={3}>Hello multi line world</Truncate>);
    const el = screen.getByText('Hello multi line world');
    
    // Simulate truncation so click will expand
    Object.defineProperty(el, 'scrollHeight', { value: 100, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: 50, configurable: true });
    
    // Trigger hover to set isTruncated state
    fireEvent.mouseEnter(el);
    
    // Expand the component by clicking it
    fireEvent.click(el);
    
    // Retrieve the newly remounted element
    const expandedEl = screen.getByText('Hello multi line world');
    
    expect(expandedEl).toHaveStyle({
      display: 'inline-block',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
    });
    expect(expandedEl).not.toHaveClass('break-all');
  });

  it('displays tooltip (title attribute) when truncated even if disableClickExpand is set', () => {
    const { container } = render(
      <Truncate disableClickExpand title="Full custom title">
        Short text that overflows
      </Truncate>
    );
    const el = container.querySelector('span')!;
    
    // Simulate truncation (horizontal overflow since lines is undefined)
    Object.defineProperty(el, 'scrollWidth', { value: 200, configurable: true });
    Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
    
    // Trigger hover to evaluate truncation
    fireEvent.mouseEnter(el);
    
    expect(el).toHaveAttribute('title', 'Full custom title');
  });

  it('displays default tooltip as child text when truncated and no title prop is provided', () => {
    const { container } = render(
      <Truncate disableClickExpand>
        Truncated text default
      </Truncate>
    );
    const el = container.querySelector('span')!;
    
    // Simulate truncation
    Object.defineProperty(el, 'scrollWidth', { value: 200, configurable: true });
    Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
    
    // Trigger hover
    fireEvent.mouseEnter(el);
    
    expect(el).toHaveAttribute('title', 'Truncated text default');
  });
});


