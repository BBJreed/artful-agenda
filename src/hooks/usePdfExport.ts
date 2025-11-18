import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { CalendarEvent, TaskItem } from '../types';
import 'jspdf-autotable';

interface PdfExportState {
  isExporting: boolean;
  progress: number;
  error: string | null;
  exportedUrl: string | null;
}

interface PdfExportOptions {
  fileName?: string;
  pageSize?: 'a4' | 'letter' | 'legal' | 'a3' | 'a5';
  orientation?: 'portrait' | 'landscape';
  includeHeader?: boolean;
  includeFooter?: boolean;
  template?: 'minimal' | 'professional' | 'colorful' | 'custom';
  encrypt?: boolean;
  password?: string;
  addWatermark?: boolean;
  watermarkText?: string;
  compress?: boolean;
}

interface TemplateStyle {
  headerColor: [number, number, number];
  textColor: [number, number, number];
  accentColor: [number, number, number];
  fontFamily: string;
}

const templateStyles: Record<string, TemplateStyle> = {
  minimal: {
    headerColor: [0, 0, 0],
    textColor: [0, 0, 0],
    accentColor: [100, 100, 100],
    fontFamily: 'helvetica'
  },
  professional: {
    headerColor: [0, 102, 204],
    textColor: [0, 0, 0],
    accentColor: [0, 102, 204],
    fontFamily: 'times'
  },
  colorful: {
    headerColor: [255, 102, 102],
    textColor: [50, 50, 50],
    accentColor: [102, 204, 255],
    fontFamily: 'courier'
  }
};

export const usePdfExport = (options: PdfExportOptions = {}) => {
  const {
    fileName = 'artful-agenda-export',
    pageSize = 'a4',
    orientation = 'portrait',
    includeHeader = true,
    includeFooter = true,
    template = 'professional',
    encrypt = false,
    password = '',
    addWatermark = false,
    watermarkText = 'Artful Agenda',
    compress = true
  } = options;
  
  const [state, setState] = useState<PdfExportState>({
    isExporting: false,
    progress: 0,
    error: null,
    exportedUrl: null
  });
  
  // Apply template styles to document
  const applyTemplate = useCallback((doc: jsPDF, style: TemplateStyle) => {
    doc.setFont(style.fontFamily as any);
  }, []);
  
  // Add watermark to document
  const addDocumentWatermark = useCallback((doc: jsPDF, text: string) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(40);
      doc.text(text, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      } as any);
    }
  }, []);
  
  // Export calendar events to PDF
  const exportEvents = useCallback(async (events: CalendarEvent[], title: string = 'Calendar Events') => {
    setState(prev => ({ ...prev, isExporting: true, progress: 0, error: null }));
    
    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize
      });
      
      const style = templateStyles[template] || templateStyles.professional;
      applyTemplate(doc, style);
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;
      
      // Add header
      if (includeHeader) {
        doc.setFontSize(22);
        doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
        doc.text(title, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
        doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 20;
      }
      
      // Add events using autotable for better formatting
      const tableData = events.map(event => [
        event.title,
        `${event.startTime.toLocaleDateString()} ${event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        `${event.endTime.toLocaleDateString()} ${event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        event.description || ''
      ]);
      
      (doc as any).autoTable({
        head: [['Title', 'Start Time', 'End Time', 'Description']],
        body: tableData,
        startY: yPosition,
        styles: {
          font: style.fontFamily,
          textColor: style.textColor
        },
        headStyles: {
          fillColor: style.headerColor
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      // Add footer
      if (includeFooter) {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' } as any
          );
        }
      }
      
      // Add watermark if requested
      if (addWatermark) {
        addDocumentWatermark(doc, watermarkText);
      }
      
      // Encrypt if requested
      if (encrypt && password) {
        (doc as any).encrypt(password);
      }
      
      // Save PDF
      const pdfData = doc.output('datauristring');
      const pdfBlob = dataURItoBlob(pdfData);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setState(prev => ({
        ...prev,
        isExporting: false,
        progress: 100,
        exportedUrl: pdfUrl
      }));
      
      // Trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return pdfUrl;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: 'Failed to export PDF'
      }));
      
      return null;
    }
  }, [fileName, pageSize, orientation, includeHeader, includeFooter, template, encrypt, password, addWatermark, watermarkText, compress, applyTemplate, addDocumentWatermark]);
  
  // Export tasks to PDF
  const exportTasks = useCallback(async (tasks: TaskItem[], title: string = 'Tasks') => {
    setState(prev => ({ ...prev, isExporting: true, progress: 0, error: null }));
    
    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize
      });
      
      const style = templateStyles[template] || templateStyles.professional;
      applyTemplate(doc, style);
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;
      
      // Add header
      if (includeHeader) {
        doc.setFontSize(22);
        doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
        doc.text(title, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
        doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 20;
      }
      
      // Add tasks using autotable
      const tableData = tasks.map(task => [
        task.completed ? '✓' : '○',
        task.content,
        new Date(task.date).toLocaleDateString(),
        task.priority
      ]);
      
      (doc as any).autoTable({
        head: [['Status', 'Task', 'Due Date', 'Priority']],
        body: tableData,
        startY: yPosition,
        styles: {
          font: style.fontFamily,
          textColor: style.textColor
        },
        headStyles: {
          fillColor: style.headerColor
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      // Add priority chart
      doc.setFontSize(14);
      doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
      doc.text('Priority Distribution', 20, yPosition);
      yPosition += 10;
      
      const priorityCounts = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      };
      
      const totalTasks = tasks.length;
      if (totalTasks > 0) {
        const barHeight = 10;
        const maxWidth = 100;
        
        // High priority
        doc.setFillColor(255, 0, 0);
        doc.rect(20, yPosition, (priorityCounts.high / totalTasks) * maxWidth, barHeight, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(`High: ${priorityCounts.high}`, 25, yPosition + 8);
        yPosition += 15;
        
        // Medium priority
        doc.setFillColor(255, 165, 0);
        doc.rect(20, yPosition, (priorityCounts.medium / totalTasks) * maxWidth, barHeight, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(`Medium: ${priorityCounts.medium}`, 25, yPosition + 8);
        yPosition += 15;
        
        // Low priority
        doc.setFillColor(0, 255, 0);
        doc.rect(20, yPosition, (priorityCounts.low / totalTasks) * maxWidth, barHeight, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(`Low: ${priorityCounts.low}`, 25, yPosition + 8);
        yPosition += 20;
      }
      
      // Add footer
      if (includeFooter) {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' } as any
          );
        }
      }
      
      // Add watermark if requested
      if (addWatermark) {
        addDocumentWatermark(doc, watermarkText);
      }
      
      // Encrypt if requested
      if (encrypt && password) {
        (doc as any).encrypt(password);
      }
      
      // Save PDF
      const pdfData = doc.output('datauristring');
      const pdfBlob = dataURItoBlob(pdfData);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setState(prev => ({
        ...prev,
        isExporting: false,
        progress: 100,
        exportedUrl: pdfUrl
      }));
      
      // Trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${fileName}-tasks.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return pdfUrl;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: 'Failed to export tasks PDF'
      }));
      
      return null;
    }
  }, [fileName, pageSize, orientation, includeHeader, includeFooter, template, encrypt, password, addWatermark, watermarkText, compress, applyTemplate, addDocumentWatermark]);
  
  // Export combined report
  const exportReport = useCallback(async (
    events: CalendarEvent[], 
    tasks: TaskItem[], 
    title: string = 'Agenda Report'
  ) => {
    setState(prev => ({ ...prev, isExporting: true, progress: 0, error: null }));
    
    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize
      });
      
      const style = templateStyles[template] || templateStyles.professional;
      applyTemplate(doc, style);
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;
      
      // Add header
      if (includeHeader) {
        doc.setFontSize(22);
        doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
        doc.text(title, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
        doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 20;
      }
      
      // Add statistics
      doc.setFontSize(16);
      doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
      doc.text('Statistics', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(style.textColor[0], style.textColor[1], style.textColor[2]);
      doc.text(`Total Events: ${events.length}`, 25, yPosition);
      yPosition += 7;
      
      doc.text(`Total Tasks: ${tasks.length}`, 25, yPosition);
      yPosition += 7;
      
      const completedTasks = tasks.filter(t => t.completed).length;
      doc.text(`Completed Tasks: ${completedTasks}/${tasks.length} (${tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%)`, 25, yPosition);
      yPosition += 15;
      
      // Add events section
      if (events.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
        doc.text('Upcoming Events', 20, yPosition);
        yPosition += 10;
        
        // Add events table
        const upcomingEvents = events
          .filter(e => e.startTime >= new Date())
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          .slice(0, 5);
        
        if (upcomingEvents.length > 0) {
          const tableData = upcomingEvents.map(event => [
            event.title,
            event.startTime.toLocaleDateString(),
            event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          ]);
          
          (doc as any).autoTable({
            head: [['Event', 'Date', 'Time']],
            body: tableData,
            startY: yPosition,
            styles: {
              font: style.fontFamily,
              textColor: style.textColor
            },
            headStyles: {
              fillColor: style.headerColor
            }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(12);
          doc.setTextColor(style.textColor[0], style.textColor[1], style.textColor[2]);
          doc.text('No upcoming events', 25, yPosition);
          yPosition += 10;
        }
      }
      
      // Add tasks section
      if (tasks.length > 0) {
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
        doc.text('Recent Tasks', 20, yPosition);
        yPosition += 10;
        
        // Add tasks table
        const recentTasks = tasks.slice(0, 5);
        const tableData = recentTasks.map(task => [
          task.completed ? '✓' : '○',
          task.content,
          new Date(task.date).toLocaleDateString()
        ]);
        
        (doc as any).autoTable({
          head: [['Status', 'Task', 'Due Date']],
          body: tableData,
          startY: yPosition,
          styles: {
            font: style.fontFamily,
            textColor: style.textColor
          },
          headStyles: {
            fillColor: style.headerColor
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Add footer
      if (includeFooter) {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' } as any
          );
        }
      }
      
      // Add watermark if requested
      if (addWatermark) {
        addDocumentWatermark(doc, watermarkText);
      }
      
      // Encrypt if requested
      if (encrypt && password) {
        (doc as any).encrypt(password);
      }
      
      // Save PDF
      const pdfData = doc.output('datauristring');
      const pdfBlob = dataURItoBlob(pdfData);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setState(prev => ({
        ...prev,
        isExporting: false,
        progress: 100,
        exportedUrl: pdfUrl
      }));
      
      // Trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${fileName}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return pdfUrl;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: 'Failed to export report PDF'
      }));
      
      return null;
    }
  }, [fileName, pageSize, orientation, includeHeader, includeFooter, template, encrypt, password, addWatermark, watermarkText, compress, applyTemplate, addDocumentWatermark]);
  
  // Export with custom HTML content
  const exportHtmlContent = useCallback(async (htmlContent: string, title: string = 'Custom Content') => {
    setState(prev => ({ ...prev, isExporting: true, progress: 0, error: null }));
    
    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize
      });
      
      const style = templateStyles[template] || templateStyles.professional;
      applyTemplate(doc, style);
      
      // Add header
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 20;
      
      if (includeHeader) {
        doc.setFontSize(22);
        doc.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
        doc.text(title, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
        doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' } as any);
        yPosition += 20;
      }
      
      // Add HTML content (basic implementation)
      doc.setFontSize(12);
      doc.setTextColor(style.textColor[0], style.textColor[1], style.textColor[2]);
      
      // Simple HTML to text conversion (in a real app, you'd use a library like html2canvas)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      const lines = doc.splitTextToSize(textContent, pageWidth - 40);
      doc.text(lines, 20, yPosition);
      
      // Add watermark if requested
      if (addWatermark) {
        addDocumentWatermark(doc, watermarkText);
      }
      
      // Encrypt if requested
      if (encrypt && password) {
        (doc as any).encrypt(password);
      }
      
      // Save PDF
      const pdfData = doc.output('datauristring');
      const pdfBlob = dataURItoBlob(pdfData);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setState(prev => ({
        ...prev,
        isExporting: false,
        progress: 100,
        exportedUrl: pdfUrl
      }));
      
      // Trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${fileName}-content.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return pdfUrl;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: 'Failed to export HTML content PDF'
      }));
      
      return null;
    }
  }, [fileName, pageSize, orientation, includeHeader, template, encrypt, password, addWatermark, watermarkText, compress, applyTemplate, addDocumentWatermark]);
  
  // Helper function to convert data URI to Blob
  const dataURItoBlob = (dataURI: string): Blob => {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    
    // Separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    // Write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ia], { type: mimeString });
  };
  
  // Clear export state
  const clearExport = useCallback(() => {
    if (state.exportedUrl) {
      URL.revokeObjectURL(state.exportedUrl);
    }
    
    setState(prev => ({
      ...prev,
      isExporting: false,
      progress: 0,
      error: null,
      exportedUrl: null
    }));
  }, [state.exportedUrl]);
  
  return {
    ...state,
    exportEvents,
    exportTasks,
    exportReport,
    exportHtmlContent,
    clearExport
  };
};