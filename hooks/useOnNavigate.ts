/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
//useOnNavigate.ts
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

let clickTime = 0;
let pathWhenClicked = "";

export function useOnNavigate(): boolean {
  const curPath = usePathname();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    clickTime = 0;
    if (curPath !== pathWhenClicked) {
      setLoading(false);
    }
  }, [curPath]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const onMessage = ({ data }: MessageEvent) => {
      if (Date.now() - clickTime > 1000) return;

      const url = toURL(data.fetchUrl);
      if (url?.search.startsWith("?_rsc=") && data.dest === "") {
        clickTime = 0;
        setLoading(true);
      }
    };

    const sw = navigator.serviceWorker;
    sw?.addEventListener("message", onMessage);

    const onClick = () => {
      clickTime = Date.now();
      pathWhenClicked = location.pathname;
    };

    addEventListener("click", onClick, true);

    return () => {
      sw?.removeEventListener("message", onMessage);
      removeEventListener("click", onClick, true);
    };
  }, []);

  return loading;
}

function toURL(url: string): URL | null {
  try {
    if (url) return new URL(url);
  } catch (e: any) {}
  return null;
}
