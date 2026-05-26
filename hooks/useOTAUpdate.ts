import * as Updates from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';

import { createLogger } from '@/lib/logger';

const log = createLogger('OTA');

type Status = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

interface OTAState {
  status: Status;
  /** Set once the new bundle is downloaded and ready to apply. */
  ready: boolean;
  /** Apply the downloaded update by reloading the JS context. */
  apply: () => Promise<void>;
  /** Dismiss the prompt without applying. Update still applies on next launch. */
  dismiss: () => void;
}

/**
 * Drives the EAS Update lifecycle on launch (production builds only) and
 * exposes a `ready` flag for surfaced UI.
 *
 * Behaviour:
 *   1. On mount, checks the configured update URL for a newer bundle.
 *   2. If available, downloads it in the background.
 *   3. Once downloaded, flips `ready` to true so the caller can prompt.
 *   4. `apply()` reloads to the new bundle now. Doing nothing also works —
 *      the bundle will be picked up on the next cold start.
 */
export function useOTAUpdate(): OTAState {
  const [status, setStatus] = useState<Status>('idle');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // In dev the runtime is Metro, not the embedded bundle — checking would
    // either no-op or crash depending on the SDK.
    if (__DEV__) return;
    // The runtime may also be disabled (e.g. when expo-updates is missing
    // from the build); checkForUpdateAsync throws in that case.
    if (!Updates.isEnabled) return;

    let cancelled = false;

    (async () => {
      try {
        setStatus('checking');
        const check = await Updates.checkForUpdateAsync();
        if (cancelled) return;
        if (!check.isAvailable) {
          setStatus('idle');
          return;
        }
        setStatus('downloading');
        const fetch = await Updates.fetchUpdateAsync();
        if (cancelled) return;
        setStatus(fetch.isNew ? 'ready' : 'idle');
      } catch (err) {
        if (cancelled) return;
        log.warn('OTA check failed', err);
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const apply = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (err) {
      log.error('Failed to apply update', err);
    }
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

  return {
    status,
    ready: status === 'ready' && !dismissed,
    apply,
    dismiss,
  };
}
