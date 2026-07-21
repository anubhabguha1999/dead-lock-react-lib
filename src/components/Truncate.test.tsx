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
    expect(el).toHaveStyle({ whiteSpace: 'nowrap' });
  });
});
