function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

/** Origin for shareable app URLs (payment links, etc.). Uses the live host in prod; optional override on localhost. */
export function getPublicAppOrigin(): string {
  const { origin, hostname } = window.location

  if (!isLocalHostname(hostname)) {
    return origin
  }

  const configured = import.meta.env.VITE_PUBLIC_APP_ORIGIN?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  return origin
}
