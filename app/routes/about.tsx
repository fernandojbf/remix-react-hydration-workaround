import type { LinksFunction, MetaFunction } from '@remix-run/node';
import variables from '../styles/vars-about.css';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: variables,
  },
];

export const meta: MetaFunction = () => ({
  title: 'About',
  someMeta: {
    attr: 'about',
  },
  description: 'about page example',
});

const items = Array.from({ length: 10 }, (_, i) => (
  <div className="h-item bg-items" key={i} />
));

export default function About() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1 className="container mx-auto">About</h1>
      <div className="grid auto-cols-min grid-cols-6 gap-2 container mx-auto">
        {items}
      </div>
    </div>
  );
}
