/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import * as React from "react";

export function useRouteLoading() {
  const [isLoading, setIsLoading] = React.useState(false);
  const loadingRef = React.useRef(false);

  /**
   * Convert URL to absolute URL based on current window location
   */
  const toAbsoluteURL = (url: string): string => {
    return new URL(url, window.location.href).href;
  };

  /**
   * Check if it's a hash anchor link
   */
  const isHashAnchor = (currentUrl: string, newUrl: string): boolean => {
    const current = new URL(toAbsoluteURL(currentUrl));
    const next = new URL(toAbsoluteURL(newUrl));
    return current.href.split("#")[0] === next.href.split("#")[0];
  };

  /**
   * Check if it's the same hostname
   */
  const isSameHostName = (currentUrl: string, newUrl: string): boolean => {
    const current = new URL(toAbsoluteURL(currentUrl));
    const next = new URL(toAbsoluteURL(newUrl));
    return current.hostname.replace(/^www\./, "") === next.hostname.replace(/^www\./, "");
  };

  React.useEffect(() => {
    let isMounted = true;

    /**
     * Handle click events to detect navigation
     */
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
            setIsLoading(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    };

    /**
     * Find the closest anchor element
     */
    const findClosestAnchor = (element: HTMLElement | null): HTMLAnchorElement | null => {
      while (element && element.tagName.toLowerCase() !== "a") {
        element = element.parentElement;
      }
      return element as HTMLAnchorElement;
    };

    /**
     * Handle history changes
     */
    const handlePopState = () => {
      if (isMounted) {
        loadingRef.current = false;
        setIsLoading(false);
      }
    };

    /**
     * Handle page hide (e.g., tab switch)
     */
    const handlePageHide = () => {
      if (isMounted) {
        loadingRef.current = false;
        setIsLoading(false);
      }
    };

    // Modify history methods without scheduling updates
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      if (isMounted) {
        loadingRef.current = false;
        // Avoid setIsLoading here to prevent scheduling updates
      }
      return originalPushState.apply(window.history, args);
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      if (isMounted) {
        loadingRef.current = false;
        // Avoid setIsLoading here to prevent scheduling updates
      }
      return originalReplaceState.apply(window.history, args);
    };

    // Add event listeners
    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pagehide", handlePageHide);

    // Sync ref with state periodically or on specific events
    const syncLoadingState = () => {
      if (isMounted && loadingRef.current !== isLoading) {
        setIsLoading(loadingRef.current);
      }
    };

    // Use a minimal effect to sync state
    const intervalId = setInterval(syncLoadingState, 100); // Adjust timing as needed

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pagehide", handlePageHide);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [isLoading]); // Include isLoading in deps to ensure sync

  return { isLoading };
}
