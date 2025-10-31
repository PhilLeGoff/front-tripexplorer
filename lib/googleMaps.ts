declare global {
  interface Window {
    __gmapsLoader?: Promise<void>
  }
}

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  // If already loaded, resolve immediately
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve()
  }
  // Singleton loader promise
  if (window.__gmapsLoader) return window.__gmapsLoader

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  window.__gmapsLoader = new Promise<void>((resolve, reject) => {
    const scriptId = 'google-maps-js'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null
    const onReady = () => resolve()

    if (existingScript) {
      if ((window as any).google && (window as any).google.maps) return onReady()
      existingScript.addEventListener('load', onReady)
      existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load')))
      return
    }

    if (!key) {
      // Resolve to avoid blocking UI; consumers can handle missing API
      resolve()
      return
    }

    const script = document.createElement('script') as HTMLScriptElement
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = onReady
    script.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.appendChild(script)
  })

  return window.__gmapsLoader
}


