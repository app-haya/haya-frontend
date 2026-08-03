import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupportService } from '../../services/support.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-support-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    NgFor,
    NgIf,
    NgClass
  ],
  templateUrl: './support-departments.html',
  styleUrls: ['./support-departments.css']
})
export class SupportDepartments implements OnInit {
  // Official Account
  officialAccount: any = null;
  officialIdentifier: string = '';
  forceOfficial: boolean = false;
  savingOfficial: boolean = false;

  // Departments
  departments: any[] = [];
  loadingDepartments: boolean = false;

  // Admins List for Assignment
  allAdmins: any[] = [];

  // Modals
  showDeptModal: boolean = false;
  editingDept: any = null;
  deptForm = {
    id: null as number | null,
    name_ar: '',
    name_en: '',
    active: true
  };
  savingDept: boolean = false;

  showAdminsModal: boolean = false;
  selectedDeptForAdmins: any = null;
  selectedAdminIds: number[] = [];
  savingAdmins: boolean = false;

  // Toast Notifications
  toastMessage: string = '';
  toastType: 'success' | 'danger' = 'success';
  toastTimeout: any = null;

  constructor(
    private supportService: SupportService,
    private adminService: AdminService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadOfficialAccount();
    this.loadDepartments();
    this.loadAdmins();
  }

  // --- OFFICIAL ACCOUNT ---
  loadOfficialAccount(): void {
    this.supportService.getOfficialAccount().subscribe({
      next: (res: any) => {
        if (res && (res.data || res.official)) {
          this.officialAccount = res.data || res.official;
          this.officialIdentifier = this.officialAccount?.email || this.officialAccount?.phone || this.officialAccount?.identifier || '';
        }
      },
      error: (err) => console.error('Error fetching official support account:', err)
    });
  }

  saveOfficialAccount(): void {
    if (!this.officialIdentifier.trim()) {
      this.showToast(this.translate.instant('Please enter a user email or phone'), 'danger');
      return;
    }
    this.savingOfficial = true;
    this.supportService.setOfficialAccount(this.officialIdentifier.trim(), this.forceOfficial).subscribe({
      next: (res: any) => {
        this.savingOfficial = false;
        this.officialAccount = res.data || res.official || { identifier: this.officialIdentifier };
        this.showToast(this.translate.instant('Official support account updated successfully'), 'success');
      },
      error: (err) => {
        this.savingOfficial = false;
        const msg = err.error?.message || this.translate.instant('Failed to set official account');
        this.showToast(msg, 'danger');
      }
    });
  }

  // --- DEPARTMENTS ---
  loadDepartments(): void {
    this.loadingDepartments = true;
    this.supportService.getDepartments().subscribe({
      next: (res: any) => {
        this.loadingDepartments = false;
        this.departments = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      },
      error: (err) => {
        this.loadingDepartments = false;
        console.error('Error fetching departments:', err);
        this.departments = [];
      }
    });
  }

  loadAdmins(): void {
    this.adminService.getAllAdmins().subscribe({
      next: (res: any) => {
        this.allAdmins = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      },
      error: (err: any) => console.error('Error fetching admins:', err)
    });
  }

  // --- ADD / EDIT DEPARTMENT ---
  openAddDeptModal(): void {
    this.editingDept = null;
    this.deptForm = { id: null, name_ar: '', name_en: '', active: true };
    this.showDeptModal = true;
  }

  openEditDeptModal(dept: any): void {
    this.editingDept = dept;
    this.deptForm = {
      id: dept.id,
      name_ar: dept.name_ar || dept.name || '',
      name_en: dept.name_en || dept.name || '',
      active: dept.active !== undefined ? !!dept.active : true
    };
    this.showDeptModal = true;
  }

  closeDeptModal(): void {
    this.showDeptModal = false;
    this.editingDept = null;
    this.savingDept = false;
  }

  saveDepartment(): void {
    if (!this.deptForm.name_ar.trim() || !this.deptForm.name_en.trim()) {
      this.showToast(this.translate.instant('Please enter both Arabic and English names'), 'danger');
      return;
    }
    this.savingDept = true;

    const payload = {
      name_ar: this.deptForm.name_ar.trim(),
      name_en: this.deptForm.name_en.trim(),
      active: this.deptForm.active
    };

    const req$ = this.editingDept
      ? this.supportService.updateDepartment(this.deptForm.id!, payload)
      : this.supportService.createDepartment(payload);

    req$.subscribe({
      next: () => {
        this.savingDept = false;
        this.closeDeptModal();
        this.showToast(this.translate.instant('Department saved successfully'), 'success');
        this.loadDepartments();
      },
      error: (err) => {
        this.savingDept = false;
        const msg = err.error?.message || this.translate.instant('Failed to save department');
        this.showToast(msg, 'danger');
      }
    });
  }

  toggleDeptActive(dept: any): void {
    const updatedActive = !dept.active;
    this.supportService.updateDepartment(dept.id, { active: updatedActive }).subscribe({
      next: () => {
        dept.active = updatedActive;
        this.showToast(this.translate.instant('Department status updated'), 'success');
      },
      error: () => this.showToast(this.translate.instant('Failed to update status'), 'danger')
    });
  }

  deleteDepartment(dept: any): void {
    if (!confirm(this.translate.instant('Are you sure you want to delete this department?'))) return;
    this.supportService.deleteDepartment(dept.id).subscribe({
      next: () => {
        this.showToast(this.translate.instant('Department deleted successfully'), 'success');
        this.loadDepartments();
      },
      error: (err) => {
        const msg = err.error?.message || this.translate.instant('Failed to delete department');
        this.showToast(msg, 'danger');
      }
    });
  }

  // --- ASSIGN ADMINS ---
  openAdminsModal(dept: any): void {
    this.selectedDeptForAdmins = dept;
    const currentAdmins = dept.admins || dept.admin_ids || [];
    this.selectedAdminIds = currentAdmins.map((a: any) => typeof a === 'object' ? a.id : a);
    this.showAdminsModal = true;
  }

  closeAdminsModal(): void {
    this.showAdminsModal = false;
    this.selectedDeptForAdmins = null;
    this.selectedAdminIds = [];
    this.savingAdmins = false;
  }

  toggleAdminSelection(adminId: number): void {
    const idx = this.selectedAdminIds.indexOf(adminId);
    if (idx > -1) {
      this.selectedAdminIds.splice(idx, 1);
    } else {
      this.selectedAdminIds.push(adminId);
    }
  }

  isAdminSelected(adminId: number): boolean {
    return this.selectedAdminIds.includes(adminId);
  }

  saveDepartmentAdmins(): void {
    if (!this.selectedDeptForAdmins) return;
    this.savingAdmins = true;

    this.supportService.updateDepartmentAdmins(this.selectedDeptForAdmins.id, this.selectedAdminIds).subscribe({
      next: () => {
        this.savingAdmins = false;
        this.closeAdminsModal();
        this.showToast(this.translate.instant('Department supervisors updated successfully'), 'success');
        this.loadDepartments();
      },
      error: (err) => {
        this.savingAdmins = false;
        const msg = err.error?.message || this.translate.instant('Failed to update department supervisors');
        this.showToast(msg, 'danger');
      }
    });
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(message: string, type: 'success' | 'danger' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }
}
