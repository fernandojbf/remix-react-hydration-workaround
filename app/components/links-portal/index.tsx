import type { LinkDescriptor } from '@remix-run/node';
import { PrefetchPageLinks } from '@remix-run/react';
import {
  getLinksForMatches,
  isPageLinkDescriptor,
} from '@remix-run/react/dist/links';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  removeNodeIfExists,
  useDataRouterStateContext,
  useRemixContext,
} from '~/utils';

/**
 * Renders the `<link>` tags for the current routes.
 *
 * @see https://remix.run/components/links
 */
export default function PortalLinks() {
  const { toBeAdded, onDOMClear, toBeRemoved } = useLinks();

  useEffect(() => {
    toBeRemoved.forEach(({ key, ...link }) => {
      const node = document.querySelector(
        `link${Object.entries(link)
          .filter(([a]) => a !== 'key')
          .map(([k, v]) => `[${k}="${v}"]`)
          .join('')}`,
      );
      removeNodeIfExists(node);
      onDOMClear(key);
    });
  }, [toBeRemoved, onDOMClear]);

  return createPortal(
    <>
      {toBeAdded.map(({ key, ...link }) => {
        if (isPageLinkDescriptor(link)) {
          return <PrefetchPageLinks key={link.page} {...link} />;
        }

        let imageSrcSet: string | null = null;

        // In React 17, <link imageSrcSet> and <link imageSizes> will warn
        // because the DOM attributes aren't recognized, so users need to pass
        // them in all lowercase to forward the attributes to the node without a
        // warning. Normalize so that either property can be used in Remix.
        if ('useId' in React) {
          if (link.imagesrcset) {
            link.imageSrcSet = imageSrcSet = link.imagesrcset;
            delete link.imagesrcset;
          }

          if (link.imagesizes) {
            link.imageSizes = link.imagesizes;
            delete link.imagesizes;
          }
        } else {
          if (link.imageSrcSet) {
            link.imagesrcset = imageSrcSet = link.imageSrcSet;
            delete link.imageSrcSet;
          }

          if (link.imageSizes) {
            link.imagesizes = link.imageSizes;
            delete link.imageSizes;
          }
        }

        return (
          <link
            key={link.rel + (link.href || '') + (imageSrcSet || '')}
            {...link}
          />
        );
      })}
    </>,
    document.head,
  );
}

const mapper = (
  link: LinkDescriptor,
): [string, LinkDescriptor & { key: string }] => {
  let key: string = '';

  if (isPageLinkDescriptor(link)) {
    key = link.page;
  } else {
    let imageSrcSet: string | null = null;

    if (link.imagesrcset) {
      link.imageSrcSet = imageSrcSet = link.imagesrcset;
      delete link.imagesrcset;
    }

    if (link.imagesizes) {
      link.imageSizes = link.imagesizes;
      delete link.imagesizes;
    }

    key = link.rel + (link.href || '') + (imageSrcSet || '');
  }

  return [key, { ...link, key }];
};

type LinkDescriptorWithKey = LinkDescriptor & { key: string };
type LinkDescriptionWithKeyObject = { [key: string]: LinkDescriptorWithKey };

const useLinks = () => {
  const { manifest, routeModules } = useRemixContext();
  const { matches } = useDataRouterStateContext();

  const ssrLinksElements = useRef<LinkDescriptionWithKeyObject>(
    Object.fromEntries(
      getLinksForMatches(matches, routeModules, manifest).map(mapper),
    ),
  );

  const currentLinks: LinkDescriptionWithKeyObject = useMemo(
    () =>
      Object.fromEntries(
        getLinksForMatches(matches, routeModules, manifest).map(mapper),
      ),
    [matches, routeModules, manifest],
  );

  const onDOMClear = useCallback(
    (key: string) => delete ssrLinksElements.current[key],
    [],
  );

  if (Object.entries(ssrLinksElements.current).length === 0) {
    return {
      toBeAdded: Object.values(currentLinks),
      toBeRemoved: [],
      onDOMClear,
    };
  }

  const toBeAdded: LinkDescriptorWithKey[] = [];
  const toBeRemoved: LinkDescriptorWithKey[] = [];

  Object.entries(currentLinks).forEach(([key, link]) => {
    if (
      ssrLinksElements.current[key] &&
      Object.entries(link).some(([innerKey, innerValue]) => {
        return (
          innerValue !==
          ssrLinksElements.current[key][innerKey as keyof typeof link]
        );
      })
    ) {
      toBeAdded.push(link);
      toBeRemoved.push(ssrLinksElements.current[key]);
    }

    if (!ssrLinksElements.current[key]) {
      toBeAdded.push(link);
    }
  });

  Object.entries(ssrLinksElements.current).forEach(([key, value]) => {
    if (!currentLinks[key]) {
      toBeRemoved.push(value);
    }
  });

  return {
    toBeAdded,
    toBeRemoved,
    onDOMClear,
  };
};
