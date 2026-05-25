import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 18, readonly = false }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            onClick={() => !readonly && onChange && onChange(n)}
            onMouseEnter={() => !readonly && setHover(n)}
            onMouseLeave={() => !readonly && setHover(null)}
            disabled={readonly}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: readonly ? 'default' : 'pointer',
              fontSize: size + 'px',
              color: filled ? '#F59E0B' : '#E2E8F0',
              transition: 'color 0.1s',
              lineHeight: 1,
            }}
            aria-label={'Note ' + n}
          >
            <i className={filled ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
          </button>
        );
      })}
    </div>
  );
}
