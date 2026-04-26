import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GiftService } from '../../../services/gift.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-add-gift',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './add-gift.html',
  styleUrls: ['./add-gift.css'],
})
export class AddGift implements OnInit {
  giftForm: FormGroup;
  loading = false;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private giftService: GiftService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.giftForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      is_active: ['1', Validators.required],
    });
  }

  ngOnInit(): void {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.giftForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.giftForm.value.name);
    formData.append('price', this.giftForm.value.price);
    formData.append('is_active', this.giftForm.value.is_active);
    
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.loading = true;
    this.giftService.createGift(formData).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0') {
          this.notification.success('Gift created successfully');
          this.router.navigate(['/gifts']);
        } else {
          this.notification.error(res.message || 'Failed to create gift');
        }
        this.loading = false;
      },
      error: (err) => {
        this.notification.error('Error creating gift');
        this.loading = false;
      }
    });
  }
}
