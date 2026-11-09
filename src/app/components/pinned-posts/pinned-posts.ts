import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PinnedPostsService } from '../../services/pinned-posts.service';
import { environment } from '../../../environments/environment';

interface DurationOption {
  label: string;
  hours: number | null;
}

@Component({
  selector: 'app-pinned-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './pinned-posts.html',
  styleUrls: ['./pinned-posts.css']
})
export class PinnedPosts implements OnInit, OnDestroy {
  pinned: any = null;
  pinnedLoading: boolean = false;
  remaining: string = '';

  posts: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  currentPage: number = 1;
  lastPage: number = 1;
  total: number = 0;
  perPage: number = 20;

  // Pin modal
  showPinModal: boolean = false;
  selectedPost: any = null;
  durationOptions: DurationOption[] = [
    { label: '1 hour', hours: 1 },
    { label: '6 hours', hours: 6 },
    { label: '1 day', hours: 24 },
    { label: '3 days', hours: 72 },
    { label: '1 week', hours: 168 },
    { label: 'Until unpinned', hours: null }
  ];
  selectedDuration: number | null = 24;
  modalLoading: boolean = false;

  // Unpin confirm
  showUnpinModal: boolean = false;

  // Toast
  toastMessage: string = '';
  toastType: 'success' | 'danger' = 'success';
  private toastTimeout: any = null;
  private searchTimer: any = null;
  private clock: any = null;

  constructor(
    private pinnedPostsService: PinnedPostsService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPinned();
    this.loadPosts(1);
    this.clock = setInterval(() => this.updateRemaining(), 30000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    clearTimeout(this.toastTimeout);
    clearInterval(this.clock);
  }

  // --- CURRENT PIN ---
  loadPinned(): void {
    this.pinnedLoading = true;
    this.pinnedPostsService.getPinned().subscribe({
      next: (res: any) => {
        this.pinnedLoading = false;
        this.pinned = this.isOk(res) ? res.data : null;
        this.updateRemaining();
      },
      error: () => {
        this.pinnedLoading = false;
        this.pinned = null;
      }
    });
  }

  updateRemaining(): void {
    if (!this.pinned?.admin_pinned_until) {
      this.remaining = '';
      return;
    }

    const ms = new Date(this.pinned.admin_pinned_until).getTime() - Date.now();
    if (ms <= 0) {
      this.pinned = null;
      this.remaining = '';
      this.loadPosts(this.currentPage);
      return;
    }

    const minutes = Math.floor(ms / 60000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    const t = (key: string) => this.translate.instant(key);

    if (days > 0) {
      this.remaining = `${days} ${t('days')} ${hours} ${t('hours')}`;
    } else if (hours > 0) {
      this.remaining = `${hours} ${t('hours')} ${mins} ${t('minutes')}`;
    } else {
      this.remaining = `${Math.max(1, mins)} ${t('minutes')}`;
    }
  }

  // --- POSTS ---
  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadPosts(1), 400);
  }

  loadPosts(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.pinnedPostsService.getPosts(this.searchTerm, page, this.perPage).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.posts = this.isOk(res) && Array.isArray(res.data) ? res.data : [];
        this.currentPage = res?.meta?.page || page;
        this.lastPage = res?.meta?.total_pages || 1;
        this.total = res?.meta?.total ?? this.posts.length;
      },
      error: (err) => {
        this.loading = false;
        this.posts = [];
        this.total = 0;
        this.showToast(err?.error?.message || this.translate.instant('Failed to load posts'), 'danger');
      }
    });
  }

  getPageNumbers(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.lastPage, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // --- PIN ---
  openPinModal(post: any): void {
    this.selectedPost = post;
    this.selectedDuration = 24;
    this.showPinModal = true;
  }

  closePinModal(): void {
    this.showPinModal = false;
    this.selectedPost = null;
  }

  confirmPin(): void {
    if (!this.selectedPost) return;
    this.modalLoading = true;

    this.pinnedPostsService.pin(this.selectedPost.id, this.selectedDuration).subscribe({
      next: (res: any) => {
        this.modalLoading = false;
        if (this.isOk(res)) {
          this.pinned = res.data;
          this.updateRemaining();
          this.closePinModal();
          this.showToast(this.translate.instant('Post pinned successfully'), 'success');
          this.loadPosts(this.currentPage);
        } else {
          this.showToast(res?.message || this.translate.instant('Failed to pin the post'), 'danger');
        }
      },
      error: (err) => {
        this.modalLoading = false;
        this.showToast(err?.error?.message || this.translate.instant('Failed to pin the post'), 'danger');
      }
    });
  }

  // --- UNPIN ---
  confirmUnpin(): void {
    if (!this.pinned) return;
    this.modalLoading = true;

    this.pinnedPostsService.unpin(this.pinned.id).subscribe({
      next: () => {
        this.modalLoading = false;
        this.showUnpinModal = false;
        this.pinned = null;
        this.remaining = '';
        this.showToast(this.translate.instant('Post unpinned successfully'), 'success');
        this.loadPosts(this.currentPage);
      },
      error: (err) => {
        this.modalLoading = false;
        this.showToast(err?.error?.message || this.translate.instant('Failed to unpin the post'), 'danger');
      }
    });
  }

  postLink(post: any): string {
    return post?.uuid ? `${environment.apiUrl.replace(/\/api$/, '')}/post/${post.uuid}` : '';
  }

  private showToast(message: string, type: 'success' | 'danger'): void {
    this.toastMessage = message;
    this.toastType = type;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => (this.toastMessage = ''), 3500);
  }

  private isOk(res: any): boolean {
    return !!res && (res.errorcode === '0' || res.errorcode === 0);
  }
}
