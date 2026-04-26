import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GiftService } from '../../../services/gift.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-edit-gift',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-gift.html',
  styleUrls: ['./edit-gift.css'],
})
export class EditGift implements OnInit {
  giftForm: FormGroup;
  loading = false;
  giftId: string | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private giftService: GiftService,
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.giftForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      is_active: ['1', Validators.required],
    });
  }

  ngOnInit(): void {
    this.giftId = this.route.snapshot.paramMap.get('id');
    if (this.giftId) {
      this.loadGift();
    }
  }

  loadGift() {
    this.loading = true;
    this.giftService.getGift(this.giftId!).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0' && res.data) {
          const gift = res.data;
          this.giftForm.patchValue({
            name: gift.name,
            price: gift.price,
            is_active: gift.is_active ? '1' : '0',
          });
          this.imagePreview = gift.image || gift.icon;
        } else {
          this.notification.error(res.message || 'Gift not found');
          this.router.navigate(['/gifts']);
        }
        this.loading = false;
      },
      error: () => {
        this.notification.error('Error loading gift data');
        this.router.navigate(['/gifts']);
        this.loading = false;
      }
    });
  }

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
    formData.append('_method', 'PUT'); // Some APIs require _method for multipart PUT
    
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.loading = true;
    this.giftService.updateGift(this.giftId!, formData).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0') {
          this.notification.success('Gift updated successfully');
          this.router.navigate(['/gifts']);
        } else {
          this.notification.error(res.message || 'Failed to update gift');
        }
        this.loading = false;
      },
      error: (err) => {
        this.notification.error('Error updating gift');
        this.loading = false;
      }
    });
  }
}
