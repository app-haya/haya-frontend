import { environment } from '../../environments/environment';

/**
 * Returns the base domain for the current environment without trailing slashes.
 * e.g., 'https://api.hayaapp.sa' or 'https://hayaapp.online'
 */
export function getBaseDomain(): string {
  if (environment.apiUrl) {
    return environment.apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
  return 'https://api.hayaapp.sa';
}

/**
 * Returns the base storage URL for the current environment without trailing slashes.
 * e.g., 'https://api.hayaapp.sa/storage' or 'https://hayaapp.online/storage'
 */
export function getBaseStorageUrl(): string {
  if ((environment as any).storageUrl) {
    return (environment as any).storageUrl.replace(/\/$/, '');
  }
  return `${getBaseDomain()}/storage`;
}

/**
 * Universal image/file URL formatter.
 * Supports both servers (New: api.hayaapp.sa, Old: hayaapp.online).
 * Resolves relative paths, strips unwanted port :443, and routes to the active server storage.
 */
export function formatImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  let clean = String(url).trim();
  if (!clean) return '';

  // Data URLs or Blob URLs
  if (clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  // Local assets
  if (clean.startsWith('assets/') || clean.startsWith('/assets/')) {
    return clean;
  }

  const baseDomain = getBaseDomain();
  const baseStorage = getBaseStorageUrl();
  const isSaServer = (environment as any).serverName === 'sa' || !(environment as any).serverName || (environment as any).serverName === 'dev';

  // If it's an absolute URL
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const isHayaUrl =
      clean.includes('hayaapp.sa') ||
      clean.includes('hayaapp.online') ||
      clean.includes('localhost') ||
      clean.includes('127.0.0.1');

    if (!isHayaUrl) {
      // External third-party URL (e.g., Google, Flaticon, etc.)
      return clean;
    }

    // Force https
    clean = clean.replace(/^http:\/\//i, 'https://');

    // Clean port 443 variants (e.g. hayaapp.sa:443, api.hayaapp.sa:443)
    clean = clean.replace(/hayaapp\.sa:443/gi, 'hayaapp.sa');
    clean = clean.replace(/api\.hayaapp\.sa:443/gi, 'api.hayaapp.sa');

    // Route to the appropriate server based on current build environment
    if (isSaServer) {
      // On New Server ('sa' or dev): map legacy domains to api.hayaapp.sa
      clean = clean.replace(/https?:\/\/hayaapp\.online/gi, baseDomain);
      clean = clean.replace(/https?:\/\/hayaapp\.sa/gi, baseDomain);
    } else {
      // On Old Server ('online'): map sa domains to hayaapp.online
      clean = clean.replace(/https?:\/\/api\.hayaapp\.sa/gi, baseDomain);
      clean = clean.replace(/https?:\/\/hayaapp\.sa/gi, baseDomain);
    }

    // Clean unintended /api/ before /storage/ or /uploads/
    clean = clean.replace(/\/api\/storage\//g, '/storage/');
    clean = clean.replace(/\/api\/uploads\//g, '/uploads/');

    return clean;
  }

  // Handle relative paths
  if (clean.startsWith('/')) {
    clean = clean.substring(1);
  }

  if (clean.startsWith('storage/')) {
    return `${baseDomain}/${clean}`;
  }

  if (clean.startsWith('admin_images/')) {
    return `${baseDomain}/${clean}`;
  }

  return `${baseStorage}/${clean}`;
}

/**
 * Checks whether a given URL or file path points to a PDF.
 */
export function isPdf(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = String(url).toLowerCase().split('?')[0].split('#')[0];
  return clean.endsWith('.pdf');
}
