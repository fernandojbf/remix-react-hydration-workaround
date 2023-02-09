import { UNSAFE_RemixContext } from '@remix-run/react';
import type { RemixContextObject } from '@remix-run/react/dist/entry';
import React from 'react';

// @ts-ignore
import { UNSAFE_DataRouterStateContext } from 'react-router-dom';

export const removeNodeIfExists = (node: Element | null) => {
  if (node) {
    try {
      node.parentNode?.removeChild(node);
    } catch (e) {
      // something went wrong
    }
  }
};

export function useRemixContext(): RemixContextObject {
  let context = React.useContext(UNSAFE_RemixContext);
  return context!;
}

export function useDataRouterStateContext() {
  let context = React.useContext(UNSAFE_DataRouterStateContext);
  return context!;
}
