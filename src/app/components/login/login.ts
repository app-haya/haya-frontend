import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

declare var particlesJS: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, OnDestroy, AfterViewInit {
  form = { email: '', password: '' };
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
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
    this.authService.login(this.form.email, this.form.password).subscribe({
      next: (res: any) => {
        if (res.data?.token) {
          localStorage.setItem('admin_token', res.data.token);
          localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
          this.notificationService.success('Login successful!');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboardcount';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err: any) => {
        if (err.error?.message) {
          this.notificationService.error(err.error.message);
        } else {
          this.notificationService.error('Login failed!');
        }
      }
    });
  }
}