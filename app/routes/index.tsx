import type { LinksFunction, MetaFunction } from '@remix-run/node';
import variables from '../styles/vars-index.css';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: variables,
  },
];

export const meta: MetaFunction = () => ({
  title: 'Home',
  someMeta: {
    attr: "home"
  }
});

const items = Array.from({ length: 10 }, (_, i) => (
  <div className="h-item bg-items" key={i} />
));

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1 className="container mx-auto">Home</h1>

      <div className='grid grid-cols-6 gap-2 container mx-auto'>{items}</div>
    </div>
  );
}
