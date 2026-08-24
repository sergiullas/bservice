import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SERVICELOG_SCOPE_CLASS_NAME } from '../../styles/scopeClassName';

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
 *
 * The portal container starts out `null` and is only created/attached
 * inside `useLayoutEffect`, never during render: creating real DOM nodes
 * and appending them to `document.body` as a side effect of rendering
 * would be impure (React 18 StrictMode double-invokes render, including
 * lazy `useState` initializers, specifically to surface exactly this kind
 * of bug, which would otherwise leak one orphaned container per mount).
 * `useLayoutEffect` still keeps this synchronous and flash-free: it runs
 * before the browser paints, and the state update it makes to publish the
 * container is flushed synchronously too, so the container exists and is
 * already attached by the time this component's children (rendered via
 * the portal on the next pass) mount and their own ref callbacks --
 * ServiceDetailDrawer's closeButtonRef calls `node.focus()` the moment it
 * mounts -- run. No user-visible extra frame results.
 */
export function Dialog({ onClose, children }: DialogProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = document.createElement('div');
    el.className = SERVICELOG_SCOPE_CLASS_NAME;
    document.body.appendChild(el);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const siblings = Array.from(document.body.children).filter((sibling) => sibling !== el);
    const previousAriaHidden = siblings.map((sibling) => sibling.getAttribute('aria-hidden'));
    siblings.forEach((sibling) => sibling.setAttribute('aria-hidden', 'true'));

    setContainer(el);

    return () => {
      document.body.style.overflow = previousOverflow;
      siblings.forEach((sibling, index) => {
        const previous = previousAriaHidden[index];
        if (previous === null) sibling.removeAttribute('aria-hidden');
        else sibling.setAttribute('aria-hidden', previous);
      });
      document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!container) return null;
  return createPortal(children, container);
}
