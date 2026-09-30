import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Recursively normalizes URL strings in API response bodies so images and links
 * point to the active server's storage without broken ports or domain mismatches.
 */
function sanitizeUrlsInObject(data: any, isSaServer: boolean): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    if (
      data.includes('hayaapp.sa') ||
      data.includes('hayaapp.online') ||
      data.includes(':443')
    ) {
      let str = data;
      // Remove unwanted port 443
      str = str.replace(/hayaapp\.sa:443/gi, 'hayaapp.sa');
      str = str.replace(/api\.hayaapp\.sa:443/gi, 'api.hayaapp.sa');

      if (isSaServer) {
        // Map old server URLs to new server
        str = str.replace(/https?:\/\/hayaapp\.sa\/storage\//gi, 'https://api.hayaapp.sa/storage/');
        str = str.replace(/https?:\/\/hayaapp\.online\/storage\//gi, 'https://api.hayaapp.sa/storage/');
        str = str.replace(/http:\/\/api\.hayaapp\.sa\/storage\//gi, 'https://api.hayaapp.sa/storage/');
        str = str.replace(/https?:\/\/hayaapp\.sa\//gi, 'https://api.hayaapp.sa/');
      } else {
        // Map sa URLs to online server
        str = str.replace(/https?:\/\/api\.hayaapp\.sa\/storage\//gi, 'https://hayaapp.online/storage/');
        str = str.replace(/https?:\/\/hayaapp\.sa\/storage\//gi, 'https://hayaapp.online/storage/');
        str = str.replace(/http:\/\/hayaapp\.online\/storage\//gi, 'https://hayaapp.online/storage/');
        str = str.replace(/https?:\/\/api\.hayaapp\.sa\//gi, 'https://hayaapp.online/');
        str = str.replace(/https?:\/\/hayaapp\.sa\//gi, 'https://hayaapp.online/');
      }

      str = str.replace(/\/api\/storage\//g, '/storage/');
      str = str.replace(/\/api\/uploads\//g, '/uploads/');
      return str;
    }
    return data;
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = sanitizeUrlsInObject(data[i], isSaServer);
    }
    return data;
  }

  if (typeof data === 'object') {
    if (data instanceof Blob || data instanceof FormData) {
      return data;
    }
    for (const key of Object.keys(data)) {
      data[key] = sanitizeUrlsInObject(data[key], isSaServer);
    }
    return data;
  }

  return data;
}

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  let modifiedReq = req;
  const isSaServer = (environment as any).serverName === 'sa' || !(environment as any).serverName || (environment as any).serverName === 'dev';
  const targetApiBase = environment.apiUrl.replace(/\/+$/, '');

  // Normalize outgoing request URL if it carries legacy host artifacts or port 443
  if (req.url.includes(':443') || req.url.includes('/api/')) {
    let cleanReqUrl = req.url
      .replace(/hayaapp\.sa:443/gi, 'hayaapp.sa')
      .replace(/api\.hayaapp\.sa:443/gi, 'api.hayaapp.sa');

    if (isSaServer && (cleanReqUrl.includes('hayaapp.online/api') || cleanReqUrl.includes('hayaapp.sa/api'))) {
      cleanReqUrl = cleanReqUrl
        .replace(/https?:\/\/hayaapp\.online\/api/g, targetApiBase)
        .replace(/https?:\/\/hayaapp\.sa\/api/g, targetApiBase);
    }

    if (cleanReqUrl !== req.url) {
      modifiedReq = req.clone({ url: cleanReqUrl });
    }
  }

  return next(modifiedReq).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body) {
        const sanitizedBody = sanitizeUrlsInObject(event.body, isSaServer);
        return event.clone({ body: sanitizedBody });
      }
      return event;
    })
  );
};
