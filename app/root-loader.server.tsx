import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import cookie from 'cookie';

const loader: LoaderFunction = ({ request }) => {
  const cookieHeader = request.headers.get('Cookie') || '';
  const { PORTAL_ON: isPortalEnabled } = cookie.parse(cookieHeader);

  return json({
    isPortalEnabled: isPortalEnabled === 'true',
  });
};

export default loader;
