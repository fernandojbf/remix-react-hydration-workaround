# React Hydration Problem Workaround

Until this moment, rendering and hydration of the FULL document using React have some problems.
If a mismatch occurs, the document is rerendered, losing any content created by the client-side react tree (3rd parties, browser extensions, etc).

Since nextjs now is moving to FULL document render and the react team is working near with them, I believe react will solve the problem on their end.

No matter what this project implements workaround mitigation for this problem. The work made here it's not intended to be a final solution. I'm only trying to prove a concept. Feel free to comment or copy the solution.

A lot of code was brought from the source code of the remix components.

The code is for sure optimized, bugged and with a lot of opportunities to improve.

note: A timeout of 100ms was added to the hydration to mock a slower hydration time, helping with the issue replication.

## What to look

There is a div being injected at the bottom of the page. This represents a browser extension or 3rd party.

To enable hydration mitigation, the cookie `PORTAL_ON=true` should be added. Otherwise FULL document hydration will be used.

- meta `title` should change between home and about page,
- meta with `attr` should change between home and about page,
- `description` meta should be present in about page,
- CSS variable links should change between the home and the about page.

The hydration should not fail.

## Development

No need to install it. I'm using yarn 3.

```sh
yarn dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

## Created from

This project was created via Vercel's remix template

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/vercel/tree/main/examples/remix&template=remix)

## Author

Fernando Ferreira
