// src/utils/pdfExport.js
import jsPDF from 'jspdf';
import { KPIS_DATA, REVENUE_CHART_DATA, ADS_KPIS_DATA } from '../data/constants';

// Helper to load and rasterize the logo
async function loadLogo() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = '/logo-jannah.svg';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * 4; // High res
            canvas.height = img.height * 4;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            console.warn('Logo load failed, skipping logo in PDF');
            resolve(null);
        };
    });
}

export async function exportDashboardToPDF(kpis = KPIS_DATA, adsKpis = ADS_KPIS_DATA) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Colors
    const primaryColor = [5, 109, 71];
    const accentColor = [238, 180, 23];
    const secondaryColor = [195, 220, 127];
    const darkBg = [18, 32, 44];
    const surfaceDark = [28, 49, 68];
    const textLight = [254, 255, 255];
    const textMuted = [148, 163, 184];

    // Background
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Load and add Logo
    const logoData = await loadLogo();
    if (logoData) {
        // Logo ratio 480x120 = 4:1
        doc.addImage(logoData, 'PNG', margin, 12, 40, 10);
    } else {
        // Fallback text if logo fails
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('JANNAH', margin, 20);
    }


    // Title
    doc.setTextColor(...textLight);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);
    doc.text('RAPPORT CEO — PERFORMANCE DASHBOARD', margin + 45, 23); // Shifted right depending on logo


    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.setTextColor(...textMuted);
    doc.setFontSize(8);
    doc.text(dateStr, pageWidth - margin, 20, { align: 'right' });

    y = 50;

    // Section: KPIs Principaux
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('KPIs PRINCIPAUX', margin, y);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, margin + 40, y + 2);
    y += 10;

    // KPI Cards (2x2 grid)
    const cardW = (contentWidth - 10) / 2;
    const cardH = 28;
    const kpiColors = [
        [34, 197, 94],   // green
        [238, 180, 23],  // accent
        [239, 68, 68],   // red
        [59, 130, 246],  // blue
    ];

    kpis.forEach((kpi, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + col * (cardW + 10);
        const cardY = y + row * (cardH + 6);

        doc.setFillColor(...surfaceDark);
        doc.roundedRect(x, cardY, cardW, cardH, 3, 3, 'F');

        // Color accent bar
        doc.setFillColor(...kpiColors[i]);
        doc.roundedRect(x, cardY, 3, cardH, 1.5, 1.5, 'F');

        doc.setTextColor(...textMuted);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(kpi.label.toUpperCase(), x + 8, cardY + 8);

        doc.setTextColor(...textLight);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, x + 8, cardY + 19);

        doc.setTextColor(...kpiColors[i]);
        doc.setFontSize(8);
        doc.text(kpi.change, x + cardW - 5, cardY + 19, { align: 'right' });

        doc.setTextColor(...textMuted);
        doc.setFontSize(6);
        doc.text('vs mois dernier', x + cardW - 5, cardY + 24, { align: 'right' });
    });

    y += 2 * (cardH + 6) + 15;

    // Section: Revenue Chart (simplified bar chart)
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REVENUS VS DÉPENSES ADS (8 DERNIERS MOIS)', margin, y);
    doc.setDrawColor(...primaryColor);
    doc.line(margin, y + 2, margin + 80, y + 2);
    y += 10;

    const chartH = 55;
    const chartW = contentWidth;
    doc.setFillColor(...surfaceDark);
    doc.roundedRect(margin, y, chartW, chartH, 3, 3, 'F');

    const labels = REVENUE_CHART_DATA.labels;
    const revenues = REVENUE_CHART_DATA.revenue;
    const ads = REVENUE_CHART_DATA.ads;
    const maxVal = Math.max(...revenues);
    const barAreaH = chartH - 20;
    const barAreaW = chartW - 20;
    const barGroupW = barAreaW / labels.length;
    const barW = barGroupW * 0.3;

    labels.forEach((label, i) => {
        const bx = margin + 10 + i * barGroupW;
        const revH = (revenues[i] / maxVal) * barAreaH;
        const adsH = (ads[i] / maxVal) * barAreaH;

        // Revenue bar
        doc.setFillColor(...secondaryColor);
        doc.rect(bx, y + chartH - 15 - revH, barW, revH, 'F');

        // Ads bar
        doc.setFillColor(...accentColor);
        doc.rect(bx + barW + 1, y + chartH - 15 - adsH, barW, adsH, 'F');

        // Label
        doc.setTextColor(...textMuted);
        doc.setFontSize(6);
        doc.text(label, bx + barW, y + chartH - 8, { align: 'center' });
    });

    // Legend
    doc.setFillColor(...secondaryColor);
    doc.rect(margin + chartW - 50, y + 5, 4, 4, 'F');
    doc.setTextColor(...textMuted);
    doc.setFontSize(6);
    doc.text('Revenus', margin + chartW - 44, y + 9);
    doc.setFillColor(...accentColor);
    doc.rect(margin + chartW - 30, y + 5, 4, 4, 'F');
    doc.text('Ads', margin + chartW - 24, y + 9);

    y += chartH + 15;

    // Section: Ads KPIs
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFORMANCE PUBLICITAIRE', margin, y);
    doc.setDrawColor(...primaryColor);
    doc.line(margin, y + 2, margin + 60, y + 2);
    y += 10;

    const adsCardW = (contentWidth - 15) / 4;
    adsKpis.forEach((kpi, i) => {
        const x = margin + i * (adsCardW + 5);
        doc.setFillColor(...surfaceDark);
        doc.roundedRect(x, y, adsCardW, 22, 3, 3, 'F');
        doc.setTextColor(...textMuted);
        doc.setFontSize(6);
        doc.text(kpi.label.toUpperCase(), x + 4, y + 7, { maxWidth: adsCardW - 8 });
        doc.setTextColor(...textLight);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, x + 4, y + 17);
    });

    y += 35;

    // Footer
    doc.setFillColor(...surfaceDark);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    doc.setTextColor(...textMuted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2024 Jannah Agency — Confidentiel — ismael@jannah.co', pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.setTextColor(...primaryColor);
    doc.text('jannah.co', pageWidth - margin, pageHeight - 8, { align: 'right' });

    // Save
    const fileName = `Jannah_Dashboard_${now.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}
