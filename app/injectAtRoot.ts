"use client";
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(console.error);
}
