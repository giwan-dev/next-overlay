import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/router";

export function useOverlay() {
  const { events, push, back } = useRouter();
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const raise = useCallback(() => {
    if (initialized === false) {
      return;
    }
    setVisible(true);
  }, [initialized]);

  const dismiss = useCallback(() => {
    if (initialized === false) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const removeListener = () => {
        events.off("hashChangeComplete", removeListener);

        resolve();
      };
      events.on("hashChangeComplete", removeListener);

      setVisible(false);
    });
  }, [events, initialized]);

  useEffect(() => {
    const initialHash = window.location.hash.replace("#", "");

    if (initialHash === id) {
      setVisible(true);
    } else {
      setVisible(false);
    }

    setInitialized(true);
  }, [id]);

  useEffect(() => {
    if (initialized === false) {
      return;
    }

    const currentHash = window.location.hash.replace("#", "");

    if (visible === true && currentHash !== id) {
      push(`#${id}`);
    }
    if (visible === false && currentHash === id) {
      back();
    }
    // push, back is newly defined in every render
  }, [id, initialized, visible]);

  useEffect(() => {
    const syncVisibleWithHash = (url: string) => {
      const [, currentHash] = url.split("#");

      if (visible === true && currentHash !== id) {
        setVisible(false);
      }
      if (visible === false && currentHash === id) {
        setVisible(true);
      }
    };

    if (initialized === true) {
      events.on("routeChangeComplete", syncVisibleWithHash);
      events.on("hashChangeComplete", syncVisibleWithHash);

      return () => {
        events.off("routeChangeComplete", syncVisibleWithHash);
        events.off("hashChangeComplete", syncVisibleWithHash);
      };
    }
  }, [events, id, initialized, visible]);

  useEffect(() => {
    if (visible) {
      const warnRouteChange = () => {
        console.warn(
          "Changing route should be done after overlay is closed. Since overlay uses history API, history can be corrupted by race condition."
        );
      };

      events.on("routeChangeStart", warnRouteChange);

      return () => {
        events.off("routeChangeStart", warnRouteChange);
      };
    }
  }, [events, visible]);

  return { visible, raise, dismiss };
}
