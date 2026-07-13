import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withAnchorScrolling, withScrollPositionRestoration } from '@angular/router';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { routes } from './app.routes';
import { MyTranslateLoader } from './loaders/my-translate-loader';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withAnchorScrolling(), withScrollPositionRestoration('enabled')),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: MyTranslateLoader,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      })
    ),
    provideCharts(withDefaultRegisterables()),
  ]
};