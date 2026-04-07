import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { BannedWordsService } from '../../services/banned-words.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-banned-words',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './banned-words.html',
  styleUrls: ['./banned-words.css'],
})
export class BannedWords implements OnInit {
  bannedWords: any[] = [];
  filteredWords: any[] = [];
  newWord: string = '';
  searchTerm: string = '';

  showAddModal: boolean = false;
  editMode: boolean = false;

  editId: number | null = null;
  editWord: string = '';
  message: string = '';

  constructor(
    private bannedWordsService: BannedWordsService,
    private notification: NotificationService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.loadWords();
  }

  loadWords(): void {
    this.bannedWordsService.getAll().subscribe({
      next: (res) => {
        if (res && res.errorcode === '0' && Array.isArray(res.data)) {
          this.bannedWords = res.data;
          this.applyFilter();
          this.message = '';
        } else {
          this.bannedWords = [];
          this.filteredWords = [];
          this.message = res.message || 'No data found';
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.notification.error('Failed to load banned words');
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredWords = [...this.bannedWords];
      return;
    }
    this.filteredWords = this.bannedWords.filter(item =>
      item.word.toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    this.newWord = '';
    this.showAddModal = true;
  }

  addWord(): void {
    if (!this.newWord.trim()) return;
    this.bannedWordsService.add(this.newWord).subscribe({
      next: (res) => {
        if (res.errorcode === '0') {
          this.notification.success('Word Added successfully!');
          this.newWord = '';
          this.showAddModal = false;
          this.loadWords();
        } else {
          this.notification.error(res.message || 'Word Add failed!');
        }
      },
      error: (err) => console.error(err),
    });
  }

  startEdit(word: any): void {
    this.editMode = true;
    this.editId = word.id;
    this.editWord = word.word;
  }

  updateWord(): void {
    if (!this.editWord.trim() || !this.editId) return;
    this.bannedWordsService.update(this.editId, this.editWord).subscribe({
      next: (res) => {
        if (res.errorcode === '0') {
          this.notification.success('Word updated successfully!');
          this.editMode = false;
          this.editId = null;
          this.editWord = '';
          this.loadWords();
        } else {
          this.notification.error(res.message || 'Word update failed!');
        }
      },
      error: (err) => console.error(err),
    });
  }

  deleteWord(id: number): void {
    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this word?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        this.bannedWordsService.delete(id).subscribe({
          next: (res) => {
            if (res.errorcode === '0') {
              this.notification.success('Word deleted successfully!');
              this.loadWords();
            } else {
              this.notification.error(res.message || 'Word delete failed!');
            }
          },
          error: (err) => console.error(err),
        });
      }
    });
  }
}