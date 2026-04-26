import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet.service';
import { UsersService } from '../../services/users.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-wallet-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './wallet-transactions.html',
  styleUrls: ['./wallet-transactions.css']
})
export class WalletTransactions implements OnInit {
  transactions: any[] = [];
  loading = true;
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  // Filters
  filters = {
    type: '',
    user_id: '' as any,
    from_date: '',
    to_date: ''
  };

  // User Search Autocomplete
  userSearchTerm = '';
  userSuggestions: any[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  constructor(
    private walletService: WalletService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.fetchTransactions();
    this.initUserSearch();
  }

  initUserSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          this.userSuggestions = [];
          this.showSuggestions = false;
          return [];
        }
        return this.usersService.getAllUsers(1, term);
      })
    ).subscribe({
      next: (res: any) => {
        this.userSuggestions = res.users?.data || [];
        this.showSuggestions = this.userSuggestions.length > 0;
      }
    });
  }

  onUserSearchChange() {
    this.searchSubject.next(this.userSearchTerm);
  }

  selectUser(user: any) {
    this.filters.user_id = user.id;
    this.userSearchTerm = user.name;
    this.showSuggestions = false;
  }

  clearUserSearch() {
    this.userSearchTerm = '';
    this.filters.user_id = '';
    this.userSuggestions = [];
    this.showSuggestions = false;
  }

  fetchTransactions(page: number = 1) {
    this.loading = true;
    const params = {
      page,
      per_page: this.perPage,
      ...this.filters
    };

    this.walletService.getTransactions(params).subscribe({
      next: (res: any) => {
        if (res.errorcode === '0' || res.status === 200) {
          // Supporting both direct data and paginated data structure
          const result = res.data;
          this.transactions = result.data || [];
          this.currentPage = result.current_page || 1;
          this.lastPage = result.last_page || 1;
          this.total = result.total || 0;
        }
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.fetchTransactions();
  }

  resetFilters() {
    this.filters = {
      type: '',
      user_id: '',
      from_date: '',
      to_date: ''
    };
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.fetchTransactions(page);
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
