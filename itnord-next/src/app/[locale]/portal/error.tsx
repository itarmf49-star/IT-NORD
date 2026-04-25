"use client";

import { useEffect } from "react";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="portal-error">
      <p className="muted">Something went wrong in the portal.</p>
      <button type="button" className="btn btn-primary btn-md" onClick={() => reset()}>
        Retry
      </button>
    </div>
  );
}

