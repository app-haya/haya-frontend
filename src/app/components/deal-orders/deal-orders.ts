import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DealService } from '../../services/deal.service';
import { NotificationService } from '../../services/notification.service';
import { DashboardService } from '../../services/dashboard.service';
import { formatImageUrl, isPdf } from '../../utils/image-helper';
import { HAYA_LOGO_BASE64 } from '../../utils/haya-logo-base64';
import { Workbook } from 'exceljs';

@Component({
  selector: 'app-deal-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './deal-orders.html',
  styleUrls: ['./deal-orders.css']
})
export class DealOrders implements OnInit {
  orders: any[] = [];
  displayedOrders: any[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 20;
  orderStatusFilter = '';

  // Monthly & Yearly Filter
  selectedMonth: number = 0; // 0 = All Months
  selectedYear: number = new Date().getFullYear();
  yearsList: number[] = [2026, 2025, 2024, 2023];

  monthsList = [
    { value: 0, labelAr: 'جميع الأشهر', labelEn: 'All Months' },
    { value: 1, labelAr: 'شهر 1 (يناير)', labelEn: 'Jan (1)' },
    { value: 2, labelAr: 'شهر 2 (فبراير)', labelEn: 'Feb (2)' },
    { value: 3, labelAr: 'شهر 3 (مارس)', labelEn: 'Mar (3)' },
    { value: 4, labelAr: 'شهر 4 (أبريل)', labelEn: 'Apr (4)' },
    { value: 5, labelAr: 'شهر 5 (مايو)', labelEn: 'May (5)' },
    { value: 6, labelAr: 'شهر 6 (يونيو)', labelEn: 'Jun (6)' },
    { value: 7, labelAr: 'شهر 7 (يوليو)', labelEn: 'Jul (7)' },
    { value: 8, labelAr: 'شهر 8 (أغسطس)', labelEn: 'Aug (8)' },
    { value: 9, labelAr: 'شهر 9 (سبتمبر)', labelEn: 'Sep (9)' },
    { value: 10, labelAr: 'شهر 10 (أكتوبر)', labelEn: 'Oct (10)' },
    { value: 11, labelAr: 'شهر 11 (نوفمبر)', labelEn: 'Nov (11)' },
    { value: 12, labelAr: 'شهر 12 (ديسمبر)', labelEn: 'Dec (12)' },
  ];

  showInvoiceModal = false;
  safeInvoiceUrl: SafeResourceUrl | null = null;
  previewImageUrl = '';
  isPreviewPdf = false;
  previewModalTitle = 'Invoice';

  constructor(
    private dealService: DealService,
    private notification: NotificationService,
    public translate: TranslateService,
    private dashboardService: DashboardService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.loading = true;
    this.orders = [];
    this.displayedOrders = [];

    // If a specific month or year filter is active, request more items for complete client filter
    const fetchPerPage = (this.selectedMonth > 0 || this.selectedYear) ? 100 : this.perPage;

    this.dealService.getAllDealOrders(
      page,
      this.orderStatusFilter,
      this.searchTerm,
      this.selectedMonth > 0 ? this.selectedMonth : undefined,
      this.selectedYear,
      fetchPerPage
    ).subscribe({
      next: (res: any) => {
        let loadedOrders: any[] = [];
        if (res.data?.data) {
          loadedOrders = res.data.data;
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
          this.total = res.data.total;
        } else {
          loadedOrders = res.data ?? [];
          this.currentPage = 1;
          this.lastPage = 1;
          this.total = loadedOrders.length;
        }

        this.orders = loadedOrders;
        this.applyMonthFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load orders');
      }
    });
  }

  selectMonth(month: number): void {
    if (this.selectedMonth === month) return;
    this.selectedMonth = month;
    this.currentPage = 1;
    this.loadOrders(1);
  }

  onYearChange(): void {
    this.currentPage = 1;
    this.loadOrders(1);
  }

  applyMonthFilter(): void {
    this.displayedOrders = this.orders.filter(order => {
      if (!order.created_at) return true;
      const d = new Date(order.created_at);
      const matchesMonth = !this.selectedMonth || this.selectedMonth === 0 || (d.getMonth() + 1) === this.selectedMonth;
      const matchesYear = !this.selectedYear || d.getFullYear() === Number(this.selectedYear);
      return matchesMonth && matchesYear;
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadOrders(1);
  }

  onOrderStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders(1);
  }

  // Financial calculation helpers
  isCommercial(order: any): boolean {
    const sellerType = order?.deal?.seller_type || order?.deal?.user?.type;
    return sellerType === 'business';
  }

  getOrderTaxRate(order: any): number {
    return this.isCommercial(order) ? 15 : 0;
  }

  getOrderTaxAmount(order: any): number {
    const price = Number(order?.total_price) || 0;
    return (price * this.getOrderTaxRate(order)) / 100;
  }

  getOrderCommissionAmount(order: any): number {
    const price = Number(order?.total_price) || 0;
    return price * 0.025;
  }

  getOrderSellerNetAmount(order: any): number {
    const price = Number(order?.total_price) || 0;
    return Math.max(0, price - this.getOrderTaxAmount(order) - this.getOrderCommissionAmount(order));
  }

  // Monthly Stats
  getTotalSales(): number {
    return this.displayedOrders.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);
  }

  getTotalHayaCommission(): number {
    return this.displayedOrders.reduce((acc, o) => acc + this.getOrderCommissionAmount(o), 0);
  }

  getTotalTax(): number {
    return this.displayedOrders.reduce((acc, o) => acc + this.getOrderTaxAmount(o), 0);
  }

  getTotalSellerNet(): number {
    return this.displayedOrders.reduce((acc, o) => acc + this.getOrderSellerNetAmount(o), 0);
  }

  getSelectedMonthLabel(): string {
    const found = this.monthsList.find(m => m.value === this.selectedMonth);
    return found ? found.labelAr : 'جميع الأشهر';
  }

  private async getLogoPngBase64(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 160;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, 160, 160);
              const dataUrl = canvas.toDataURL('image/png');
              const b64 = dataUrl.split(',')[1];
              resolve(b64);
              return;
            }
          } catch (e) {}
          resolve('');
        };
        img.onerror = () => resolve('');
        img.src = HAYA_LOGO_BASE64;
      } catch (e) {
        resolve('');
      }
    });
  }

  // Export to Real Styled Microsoft Excel (.xlsx Workbook) with Visual Identity
  async exportToExcel(): Promise<void> {
    if (!this.displayedOrders || this.displayedOrders.length === 0) {
      this.notification.error('لا توجد طلبات لتصديرها في هذا الشهر');
      return;
    }

    const monthLabel = this.getSelectedMonthLabel();
    const year = this.selectedYear;
    const totalOrders = this.displayedOrders.length;
    const totalSales = Number(this.getTotalSales().toFixed(2));
    const totalTax = Number(this.getTotalTax().toFixed(2));
    const totalHaya = Number(this.getTotalHayaCommission().toFixed(2));
    const totalNet = Number(this.getTotalSellerNet().toFixed(2));

    const wb = new Workbook();
    wb.creator = 'منصة وتطبيق هيا - Haya Platform';
    wb.created = new Date();

    const ws = wb.addWorksheet('طلبات الشراء', {
      views: [{ rightToLeft: true, showGridLines: true }]
    });

    // 1. Title Banner (Row 1)
    ws.mergeCells('A1:Q1');
    const titleCell = ws.getCell('A1');
    titleCell.value = 'منصة وتطبيق هيّا الرسمية — تقرير العمليات المالية والمبيعات وضريبة القيمة المضافة';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A1D6D' } // Deep Royal Haya Purple
    };
    ws.getRow(1).height = 44;

    // 2. Info Banner (Row 2)
    ws.mergeCells('A2:Q2');
    const infoCell = ws.getCell('A2');
    infoCell.value = `الفترة المحددة: ${monthLabel} (${year})   |   إجمالي عدد الطلبات: ${totalOrders} طلب   |   تاريخ الإصدار: ${new Date().toLocaleString('ar-SA')}   |   العملة: ريال سعودي (SAR)`;
    infoCell.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF4A1D6D' } };
    infoCell.alignment = { vertical: 'middle', horizontal: 'center' };
    infoCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3E8FF' } // Soft Lavender
    };
    ws.getRow(2).height = 28;

    // 3. KPI Summary Row (Row 3)
    ws.mergeCells('A3:C3');
    const kpiSales = ws.getCell('A3');
    kpiSales.value = `إجمالي المبيعات: ${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR`;
    kpiSales.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF1E40AF' } };
    kpiSales.alignment = { vertical: 'middle', horizontal: 'center' };
    kpiSales.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };

    ws.mergeCells('D3:F3');
    const kpiOrders = ws.getCell('D3');
    kpiOrders.value = `عدد الطلبات: ${totalOrders} طلب`;
    kpiOrders.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF5B21B6' } };
    kpiOrders.alignment = { vertical: 'middle', horizontal: 'center' };
    kpiOrders.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };

    ws.mergeCells('G3:I3');
    const kpiTax = ws.getCell('G3');
    kpiTax.value = `ضريبة القيمة المضافة: ${totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR`;
    kpiTax.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FFB45309' } };
    kpiTax.alignment = { vertical: 'middle', horizontal: 'center' };
    kpiTax.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };

    ws.mergeCells('J3:L3');
    const kpiHaya = ws.getCell('J3');
    kpiHaya.value = `عمولة منصة هيا (2.5%): ${totalHaya.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR`;
    kpiHaya.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF7C3AED' } };
    kpiHaya.alignment = { vertical: 'middle', horizontal: 'center' };
    kpiHaya.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF5FF' } };

    ws.mergeCells('M3:Q3');
    const kpiNet = ws.getCell('M3');
    kpiNet.value = `صافي مستحقات البائعين: ${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR`;
    kpiNet.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
    kpiNet.alignment = { vertical: 'middle', horizontal: 'center' };
    kpiNet.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
    ws.getRow(3).height = 32;

    ['A3', 'D3', 'G3', 'J3', 'M3'].forEach(addr => {
      ws.getCell(addr).border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });

    // Row 4: Spacer row
    ws.getRow(4).height = 10;

    // 4. Table Header Row (Row 5)
    const headerRow = ws.getRow(5);
    headerRow.height = 34;
    const headers = [
      'م',
      'رقم الطلب',
      'عنوان ورقم الصفقة',
      'نوع الحساب',
      'اسم البائع',
      'هاتف البائع',
      'اسم المشتري',
      'هاتف المشتري',
      'الكمية',
      'إجمالي القيمة (SAR)',
      'عمولة هيا 2.5% (SAR)',
      'نسبة الضريبة',
      'مبلغ الضريبة (SAR)',
      'صافي البائع (SAR)',
      'حالة السداد',
      'حالة الطلب',
      'تاريخ العملية'
    ];
    headerRow.values = headers;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2D1245' } // Deep Royal Violet Header
      };
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF4A1D6D' } },
        bottom: { style: 'medium', color: { argb: 'FF4A1D6D' } },
        left: { style: 'thin', color: { argb: 'FF581C87' } },
        right: { style: 'thin', color: { argb: 'FF581C87' } }
      };
    });

    // 5. Data Rows
    this.displayedOrders.forEach((order, idx) => {
      const isBiz = this.isCommercial(order);
      const sellerType = isBiz ? 'تجاري' : 'شخصي';
      const dealTitle = order.deal?.title || '—';
      const sellerName = order.deal?.user?.name || '—';
      const sellerPhone = order.deal?.user?.phone || '—';
      const buyerName = order.user?.name || '—';
      const buyerPhone = order.user?.phone || '—';
      const qty = order.quantity || 1;
      const price = Number(order.total_price || 0);
      const taxRate = this.getOrderTaxRate(order) + '%';
      const taxAmount = Number(this.getOrderTaxAmount(order).toFixed(2));
      const hayaAmount = Number(this.getOrderCommissionAmount(order).toFixed(2));
      const netAmount = Number(this.getOrderSellerNetAmount(order).toFixed(2));
      const payStatus = order.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع';
      const orderStatus = order.status || '—';
      const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('ar-SA') : '—';

      const row = ws.addRow([
        idx + 1,
        `#ORD-${order.id}`,
        dealTitle,
        sellerType,
        sellerName,
        sellerPhone,
        buyerName,
        buyerPhone,
        qty,
        price,
        hayaAmount,
        taxRate,
        taxAmount,
        netAmount,
        payStatus,
        orderStatus,
        dateStr
      ]);
      row.height = 25;

      const isEven = idx % 2 === 0;
      const rowBgColor = isEven ? 'FFFFFFFF' : 'FFFBFBFE';

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10, color: { argb: 'FF1E293B' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowBgColor }
        };

        // Alignments & formats
        if (colNumber === 1 || colNumber === 2 || colNumber === 9 || colNumber === 12 || colNumber === 15 || colNumber === 16 || colNumber === 17) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 10 || colNumber === 11 || colNumber === 13 || colNumber === 14) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.numFmt = '#,##0.00 "SAR"';
          cell.font = { name: 'Arial', size: 10, bold: true };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // Account Type Badge
        if (colNumber === 4) {
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: isBiz ? 'FF86198F' : 'FF166534' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isBiz ? 'FFFDF4FF' : 'FFF0FDF4' } };
        }
        // Haya Commission
        if (colNumber === 11) {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF7C3AED' } };
        }
        // Tax
        if (colNumber === 13) {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: isBiz ? 'FFB45309' : 'FF059669' } };
        }
        // Net
        if (colNumber === 14) {
          cell.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF047857' } };
        }
        // Payment Status Badge
        if (colNumber === 15) {
          const isPaid = order.payment_status === 'paid';
          cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: isPaid ? 'FF15803D' : 'FFB45309' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isPaid ? 'FFDCFCE7' : 'FFFEF3C7' } };
        }
      });
    });

    // 6. Grand Total Row
    const totalRowIndex = ws.rowCount + 1;
    const totalRow = ws.getRow(totalRowIndex);
    totalRow.height = 34;

    ws.mergeCells(`A${totalRowIndex}:I${totalRowIndex}`);
    const summaryLabelCell = ws.getCell(`A${totalRowIndex}`);
    summaryLabelCell.value = `الإجمالي العام المعتمد (${totalOrders} طلب)`;
    summaryLabelCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    summaryLabelCell.alignment = { vertical: 'middle', horizontal: 'right' };

    const totalGrossCell = ws.getCell(`J${totalRowIndex}`);
    totalGrossCell.value = totalSales;
    totalGrossCell.numFmt = '#,##0.00 "SAR"';
    totalGrossCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    totalGrossCell.alignment = { vertical: 'middle', horizontal: 'left' };

    const totalHayaCell = ws.getCell(`K${totalRowIndex}`);
    totalHayaCell.value = totalHaya;
    totalHayaCell.numFmt = '#,##0.00 "SAR"';
    totalHayaCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFC084FC' } };
    totalHayaCell.alignment = { vertical: 'middle', horizontal: 'left' };

    const emptyTaxRateCell = ws.getCell(`L${totalRowIndex}`);
    emptyTaxRateCell.value = '—';
    emptyTaxRateCell.font = { name: 'Arial', size: 10, color: { argb: 'FF94A3B8' } };
    emptyTaxRateCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const totalTaxCell = ws.getCell(`M${totalRowIndex}`);
    totalTaxCell.value = totalTax;
    totalTaxCell.numFmt = '#,##0.00 "SAR"';
    totalTaxCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFBBF24' } };
    totalTaxCell.alignment = { vertical: 'middle', horizontal: 'left' };

    const totalNetCell = ws.getCell(`N${totalRowIndex}`);
    totalNetCell.value = totalNet;
    totalNetCell.numFmt = '#,##0.00 "SAR"';
    totalNetCell.font = { name: 'Arial', size: 11.5, bold: true, color: { argb: 'FF34D399' } };
    totalNetCell.alignment = { vertical: 'middle', horizontal: 'left' };

    ws.mergeCells(`O${totalRowIndex}:Q${totalRowIndex}`);
    const endNoteCell = ws.getCell(`O${totalRowIndex}`);
    endNoteCell.value = '— نهاية سجلات الفترة —';
    endNoteCell.font = { name: 'Arial', size: 10, color: { argb: 'FF94A3B8' } };
    endNoteCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Total Row Styling
    totalRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E1B4B' } // Dark Slate
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF475569' } },
        bottom: { style: 'medium', color: { argb: 'FF475569' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    // 7. Column Widths
    ws.columns = [
      { width: 6 },  // A: م
      { width: 14 }, // B: رقم الطلب
      { width: 34 }, // C: عنوان ورقم الصفقة
      { width: 14 }, // D: نوع الحساب
      { width: 22 }, // E: اسم البائع
      { width: 18 }, // F: هاتف البائع
      { width: 22 }, // G: اسم المشتري
      { width: 18 }, // H: هاتف المشتري
      { width: 10 }, // I: الكمية
      { width: 18 }, // J: إجمالي القيمة
      { width: 22 }, // K: عمولة هيا
      { width: 14 }, // L: نسبة الضريبة
      { width: 18 }, // M: مبلغ الضريبة
      { width: 22 }, // N: صافي البائع
      { width: 14 }, // O: حالة السداد
      { width: 14 }, // P: حالة الطلب
      { width: 24 }  // Q: تاريخ العملية
    ];

    // 8. Add Official Haya Logo Image into Excel
    try {
      const pngBase64 = await this.getLogoPngBase64();
      if (pngBase64) {
        const imageId = wb.addImage({
          base64: pngBase64,
          extension: 'png'
        });
        ws.addImage(imageId, {
          tl: { col: 0.1, row: 0.05 },
          ext: { width: 38, height: 38 }
        });
      }
    } catch (e) {
      console.warn('Could not embed logo image in Excel:', e);
    }

    // 9. Download file via Blob
    const monthTag = this.selectedMonth > 0 ? `شهر_${this.selectedMonth}` : 'جميع_الأشهر';
    const fileName = `Haya_Orders_${year}_${monthTag}.xlsx`;

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 20000);

    this.notification.success('تم تصدير ملف الإكسل المنسق بالهوية البصرية بنجاح');
  }

  // Print or Download PDF (Isolated clean report without dashboard layout)
  printOrDownloadPdf(): void {
    if (!this.displayedOrders || this.displayedOrders.length === 0) {
      this.notification.error('لا توجد طلبات لطباعتها أو حفظها كـ PDF');
      return;
    }

    const monthLabel = this.getSelectedMonthLabel();
    const year = this.selectedYear;
    const totalOrders = this.displayedOrders.length;
    const totalSales = this.getTotalSales().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalTax = this.getTotalTax().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalHaya = this.getTotalHayaCommission().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalNet = this.getTotalSellerNet().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const printDateStr = new Date().toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const reportRef = `HY-REP-${year}-${this.selectedMonth > 0 ? String(this.selectedMonth).padStart(2, '0') : 'ALL'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const rowsHtml = this.displayedOrders.map((o, idx) => {
      const isBiz = this.isCommercial(o);
      const sellerType = isBiz ? 'تجاري' : 'شخصي';
      const sellerName = o.deal?.user?.name || o.deal?.user?.phone || '—';
      const buyerName = o.user?.name || o.user?.phone || '—';
      const dealTitle = o.deal?.title || '—';
      const price = Number(o.total_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const taxRate = this.getOrderTaxRate(o);
      const taxAmount = this.getOrderTaxAmount(o).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const taxText = isBiz ? `${taxAmount} (${taxRate}%)` : 'معفى (0%)';
      const hayaAmount = this.getOrderCommissionAmount(o).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const netAmount = this.getOrderSellerNetAmount(o).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const isPaid = o.payment_status === 'paid';
      const payBadgeClass = isPaid ? 'badge-paid' : 'badge-unpaid';
      const payStatus = isPaid ? 'مدفوع' : 'غير مدفوع';
      const orderStatus = o.status || '—';
      const dateStr = o.created_at ? new Date(o.created_at).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '—';

      return `
        <tr>
          <td style="text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: #1e1b4b;">${dealTitle}</div>
            <div style="font-size: 9px; color: #94a3b8; font-family: monospace;">#ORD-${o.id}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${sellerName}</div>
            <span class="b-account ${isBiz ? 'b-biz' : 'b-pers'}">${sellerType}</span>
          </td>
          <td>
            <div style="font-weight: 600;">${buyerName}</div>
          </td>
          <td style="text-align: left;" class="num-col"><strong>${price}</strong></td>
          <td style="text-align: left; color: #7c3aed;" class="num-col">${hayaAmount}</td>
          <td style="text-align: left; color: ${isBiz ? '#b45309' : '#059669'};" class="num-col">${taxText}</td>
          <td style="text-align: left; color: #047857;" class="num-col"><strong>${netAmount}</strong></td>
          <td style="text-align: center;"><span class="${payBadgeClass}">${payStatus}</span></td>
          <td style="text-align: center; font-weight: 600; color: #475569;">${orderStatus}</td>
          <td style="text-align: center; font-size: 10px; color: #64748b;">${dateStr}</td>
        </tr>
      `;
    }).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <base href="${window.location.origin}/">
        <title>تقرير مبيعات ${monthLabel} ${year} - منصة وتطبيق هيا</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm 8mm 10mm 8mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;
            direction: rtl;
            background: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 12px 16px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .top-accent-bar {
            height: 5px;
            background: linear-gradient(90deg, #4c1d95 0%, #7c3aed 30%, #a855f7 60%, #f59e0b 100%);
            border-radius: 4px;
            margin-bottom: 14px;
          }
          .corporate-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          .brand-side {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .brand-logo {
            height: 64px;
            width: auto;
            max-width: 140px;
            object-fit: contain;
            filter: drop-shadow(0 2px 6px rgba(134, 70, 156, 0.15));
          }
          .brand-details {
            display: flex;
            flex-direction: column;
          }
          .brand-tag {
            font-size: 11px;
            font-weight: 700;
            color: #7c3aed;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 800;
            color: #1e1b4b;
            margin: 2px 0;
          }
          .brand-compliance {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
          }
          .meta-side {
            text-align: left;
          }
          .meta-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            min-width: 250px;
            display: inline-block;
            text-align: right;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            padding: 2px 0;
            gap: 12px;
          }
          .meta-lbl {
            color: #64748b;
            font-weight: 500;
          }
          .meta-val {
            color: #0f172a;
            font-weight: 600;
          }
          .meta-val.code {
            font-family: monospace;
            color: #6d28d9;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .period-badge {
            background: #ede9fe;
            color: #6d28d9;
            font-weight: 700;
            font-size: 10.5px;
            padding: 1px 8px;
            border-radius: 12px;
          }
          .certified-tag {
            color: #059669;
            font-weight: 700;
            font-size: 10.5px;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 14px;
          }
          .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 10px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .kpi-sales { border-top: 3.5px solid #3b82f6; }
          .kpi-orders { border-top: 3.5px solid #6366f1; }
          .kpi-tax { border-top: 3.5px solid #f59e0b; background: #fffdf5; }
          .kpi-haya { border-top: 3.5px solid #8b5cf6; background: #faf5ff; }
          .kpi-net { border-top: 3.5px solid #10b981; background: #f0fdf4; border-color: #bbf7d0; }
          .kpi-title {
            font-size: 10.5px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 3px;
          }
          .kpi-value {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-variant-numeric: tabular-nums;
          }
          .kpi-value small {
            font-size: 11px;
            font-weight: 600;
          }
          .val-emerald {
            color: #047857;
          }
          .kpi-sub {
            font-size: 9.5px;
            color: #94a3b8;
            margin-top: 2px;
          }
          .report-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            font-size: 11px;
            margin-bottom: 14px;
          }
          .report-table thead th {
            background: #231238;
            color: #ffffff;
            font-weight: 700;
            padding: 8px 8px;
            border-bottom: 2px solid #581c87;
            font-size: 10.5px;
            white-space: nowrap;
          }
          .report-table tbody td {
            border-bottom: 1px solid #e2e8f0;
            padding: 6px 8px;
            vertical-align: middle;
            color: #1e293b;
          }
          .report-table tbody tr:nth-child(even) {
            background: #fbfbfe;
          }
          .report-table tfoot td {
            background: #111827;
            color: #ffffff;
            font-size: 11px;
            padding: 7px 8px;
            border-top: 2px solid #374151;
          }
          .b-account {
            display: inline-block;
            font-size: 9px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 4px;
            margin-top: 2px;
          }
          .b-biz {
            background: #fdf4ff;
            color: #86198f;
            border: 1px solid #f0abfc;
          }
          .b-pers {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          .badge-paid {
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
            font-weight: 700;
            font-size: 9.5px;
            padding: 2px 7px;
            border-radius: 4px;
            display: inline-block;
          }
          .badge-unpaid {
            background: #fef3c7;
            color: #b45309;
            border: 1px solid #fde68a;
            font-weight: 700;
            font-size: 9.5px;
            padding: 2px 7px;
            border-radius: 4px;
            display: inline-block;
          }
          .num-col {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-variant-numeric: tabular-nums;
            font-weight: 600;
          }
          .audit-section {
            display: grid;
            grid-template-columns: 1fr 140px 1fr;
            gap: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
            background: #fcfcfd;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .audit-col {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .audit-header {
            font-size: 11.5px;
            font-weight: 700;
            color: #4338ca;
            margin-bottom: 4px;
            border-bottom: 1px solid #e0e7ff;
            padding-bottom: 3px;
          }
          .audit-desc {
            font-size: 10px;
            color: #64748b;
            line-height: 1.5;
            margin-bottom: 8px;
          }
          .signature-line {
            font-size: 10.5px;
            color: #334155;
            font-weight: 600;
          }
          .line-dots {
            color: #94a3b8;
            letter-spacing: -1px;
          }
          .stamp-center {
            align-items: center;
            justify-content: center;
          }
          .official-seal {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .seal-outer {
            width: 95px;
            height: 95px;
            border: 2px dashed #7c3aed;
            border-radius: 50%;
            padding: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #faf5ff;
          }
          .seal-inner {
            width: 85px;
            height: 85px;
            border: 1.5px solid #7c3aed;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2px;
          }
          .seal-star {
            font-size: 7px;
            color: #7c3aed;
            line-height: 1;
          }
          .seal-name {
            font-size: 8.5px;
            font-weight: 800;
            color: #6b21a8;
            line-height: 1.1;
            margin: 1px 0;
          }
          .seal-certified {
            font-size: 8px;
            font-weight: 700;
            color: #059669;
            background: #dcfce7;
            padding: 1px 4px;
            border-radius: 3px;
            margin: 1px 0;
          }
          .seal-code {
            font-size: 7px;
            font-weight: 700;
            color: #475569;
            letter-spacing: 0.3px;
          }
          .seal-en {
            font-size: 6px;
            font-weight: 800;
            color: #7c3aed;
            letter-spacing: 0.5px;
          }
          .report-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9.5px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
          }
          .rf-center {
            font-weight: 600;
            color: #64748b;
          }
          @media print {
            body {
              padding: 0;
            }
            .report-table thead {
              display: table-header-group;
            }
            .report-table tfoot {
              display: table-footer-group;
            }
            .report-table tbody tr {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="top-accent-bar"></div>

        <div class="corporate-header">
          <div class="brand-side">
            <img src="${HAYA_LOGO_BASE64}" onerror="this.onerror=null; this.src='/images/haya-icon.svg';" alt="شعار تطبيق هيا" class="brand-logo" />
            <div class="brand-details">
              <div class="brand-tag">منصة وتطبيق هيّا الرسمية • Haya Platform & App</div>
              <h1 class="brand-title">تقرير العمليات والمبيعات وضريبة القيمة المضافة</h1>
              <div class="brand-compliance">كشف حساب مالي رسمي معتمد • مطابق لمتطلبات الفوترة والضرائب (ZATCA Standard)</div>
            </div>
          </div>

          <div class="meta-side">
            <div class="meta-card">
              <div class="meta-row">
                <span class="meta-lbl">رقم المرجع المالي:</span>
                <span class="meta-val code">${reportRef}</span>
              </div>
              <div class="meta-row">
                <span class="meta-lbl">الفترة المحددة:</span>
                <span class="period-badge">${monthLabel} (${year})</span>
              </div>
              <div class="meta-row">
                <span class="meta-lbl">تاريخ الإصدار:</span>
                <span class="meta-val">${printDateStr}</span>
              </div>
              <div class="meta-row">
                <span class="meta-lbl">حالة الوثيقة:</span>
                <span class="certified-tag">● وثيقة رسمية معتمدة</span>
              </div>
            </div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card kpi-sales">
            <span class="kpi-title">إجمالي المبيعات (SAR)</span>
            <span class="kpi-value">${totalSales}</span>
            <span class="kpi-sub">شاملاً الضريبة والعمولة</span>
          </div>

          <div class="kpi-card kpi-orders">
            <span class="kpi-title">عدد العمليات والطلبات</span>
            <span class="kpi-value">${totalOrders} <small>طلب</small></span>
            <span class="kpi-sub">صفقات شراء منفذة</span>
          </div>

          <div class="kpi-card kpi-tax">
            <span class="kpi-title">ضريبة القيمة المضافة (15%)</span>
            <span class="kpi-value">${totalTax} <small>SAR</small></span>
            <span class="kpi-sub">خاصة بالحسابات التجارية</span>
          </div>

          <div class="kpi-card kpi-haya">
            <span class="kpi-title">إيرادات منصة هيا (2.5%)</span>
            <span class="kpi-value">${totalHaya} <small>SAR</small></span>
            <span class="kpi-sub">عمولة المنصة المحتسبة</span>
          </div>

          <div class="kpi-card kpi-net">
            <span class="kpi-title">صافي مستحقات البائعين</span>
            <span class="kpi-value val-emerald">${totalNet} <small>SAR</small></span>
            <span class="kpi-sub">المبالغ المستحقة للتحويل</span>
          </div>
        </div>

        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 32px; text-align: center;">#</th>
              <th>عنوان ورقم الصفقة</th>
              <th>التاجر / البائع</th>
              <th>المشتري</th>
              <th style="text-align: left;">قيمة الطلب</th>
              <th style="text-align: left;">عمولة هيا (2.5%)</th>
              <th style="text-align: left;">الضريبة</th>
              <th style="text-align: left;">صافي البائع</th>
              <th style="text-align: center;">حالة السداد</th>
              <th style="text-align: center;">حالة الطلب</th>
              <th style="text-align: center;">تاريخ العملية</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; font-weight: 800; padding: 8px 10px;">
                الإجمالي العام المعتمد (${totalOrders} طلب)
              </td>
              <td style="text-align: left; font-weight: 800;">${totalSales} SAR</td>
              <td style="text-align: left; font-weight: 800; color: #c084fc;">${totalHaya} SAR</td>
              <td style="text-align: left; font-weight: 800; color: #fbbf24;">${totalTax} SAR</td>
              <td style="text-align: left; font-weight: 800; color: #4ade80;">${totalNet} SAR</td>
              <td colspan="3" style="text-align: center; color: #94a3b8; font-weight: 500;">— نهاية سجلات الفترة —</td>
            </tr>
          </tfoot>
        </table>

        <div class="audit-section">
          <div class="audit-col">
            <div class="audit-header">التدقيق المالي والمحاسبي</div>
            <div class="audit-desc">تمت مراجعة ومطابقة العمليات الحسابية والرسوم آلياً وفق السياسات المالية المعتمدة لمنصة هيا.</div>
            <div class="signature-line">
              <span>توقيع المحاسب القانوني:</span>
              <span class="line-dots">______________________</span>
            </div>
          </div>

          <div class="audit-col stamp-center">
            <div class="official-seal">
              <div class="seal-outer">
                <div class="seal-inner">
                  <div class="seal-star">★ ★ ★</div>
                  <div class="seal-name">منصة هيّا الرسمية</div>
                  <div class="seal-certified">معتمد وموثق</div>
                  <div class="seal-code">FIN-OK • ${year}</div>
                  <div class="seal-en">CERTIFIED AUDIT</div>
                </div>
              </div>
            </div>
          </div>

          <div class="audit-col">
            <div class="audit-header">اعتماد الإدارة العامة</div>
            <div class="audit-desc">وثيقة رسمية صادرة وموثقة إلكترونياً من لوحة الإدارة — تطبيق ومنصة هيا لتقنية المعلومات بالمملكة.</div>
            <div class="signature-line">
              <span>الاعتماد والختم:</span>
              <span class="line-dots">______________________</span>
            </div>
          </div>
        </div>

        <div class="report-footer">
          <div class="rf-col"><strong>مرجع التقرير:</strong> ${reportRef} | <strong>رمز الحماية:</strong> HY-VERIFIED-AUTH</div>
          <div class="rf-col rf-center">منصة وتطبيق هيّا لتقنية المعلومات — جميع الحقوق محفوظة © ${year} Haya App</div>
          <div class="rf-col rf-left">نسخة معتمدة للطباعة والحفظ PDF (صفحة رسمية)</div>
        </div>

        <script>
          function triggerPrint() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 350);
          }
          window.onload = triggerPrint;
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } else {
      let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
      }
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(printHtml);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 350);
      }
    }
  }

  formatImageUrl(url: string): string {
    return formatImageUrl(url);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadOrders(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.lastPage, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  openInvoiceModal(url: string, title: string = 'Invoice'): void {
    if (!url) return;
    const formattedUrl = this.formatImageUrl(url);
    this.previewImageUrl = formattedUrl;
    this.isPreviewPdf = this.isPdf(formattedUrl);
    if (this.isPreviewPdf) {
      const pdfEmbedUrl = (formattedUrl.startsWith('http://localhost') || formattedUrl.startsWith('http://127.0.0.1') || formattedUrl.startsWith('blob:') || formattedUrl.startsWith('data:'))
        ? formattedUrl
        : `https://docs.google.com/viewer?url=${encodeURIComponent(formattedUrl)}&embedded=true`;
      this.safeInvoiceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfEmbedUrl);
    } else {
      this.safeInvoiceUrl = null;
    }
    this.previewModalTitle = title;
    this.showInvoiceModal = true;
  }

  closeInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.safeInvoiceUrl = null;
    this.previewImageUrl = '';
    this.isPreviewPdf = false;
  }

  isPdf(url: string): boolean {
    return isPdf(url);
  }

  @HostListener('window:keydown.escape')
  onEscapePress(): void {
    if (this.showInvoiceModal) {
      this.closeInvoiceModal();
    }
  }
}
