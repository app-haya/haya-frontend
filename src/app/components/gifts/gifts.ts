import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GiftService } from '../../services/gift.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-gifts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './gifts.html',
  styleUrls: ['./gifts.css'],
})
export class Gifts implements OnInit {
  gifts: any[] = [];
  searchTerm = '';
  loading = true;
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  // Modal logic
  showModal = false;
  modalTitle = 'Add Gift';
  isEditing = false;
  giftForm: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  submitting = false;
  currentGiftId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private giftService: GiftService,
    private notification: NotificationService,
    private dialogService: DialogService
  ) {
    this.giftForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      is_active: ['1', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchGifts();
  }

  fetchGifts(page: number = 1) {
    this.loading = true;
    const params = {
      page,
      search: this.searchTerm,
      per_page: this.perPage
    };

    this.giftService.getGifts(params).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0' && res.data) {
          this.gifts = res.data.data || [];
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
          this.total = res.data.total;
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  search() {
    this.currentPage = 1;
    this.fetchGifts();
  }

  // Modal Methods
  openAddModal() {
    this.isEditing = false;
    this.modalTitle = 'Add Gift';
    this.giftForm.reset({ is_active: '1' });
    this.imagePreview = null;
    this.imageFile = null;
    this.currentGiftId = null;
    this.showModal = true;
  }

  openEditModal(gift: any) {
    this.isEditing = true;
    this.modalTitle = 'Edit Gift';
    this.currentGiftId = gift.id;
    this.giftForm.patchValue({
      name: gift.name,
      description: gift.description || '',
      price: gift.price,
      is_active: gift.is_active ? '1' : '0',
    });
    this.imagePreview = this.getImageUrl(gift);
    this.imageFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
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

  saveGift() {
    if (this.giftForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.giftForm.value.name);
    formData.append('description', this.giftForm.value.description);
    formData.append('price', this.giftForm.value.price);
    formData.append('is_active', this.giftForm.value.is_active);
    
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.submitting = true;
    if (this.isEditing && this.currentGiftId) {
      formData.append('_method', 'PUT');
      this.giftService.updateGift(this.currentGiftId, formData).subscribe({
        next: (res: any) => {
          if (res.errorcode === '0') {
            this.notification.success('Gift updated successfully');
            this.closeModal();
            this.fetchGifts(this.currentPage);
          } else {
            this.notification.error(res.message || 'Failed to update gift');
          }
          this.submitting = false;
        },
        error: () => {
          this.notification.error('Error updating gift');
          this.submitting = false;
        }
      });
    } else {
      this.giftService.createGift(formData).subscribe({
        next: (res: any) => {
          if (res.errorcode === '0') {
            this.notification.success('Gift created successfully');
            this.closeModal();
            this.fetchGifts(1);
          } else {
            this.notification.error(res.message || 'Failed to create gift');
          }
          this.submitting = false;
        },
        error: () => {
          this.notification.error('Error creating gift');
          this.submitting = false;
        }
      });
    }
  }

  toggleActive(gift: any) {
    this.giftService.toggleActive(gift.id).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0') {
          gift.is_active = !gift.is_active;
          this.notification.success(res.message || 'Status updated');
        }
      },
    });
  }

  deleteGift(id: number) {
    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this gift?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        this.giftService.deleteGift(id).subscribe({
          next: (res: any) => {
            if (res.errorcode === '0') {
              this.notification.success('Gift deleted successfully!');
              this.fetchGifts(this.currentPage);
            }
          },
        });
      }
    });
  }

  getImageUrl(gift: any): string {
    const path = gift.image || gift.icon || gift.image_url || gift.icon_url;
    if (!path) return 'assets/images/placeholder.png';
    if (path.startsWith('http')) return path;
    
    // Removing leading slash if exists
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Based on the server structure screenshot: storage/app/public/gifts/
    return `https://hayaapp.online/storage/gifts/${cleanPath}`;
  }

  // Pagination
  goToPage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.fetchGifts(page);
  }

  nextPage() {
    if (this.currentPage < this.lastPage) this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const max = 5;
    if (this.lastPage <= max) {
      for (let i = 1; i <= this.lastPage; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.lastPage, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }
}
