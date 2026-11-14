import { useImperativeHandle, useRef, useState } from 'react';
import '../../css/CodeVerification.css';

/**
 * Six separate digit boxes with auto-advance, Backspace to the previous box,
 * arrow keys, and paste / SMS autofill support.
 *
 * Reports the joined code through `onChange(code)`. The parent can call
 * `ref.current.clear()` (empties and focuses the first box) or `ref.current.focus()`.
 */
export default function CodeInput({ ref, length = 6, invalid = false, labelledBy, onChange }) {
    const emptyDigits = () => Array(length).fill('');
    const [digits, setDigits] = useState(emptyDigits);
    const inputs = useRef([]);

    function focusBox(index) {
        const box = inputs.current[Math.max(0, Math.min(length - 1, index))];
        box?.focus();
        box?.select();
    }

    function updateDigits(next) {
        setDigits(next);
        onChange?.(next.join(''));
    }

    useImperativeHandle(ref, () => ({
        clear() {
            updateDigits(emptyDigits());
            focusBox(0);
        },
        focus() {
            focusBox(0);
        },
    }));

    function fillFrom(index, value) {
        const chars = value.replace(/\D/g, '').slice(0, length - index).split('');
        if (chars.length === 0) return;
        const next = [...digits];
        chars.forEach((char, offset) => {
            next[index + offset] = char;
        });
        updateDigits(next);
        focusBox(index + chars.length);
    }

    function handleChange(index, event) {
        const value = event.target.value;
        if (value === '') {
            const next = [...digits];
            next[index] = '';
            updateDigits(next);
            return;
        }
        // Typing next to an existing digit yields 2 chars: keep the new one.
        // Longer values (OTP autofill) are spread across the boxes.
        const incoming = value.length === 2 && digits[index]
            ? value.replace(digits[index], '') || digits[index]
            : value;
        fillFrom(index, incoming);
    }

    function handleKeyDown(index, event) {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            event.preventDefault();
            const next = [...digits];
            next[index - 1] = '';
            updateDigits(next);
            focusBox(index - 1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusBox(index - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusBox(index + 1);
        }
    }

    function handlePaste(index, event) {
        event.preventDefault();
        fillFrom(index, event.clipboardData.getData('text'));
    }

    return (<div className="verify-code-boxes" role="group" aria-labelledby={labelledBy}>
      {digits.map((digit, index) => (<input key={index} ref={(el) => { inputs.current[index] = el; }} className="verify-code-box" data-filled={digit !== ''} aria-invalid={invalid} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={index === 0 ? 'one-time-code' : 'off'} autoFocus={index === 0} maxLength={length} aria-label={`Digit ${index + 1}`} value={digit} onChange={(event) => handleChange(index, event)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={(event) => handlePaste(index, event)} onFocus={(event) => event.target.select()}/>))}
    </div>);
}
