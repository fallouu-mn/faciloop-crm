import { useEffect, useState, useCallback, useRef } from 'react';

const UPDATE_CHECK_INTERVAL = 15 * 60 * 1000;
const AUTO_RELOAD_DELAY = 30;

interface PwaUpdateState {
  updateAvailable: boolean;
  countdown: number | null;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function usePwaUpdate(): PwaUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const waitingSwRef = useRef<ServiceWorker | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissedRef = useRef(false);

  const applyUpdate = useCallback(() => {
    const waitingSw = waitingSwRef.current;
    if (waitingSw) {
      waitingSw.postMessage({ type: 'SKIP_WAITING' });
    }
    setTimeout(() => window.location.reload(), 300);
  }, []);

  const dismissUpdate = useCallback(() => {
    dismissedRef.current = true;
    setUpdateAvailable(false);
    setCountdown(null);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current) return;
    setCountdown(AUTO_RELOAD_DELAY);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          const waitingSw = waitingSwRef.current;
          if (waitingSw) {
            waitingSw.postMessage({ type: 'SKIP_WAITING' });
          }
          setTimeout(() => window.location.reload(), 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const onUpdateFound = useCallback((waitingSw: ServiceWorker) => {
    waitingSwRef.current = waitingSw;
    if (!dismissedRef.current) {
      setUpdateAvailable(true);
      startCountdown();
    }
  }, [startCountdown]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let isMounted = true;

    const registerAndWatch = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;

        if (registration.waiting) {
          if (isMounted) onUpdateFound(registration.waiting);
          return;
        }

        if (registration.installing) {
          trackInstalling(registration.installing);
        }

        registration.addEventListener('updatefound', () => {
          const newSw = registration.installing;
          if (newSw) trackInstalling(newSw);
        });

        updateCheckIntervalRef.current = setInterval(() => {
          registration.update().catch(() => {});
        }, UPDATE_CHECK_INTERVAL);

      } catch (err) {
        console.warn('[PWA Update] Erreur:', err);
      }
    };

    const trackInstalling = (sw: ServiceWorker) => {
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          if (isMounted) onUpdateFound(sw);
        }
      });
    };

    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    registerAndWatch();

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      if (updateCheckIntervalRef.current) clearInterval(updateCheckIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [onUpdateFound]);

  return { updateAvailable, countdown, applyUpdate, dismissUpdate };
}
