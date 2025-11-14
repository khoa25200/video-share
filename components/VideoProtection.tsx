"use client";

import { useEffect } from "react";

export default function VideoProtection() {
  useEffect(() => {
    // Disable right-click globally on video pages
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow context menu on input fields and textareas
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts globally
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common download/inspect shortcuts
      if (
        (e.ctrlKey && e.key === "s") || // Save page
        (e.ctrlKey && e.key === "u") || // View source
        (e.ctrlKey && e.shiftKey && e.key === "I") || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === "J") || // DevTools Console
        (e.ctrlKey && e.shiftKey && e.key === "C") || // DevTools Inspector
        (e.ctrlKey && e.shiftKey && e.key === "K") || // DevTools Console (Firefox)
        e.key === "F12" || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === "P") // Command Palette
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable text selection on video elements
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "VIDEO" || (target as Element).closest?.("video")) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "VIDEO" || (target as Element).closest?.("video")) {
        e.preventDefault();
        return false;
      }
    };

    // Detect and block developer tools
    let devtools = { open: false, orientation: null };
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          // Redirect or show warning
          console.clear();
          console.log(
            "%cStop!",
            "color: red; font-size: 50px; font-weight: bold;"
          );
          console.log(
            "%cDeveloper tools are disabled on this page.",
            "color: red; font-size: 20px;"
          );
        }
      } else {
        devtools.open = false;
      }
    };

    // Monitor for dev tools
    const devToolsInterval = setInterval(detectDevTools, 500);

    // Block console access
    const noop = () => {};
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    // Override console methods
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);

    // Disable print screen (limited effectiveness)
    document.addEventListener("keyup", (e) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
      }
    });

    // Add CSS to prevent text selection on video containers
    const style = document.createElement("style");
    style.textContent = `
      video {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      [data-video-section] {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
      clearInterval(devToolsInterval);
      document.head.removeChild(style);
      // Restore console
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    };
  }, []);

  return null;
}
