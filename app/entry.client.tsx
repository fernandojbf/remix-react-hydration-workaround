import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import cookie from 'cookie';

function hydrate() {
  // startTransition(() => {
  const { PORTAL_ON: isPortalEnabled } = cookie.parse(document.cookie);

  hydrateRoot(
    isPortalEnabled === 'true' ? document.querySelector('#root')! : document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
  // });
}

if (window.requestIdleCallback) {
  // window.requestIdleCallback(hydrate);
  // THIS MOCKS AND SLOWER HYDRATION
  setTimeout(hydrate, 200);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
