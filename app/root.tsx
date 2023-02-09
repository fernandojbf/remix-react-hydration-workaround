import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import Header from './components/header';
import MetaPortal from './components/meta-portal';
import PortalLinks from './components/links-portal';
import appStyles from './styles/app.css';

import rootLoader from './root-loader.server';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: appStyles,
  },
];

export const loader = rootLoader;

const App = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto">
        <u>
          The colors and sizes change between pages from blue (/) to green
          (/about). Black and Yellow are the SSR defaults
        </u>
      </div>
      <Outlet />
      <div className="container mx-auto grid gap-1 mt-6">
        <p>
          cookie <b>PORTAL_ON=true</b> enables hydration mitigation. otherwise
          FULL hydration is used
        </p>
        <p>
          Bellow should exist a div representing a 3rd party injection. If no
          content or any flash it means a complete rerender due to mismatch
        </p>
      </div>
      <Scripts />
      <ScrollRestoration />
    </>
  );
};

export default function Root() {
  const { isPortalEnabled } = useLoaderData();

  if (isPortalEnabled && typeof window !== 'undefined') {
    return (
      <>
        <PortalLinks />
        <MetaPortal />
        <App />
      </>
    );
  }

  return (
    <html lang="en" className="bg-html">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html:
              ':root{--color-menu: yellow;--color-items: yellow;--color-html: black;--size-item: 50px;}',
          }}
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        <div id="root">
          <App />
        </div>

        (
          <script
            dangerouslySetInnerHTML={{
              __html: `var newDiv = document.createElement('div');
newDiv.innerHTML ='<u class="font-bold uppercase">Injected By a 3rd Party 🎉</u>';
document.querySelector('body').appendChild(newDiv);`,
            }}
          />
        )

        <LiveReload />
      </body>
    </html>
  );
}
