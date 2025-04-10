/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";

export function useRouteLoading() {
  const delayTime = 50;
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    let isMounted = true;

    const findClosestAnchor = (element: HTMLElement | null): HTMLAnchorElement | null => {
      while (element && element.tagName.toLowerCase() !== "a") {
        element = element.parentElement;
      }
      return element as HTMLAnchorElement;
    };

    const resetLoading = () => {
      if (isMounted) {
        loadingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        // Use requestAnimationFrame to ensure this happens outside of React's rendering cycle
        requestAnimationFrame(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
      }
    };

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

            // Set timeout to update isLoading after delayTime ms
            timeoutRef.current = window.setTimeout(() => {
              if (isMounted && loadingRef.current) {
                requestAnimationFrame(() => {
                  if (isMounted && loadingRef.current) {
                    setIsLoading(true);
                  }
                });
              }
            }, delayTime);
          }
        }
      } catch (err) {
        resetLoading();
      }
    };

    const handlePopState = () => {
      resetLoading();
    };

    const handlePageHide = () => {
      resetLoading();
    };

    // Store original history methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Override history methods safely
    window.history.pushState = function (...args) {
      const result = originalPushState.apply(window.history, args);
      // Use setTimeout to ensure this runs after current execution context
      setTimeout(() => resetLoading(), 0);
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(window.history, args);
      // Use setTimeout to ensure this runs after current execution context
      setTimeout(() => resetLoading(), 0);
      return result;
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
  }, []);

  return { isLoading };
}
