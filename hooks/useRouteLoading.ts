/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as React from "react";

export function useRouteLoading() {
  const delayTime = 50;
  const [isLoading, setIsLoading] = React.useState(false);
  const loadingRef = React.useRef(false);
  const timeoutRef = React.useRef<number | null>(null);

  const toAbsoluteURL = (url: string): string => {
    return new URL(url, window.location.href).href;
  };

  const isHashAnchor = (currentUrl: string, newUrl: string): boolean => {
    const current = new URL(toAbsoluteURL(currentUrl));
    const next = new URL(toAbsoluteURL(newUrl));
    return current.href.split("#")[0] === next.href.split("#")[0];
  };

  const isSameHostName = (currentUrl: string, newUrl: string): boolean => {
    const current = new URL(toAbsoluteURL(currentUrl));
    const next = new URL(toAbsoluteURL(newUrl));
    return current.hostname.replace(/^www\./, "") === next.hostname.replace(/^www\./, "");
  };

  React.useEffect(() => {
    let isMounted = true;

    const handleClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const anchor = findClosestAnchor(target);
        const newUrl = anchor?.href;

        if (newUrl && isMounted) {
          const currentUrl = window.location.href;
          const isExternalLink = anchor.target !== "";
          const isSpecialScheme = ["tel:", "mailto:", "sms:", "blob:", "download:"].some((scheme) => newUrl.startsWith(scheme));
          const isHashLink = isHashAnchor(currentUrl, newUrl);
          const notSameHost = !isSameHostName(currentUrl, newUrl);

          if (!isExternalLink && !isSpecialScheme && !isHashLink && !notSameHost && newUrl !== currentUrl && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && toAbsoluteURL(newUrl).startsWith("http")) {
            loadingRef.current = true;

            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            // Set timeout to update isLoading after 300ms
            timeoutRef.current = window.setTimeout(() => {
              if (isMounted && loadingRef.current) {
                setIsLoading(true);
              }
            }, delayTime);
          }
        }
      } catch (err) {
        if (isMounted) {
          loadingRef.current = false;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setIsLoading(false);
        }
      }
    };

    const findClosestAnchor = (element: HTMLElement | null): HTMLAnchorElement | null => {
      while (element && element.tagName.toLowerCase() !== "a") {
        element = element.parentElement;
      }
      return element as HTMLAnchorElement;
    };

    const handlePopState = () => {
      if (isMounted) {
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsLoading(false);
      }
    };

    const handlePageHide = () => {
      if (isMounted) {
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsLoading(false);
      }
    };

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      if (isMounted) {
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsLoading(false);
      }
      return originalPushState.apply(window.history, args);
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      if (isMounted) {
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsLoading(false);
      }
      return originalReplaceState.apply(window.history, args);
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pagehide", handlePageHide);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []); // Removed isLoading from dependencies since we're handling it manually

  return { isLoading };
}
