import { Link } from '@remix-run/react';

export default function Header() {
  return (
    <header className="bg-menu text-white py-2">
      <ul className="container mx-auto grid grid-flow-col">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </header>
  );
}
