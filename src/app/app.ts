import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule,NotificationComponent],
  templateUrl: './app.html',
})
export class App {
  sidebarCollapsed = false;

  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('en');

    const savedLang = localStorage.getItem('lang');
    const currentLang = savedLang ? savedLang : 'en';

    translate.use(currentLang);
    document.body.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  }
}
