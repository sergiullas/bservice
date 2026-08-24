import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Host-neutral replacement for @material-ui/core v4's Modal, scoped to
 * exactly what ServiceDetailDrawer actually relied on: portal rendering,
 * Escape-to-close, a body scroll lock, and hiding the rest of the app from
 * assistive tech while open. Focus-on-open, focus containment, and
 * return-focus are intentionally NOT handled here -- ServiceDetailDrawer
 * already implements those itself (the MUI Modal was rendered with
 * disableAutoFocus/disableRestoreFocus/disableEnforceFocus for exactly this
 * reason, see its comments), and that logic is unchanged by this primitive.
 */
export function Dialog({ onClose, children }: DialogProps) {
  // Created *and* attached synchronously during render (not in an effect):
  // children's ref callbacks -- ServiceDetailDrawer's closeButtonRef calls
  // `node.focus()` the moment it mounts -- run in React's layout phase,
  // which fires before this component's own effects. A detached container
  // would make that focus() call a no-op, since a node not yet connected to
  // `document` cannot be focused.
  const [container] = useState(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return el;
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const siblings = Array.from(document.body.children).filter((el) => el !== container);
    const previousAriaHidden = siblings.map((el) => el.getAttribute('aria-hidden'));
    siblings.forEach((el) => el.setAttribute('aria-hidden', 'true'));

    return () => {
      document.body.style.overflow = previousOverflow;
      siblings.forEach((el, index) => {
        const previous = previousAriaHidden[index];
        if (previous === null) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', previous);
      });
      document.body.removeChild(container);
    };
  }, [container]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(children, container);
}
