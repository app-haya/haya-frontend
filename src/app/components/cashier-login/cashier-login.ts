import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CashierService } from '../../services/cashier.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

declare var particlesJS: any;

@Component({
  selector: 'app-cashier-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './cashier-login.html',
  styleUrls: ['./cashier-login.css']
})
export class CashierLogin implements OnInit, OnDestroy, AfterViewInit {
  form = { identifier: '', password: '' };
  submitting = false;
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(
    private cashierService: CashierService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    if (localStorage.getItem('cashier_token')) {
      this.router.navigate(['/cashier/dashboard']);
    }
  }

  ngAfterViewInit() {
    this.initParticles();
  }

  ngOnDestroy() {
    const pJS = (window as any).pJSDom;
    if (pJS && pJS.length > 0) {
      pJS[0].pJS.fn.vendors.destroypJS();
      (window as any).pJSDom = [];
    }
  }

  private initParticles() {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        "particles": {
          "number": {
            "value": 110,
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": {
            "value": "#7a3ca0"
          },
          "shape": {
            "type": "circle",
            "stroke": {
              "width": 0,
              "color": "#000000"
            }
          },
          "opacity": {
            "value": 0.8,
            "random": false,
            "anim": {
              "enable": false,
              "speed": 1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 4.5,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 40,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#7a3ca0",
            "opacity": 0.6,
            "width": 1
          },
          "move": {
            "enable": true,
            "speed": 5,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
              "enable": false,
              "rotateX": 600,
              "rotateY": 1200
            }
          }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": {
              "enable": true,
              "mode": "grab"
            },
            "onclick": {
              "enable": true,
              "mode": "push"
            },
            "resize": true
          },
          "modes": {
            "grab": {
              "distance": 140,
              "line_linked": {
                "opacity": 1
              }
            },
            "bubble": {
              "distance": 400,
              "size": 40,
              "duration": 2,
              "opacity": 8,
              "speed": 3
            },
            "repulse": {
              "distance": 200,
              "duration": 0.4
            },
            "push": {
              "particles_nb": 4
            },
            "remove": {
              "particles_nb": 2
            }
          }
        },
        "retina_detect": true
      });
    }
  }

  onSubmit() {
    if (!this.form.identifier.trim() || !this.form.password.trim()) {
      return;
    }

    this.submitting = true;
    const body: any = { password: this.form.password };
    const ident = this.form.identifier.trim();
    if (ident.includes('@')) {
      body.email = ident;
    } else {
      body.phone = ident;
    }

    this.cashierService.login(body).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.data?.token) {
          localStorage.setItem('cashier_token', res.data.token);
          localStorage.setItem('cashier_user', JSON.stringify(res.data.cashier));
          this.notificationService.success(res.message || 'Login successful!');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cashier/dashboard';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err: any) => {
        this.submitting = false;
        if (err.error?.message) {
          this.notificationService.error(err.error.message);
        } else {
          this.notificationService.error('Login failed!');
        }
      }
    });
  }
}
