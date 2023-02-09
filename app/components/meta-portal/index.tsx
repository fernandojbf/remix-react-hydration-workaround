import type { AppData } from '@remix-run/node';
import { useLocation } from '@remix-run/react';
import type {
  V1_HtmlMetaDescriptor,
} from '@remix-run/react/dist/routeModules';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  removeNodeIfExists,
  useDataRouterStateContext,
  useRemixContext,
} from '~/utils';

/**
 * Renders the `<title>` and `<meta>` tags for the current routes.
 *
 * @see https://remix.run/components/meta
 */
export default function MetaPortal() {
  const { toBeAdded, toBeRemoved, onDOMClear } = usePortalMetaElements();

  useEffect(() => {
    Object.entries(toBeRemoved).forEach(([key, value]) => {
      if (['charset', 'charSet'].includes(key)) {
        const node =
          document.querySelector(`meta[charset="${value}"]`) ||
          document.querySelector(`meta[charSet="${value}"]`);

        removeNodeIfExists(node);
        // only now the dom is removed
        onDOMClear(key);
        return;
      }

      if (key === 'title') {
        const node = document.querySelector(`title`);
        removeNodeIfExists(node);
        onDOMClear(key);
        return;
      }

      let isOpenGraphTag = /^(og|music|video|article|book|profile|fb):.+$/.test(
        key,
      );

      [value].flat().forEach((content) => {
        if (isOpenGraphTag) {
          const node = document.querySelector(
            `meta[property=${key}][content=${content}]`,
          );

          removeNodeIfExists(node);
          onDOMClear(key);
          return;
        }

        if (typeof content === 'string') {
          const node = document.querySelector(
            `meta[name=${key}][content=${content}]`,
          );

          removeNodeIfExists(node);
          onDOMClear(key);
          return;
        }

        const node = document.querySelector(
          `meta[name="${key}"]${Object.entries(content!)
            .map(([k, v]) => `[${k}="${v}"]`)
            .join('')}`,
        );
        removeNodeIfExists(node);
        onDOMClear(key);
        return;
      });
    });
  }, [toBeRemoved, onDOMClear]);

  return createPortal(
    <>
      {Object.entries(toBeAdded).map(([name, value]) => {
        if (!value) {
          return null;
        }

        if (['charset', 'charSet'].includes(name)) {
          return <meta key="charset" charSet={value as string} />;
        }

        if (name === 'title') {
          return <title key="title">{String(value)}</title>;
        }

        // Open Graph tags use the `property` attribute, while other meta tags
        // use `name`. See https://ogp.me/
        //
        // Namespaced attributes:
        //  - https://ogp.me/#type_music
        //  - https://ogp.me/#type_video
        //  - https://ogp.me/#type_article
        //  - https://ogp.me/#type_book
        //  - https://ogp.me/#type_profile
        //
        // Facebook specific tags begin with `fb:` and also use the `property`
        // attribute.
        //
        // Twitter specific tags begin with `twitter:` but they use `name`, so
        // they are excluded.
        let isOpenGraphTag =
          /^(og|music|video|article|book|profile|fb):.+$/.test(name);

        return [value].flat().map((content) => {
          if (isOpenGraphTag) {
            return (
              <meta
                property={name}
                content={content as string}
                key={name + content}
              />
            );
          }

          if (typeof content === 'string') {
            return <meta name={name} content={content} key={name + content} />;
          }

          return <meta key={name + JSON.stringify(content)} {...content} />;
        });
      })}
    </>,
    document.head,
  );
}

const getMetaElements = ({
  matches,
  loaderData,
  routeModules,
  location,
}: any): V1_HtmlMetaDescriptor => {
  let meta = {};
  let parentsData: { [routeId: string]: AppData } = {};

  for (let match of matches) {
    let routeId = match.route.id;
    let data = loaderData[routeId];
    let params = match.params;

    let routeModule = routeModules[routeId];

    if (routeModule.meta) {
      let routeMeta =
        typeof routeModule.meta === 'function'
          ? routeModule.meta({
              data,
              parentsData,
              params,
              location,
              matches: undefined as any,
            })
          : routeModule.meta;
      if (routeMeta && Array.isArray(routeMeta)) {
        throw new Error(
          'The route at ' +
            match.route.path +
            ' returns an array. This is only supported with the `v2_meta` future flag ' +
            "in the Remix config. Either set the flag to `true` or update the route's " +
            'meta function to return an object.' +
            '\n\nTo reference the v1 meta function API, see https://remix.run/route/meta',
          // TODO: Add link to the docs once they are written
          // + "\n\nTo reference future flags and the v2 meta API, see https://remix.run/file-conventions/remix-config#future-v2-meta."
        );
      }
      Object.assign(meta, routeMeta);
    }
    parentsData[routeId] = data;
  }
  return meta;
};

const usePortalMetaElements = () => {
  let { routeModules } = useRemixContext();
  let { matches, loaderData } = useDataRouterStateContext();
  let location = useLocation();

  const ssrMetaElements = useRef<V1_HtmlMetaDescriptor>(
    getMetaElements({
      matches,
      loaderData,
      routeModules,
      location,
    }),
  );

  const currentElements = getMetaElements({
    matches,
    loaderData,
    routeModules,
    location,
  });

  const onDOMClear = useCallback(
    (key: string) => delete ssrMetaElements.current[key],
    [],
  );

  // in case SSR meta are empty it means no more meta from portal should be skipped
  if (Object.entries(ssrMetaElements.current).length === 0) {
    return {
      toBeAdded: currentElements,
      toBeRemoved: [],
      onDOMClear,
    };
  }

  const toBeAdded: V1_HtmlMetaDescriptor = {};
  const toBeRemoved: V1_HtmlMetaDescriptor = {};

  // check if there is any new Meta that was not added via SSR and marks it to be removed and added
  // if meta is already there via SSR does not added it again
  Object.entries(currentElements).forEach(([key, value]) => {
    if (!ssrMetaElements.current[key]) {
      toBeAdded[key] = value;
      return;
    }
    if (typeof value === 'string') {
      if (value !== ssrMetaElements.current[key]) {
        toBeAdded[key] = value;
        toBeRemoved[key] = ssrMetaElements.current[key];
      }
    } else {
      if (
        Object.entries(value!).some(([innerKey, innerValue]) => {
          return (
            // @ts-ignore
            innerValue !== ssrMetaElements.current[key][innerKey]
          );
        })
      ) {
        toBeAdded[key] = value;
        toBeRemoved[key] = ssrMetaElements.current[key];
      }
    }
  });

  // checks if any meta from SSR are not present anymore in the currentElements
  Object.entries(ssrMetaElements.current).forEach(([key, value]) => {
    if (!currentElements[key]) {
      toBeRemoved[key] = value;
    }
  });

  return {
    toBeAdded,
    toBeRemoved,
    onDOMClear: onDOMClear,
  };
};
