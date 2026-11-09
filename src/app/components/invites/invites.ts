import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InvitesService } from '../../services/invites.service';

type Tab = 'inviters' | 'invites' | 'allowed';

@Component({
  selector: 'app-invites',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './invites.html',
  styleUrls: ['./invites.css']
})
export class Invites implements OnInit, OnDestroy {
  from: string = '';
  to: string = '';

  stats: any = null;
  statsLoading: boolean = false;
  maxDaily: number = 0;

  activeTab: Tab = 'inviters';
  rows: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  channel: string = '';
  currentPage: number = 1;
  lastPage: number = 1;
  perPage: number = 20;
  total: number = 0;
  errorMessage: string = '';

  // Inviter details modal
  showInviter: boolean = false;
  inviter: any = null;
  inviterLoading: boolean = false;
  inviterPage: number = 1;
  inviterLastPage: number = 1;
  copySuccess: boolean = false;

  // Who can invite
  candidateTerm: string = '';
  candidates: any[] = [];
  candidatesLoading: boolean = false;
  busyUserId: number | null = null;
  removeTarget: any = null;
  toastMessage: string = '';
  toastType: 'success' | 'danger' = 'success';
  private toastTimeout: any = null;
  private candidateTimer: any = null;

  private searchTimer: any = null;

  constructor(
    private invitesService: InvitesService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setThisMonth();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    clearTimeout(this.candidateTimer);
    clearTimeout(this.toastTimeout);
  }

  // --- DATE RANGE ---
  setThisMonth(): void {
    const today = new Date();
    this.from = this.format(new Date(today.getFullYear(), today.getMonth(), 1));
    this.to = this.format(today);
    this.reload();
  }

  setLastDays(days: number): void {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));
    this.from = this.format(start);
    this.to = this.format(today);
    this.reload();
  }

  onRangeChange(): void {
    if (this.from && this.to && this.from > this.to) {
      this.errorMessage = this.translate.instant('Start date must be before end date');
      return;
    }
    this.reload();
  }

  private format(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  reload(): void {
    this.errorMessage = '';
    this.loadStats();
    this.loadRows(1);
  }

  // --- STATS ---
  loadStats(): void {
    this.statsLoading = true;
    this.invitesService.getStats({ from: this.from, to: this.to }).subscribe({
      next: (res: any) => {
        this.statsLoading = false;
        this.stats = this.isOk(res) ? res.data : null;
        this.maxDaily = Math.max(1, ...(this.stats?.daily || []).map((d: any) => d.invites));
      },
      error: (err) => {
        this.statsLoading = false;
        this.stats = null;
        this.errorMessage = err?.error?.message || this.translate.instant('Failed to load invite stats');
      }
    });
  }

  channelPercent(count: number): number {
    return this.stats?.invites ? Math.round((count / this.stats.invites) * 100) : 0;
  }

  barHeight(count: number): number {
    return Math.max(4, Math.round((count / this.maxDaily) * 100));
  }

  // --- TABLES ---
  switchTab(tab: Tab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.channel = '';
    this.loadRows(1);
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadRows(1), 400);
  }

  loadRows(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    const filters = {
      ...(this.activeTab === 'allowed' ? {} : { from: this.from, to: this.to }),
      search: this.searchTerm.trim(),
      page,
      per_page: this.perPage,
      ...(this.activeTab === 'invites' ? { channel: this.channel } : {})
    };
    const request = this.activeTab === 'inviters'
      ? this.invitesService.getInviters(filters)
      : this.activeTab === 'invites'
        ? this.invitesService.getInvites(filters)
        : this.invitesService.getAllowed(filters);

    request.subscribe({
      next: (res: any) => {
        this.loading = false;
        this.rows = this.isOk(res) && Array.isArray(res.data) ? res.data : [];
        this.currentPage = res?.meta?.page || page;
        this.lastPage = res?.meta?.total_pages || 1;
        this.total = res?.meta?.total ?? this.rows.length;
      },
      error: (err) => {
        this.loading = false;
        this.rows = [];
        this.total = 0;
        this.errorMessage = err?.error?.message || this.translate.instant('Failed to load invites');
      }
    });
  }

  getPageNumbers(last: number, current: number): number[] {
    const start = Math.max(1, current - 2);
    const end = Math.min(last, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // --- WHO CAN INVITE ---
  onCandidateSearch(): void {
    clearTimeout(this.candidateTimer);
    const term = this.candidateTerm.trim();
    if (term.length < 2) {
      this.candidates = [];
      return;
    }
    this.candidateTimer = setTimeout(() => {
      this.candidatesLoading = true;
      this.invitesService.searchCandidates(term).subscribe({
        next: (res: any) => {
          this.candidatesLoading = false;
          this.candidates = this.isOk(res) && Array.isArray(res.data) ? res.data : [];
        },
        error: () => {
          this.candidatesLoading = false;
          this.candidates = [];
        }
      });
    }, 400);
  }

  allowUser(user: any): void {
    this.busyUserId = user.id;
    this.invitesService.allow(user.id).subscribe({
      next: () => {
        this.busyUserId = null;
        user.is_allowed = true;
        this.showToast(this.translate.instant('Added to the invite list'), 'success');
        this.loadRows(1);
      },
      error: (err) => {
        this.busyUserId = null;
        this.showToast(err?.error?.message || this.translate.instant('Something went wrong'), 'danger');
      }
    });
  }

  confirmRemove(): void {
    const user = this.removeTarget;
    if (!user) return;
    this.busyUserId = user.id;
    this.invitesService.disallow(user.id).subscribe({
      next: () => {
        this.busyUserId = null;
        this.removeTarget = null;
        const candidate = this.candidates.find((c) => c.id === user.id);
        if (candidate) candidate.is_allowed = false;
        this.showToast(this.translate.instant('Removed from the invite list'), 'success');
        this.loadRows(this.currentPage);
      },
      error: (err) => {
        this.busyUserId = null;
        this.showToast(err?.error?.message || this.translate.instant('Something went wrong'), 'danger');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'danger'): void {
    this.toastMessage = message;
    this.toastType = type;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => (this.toastMessage = ''), 3500);
  }

  // --- INVITER DETAILS ---
  openInviter(userId: number): void {
    if (!userId) return;
    this.showInviter = true;
    this.inviter = null;
    this.loadInviter(userId, 1);
  }

  loadInviter(userId: number, page: number): void {
    this.inviterLoading = true;
    this.invitesService.getInviter(userId, page).subscribe({
      next: (res: any) => {
        this.inviterLoading = false;
        this.inviter = this.isOk(res) ? res.data : null;
        this.inviterPage = res?.meta?.page || page;
        this.inviterLastPage = res?.meta?.total_pages || 1;
      },
      error: () => {
        this.inviterLoading = false;
        this.inviter = null;
      }
    });
  }

  closeInviter(): void {
    this.showInviter = false;
    this.inviter = null;
    this.copySuccess = false;
  }

  copyLink(url: string): void {
    if (!url) return;
    navigator.clipboard?.writeText(url).then(() => {
      this.copySuccess = true;
      setTimeout(() => (this.copySuccess = false), 2000);
    });
  }

  channelLabel(channel: string | null): string {
    if (channel === 'android_deferred') return 'Android';
    if (channel === 'ios_deferred') return 'iOS';
    return this.translate.instant('Unknown');
  }

  channelClass(channel: string | null): string {
    if (channel === 'android_deferred') return 'android';
    if (channel === 'ios_deferred') return 'ios';
    return 'unknown';
  }

  private isOk(res: any): boolean {
    return !!res && (res.errorcode === '0' || res.errorcode === 0);
  }
}
