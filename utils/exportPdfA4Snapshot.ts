import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import download from 'downloadjs';

const waitForImages = async (root: HTMLElement): Promise<void> => {
    const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    if (images.length === 0) return;

    await Promise.all(images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
        });
    }));
};

const syncFormValues = (source: HTMLElement, target: HTMLElement): void => {
    const sourceFields = source.querySelectorAll('input, textarea, select');
    const targetFields = target.querySelectorAll('input, textarea, select');

    sourceFields.forEach((src, index) => {
        const dest = targetFields[index] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | undefined;
        if (!dest) return;

        if (src instanceof HTMLInputElement && dest instanceof HTMLInputElement) {
            if (src.type === 'checkbox' || src.type === 'radio') {
                dest.checked = src.checked;
            } else {
                dest.value = src.value;
                dest.setAttribute('value', src.value);
            }
        } else if (src instanceof HTMLTextAreaElement && dest instanceof HTMLTextAreaElement) {
            dest.value = src.value;
            dest.textContent = src.value;
        } else if (src instanceof HTMLSelectElement && dest instanceof HTMLSelectElement) {
            dest.value = src.value;
        }
    });
};

const syncCanvas = (source: HTMLElement, target: HTMLElement): void => {
    const sourceCanvases = source.querySelectorAll('canvas');
    const targetCanvases = target.querySelectorAll('canvas');

    sourceCanvases.forEach((src, index) => {
        const dest = targetCanvases[index] as HTMLCanvasElement | undefined;
        if (!dest) return;
        const ctx = dest.getContext('2d');
        if (!ctx) return;
        try {
            ctx.drawImage(src, 0, 0);
        } catch {
            // Ignore canvas draw failures
        }
    });
};

export const exportToPdfA4Snapshot = async (
    elementId: string,
    fileName: string
) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    const safeFileName = fileName.replace(/[()\/\\:*?"<>|]/g, '_').trim() + '.pdf';
    let fileHandle: FileSystemFileHandle | null = null;

    // @ts-ignore - ShowSaveFilePicker is not yet in standard lib dom types
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
            // @ts-ignore
            fileHandle = await window.showSaveFilePicker({
                suggestedName: safeFileName,
                types: [{
                    description: 'PDF Document',
                    accept: { 'application/pdf': ['.pdf'] },
                }],
            });
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            console.warn('File System Access API failed, will use fallback:', err);
        }
    }

    toast.loading('Preparing PDF...', { id: 'pdf-export' });

    if (document.fonts?.ready) {
        await document.fonts.ready;
    }

    const rect = element.getBoundingClientRect();
    const captureWidth = Math.ceil(rect.width);
    let captureHeight = Math.ceil(element.scrollHeight);

    const wrapper = document.createElement('div');
    wrapper.id = 'pdf-snapshot-root';
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.width = `${captureWidth}px`;
    wrapper.style.height = `${captureHeight}px`;
    wrapper.style.background = '#ffffff';
    wrapper.style.overflow = 'hidden';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '-1';

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = `${captureWidth}px`;
    clone.style.maxWidth = `${captureWidth}px`;
    clone.style.height = `${captureHeight}px`;
    clone.style.margin = '0';
    clone.style.transform = 'none';
    clone.style.boxSizing = 'border-box';
    clone.style.background = '#ffffff';

    const resetStyle = document.createElement('style');
    resetStyle.textContent = `
        #pdf-snapshot-root * {
            animation: none !important;
            transition: none !important;
        }
        #pdf-snapshot-root .pdf-slider-value {
            display: flex !important;
            align-items: center !important;
            height: 32px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
        }
        #pdf-snapshot-root .pdf-slider-value-input {
            display: none !important;
        }
        #pdf-snapshot-root .pdf-slider-value-text-pdf {
            display: inline-block !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
            transform: translateY(-6px) !important;
        }
        #pdf-snapshot-root .pdf-slider-value-unit {
            line-height: 1 !important;
            transform: translateY(-6px) !important;
        }
        #pdf-snapshot-root .pdf-kpi-pill,
        #pdf-snapshot-root .pdf-improvement-badge {
            display: inline-flex !important;
            align-items: center !important;
        }
        #pdf-snapshot-root .pdf-kpi-pill-text,
        #pdf-snapshot-root .pdf-improvement-value,
        #pdf-snapshot-root .pdf-improvement-overlay {
            line-height: 1 !important;
        }
        #pdf-snapshot-root .pdf-hide-on-export {
            display: none !important;
        }
        #pdf-snapshot-root .pdf-footer {
            display: block !important;
            margin-top: 24px !important;
            color: #94a3b8 !important;
            font-size: 12px !important;
        }
        #pdf-snapshot-root .pdf-loss-badge {
            transform: translateY(-8px) !important;
        }
        #pdf-snapshot-root .pdf-cta-button {
            transform: translateY(-6px) !important;
        }
        #pdf-snapshot-root .pdf-kpi-value {
            align-items: center !important;
            line-height: 1 !important;
            transform: translateY(-6px) !important;
        }
        #pdf-snapshot-root .items-baseline {
            align-items: center !important;
        }
        #pdf-snapshot-root #pdf-charts {
            overflow: hidden !important;
        }
    `;

    wrapper.appendChild(resetStyle);
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    clone.querySelectorAll('.pdf-only, .pdf-only-block').forEach((el) => {
        el.classList.remove('hidden');
        if (el.classList.contains('pdf-only')) {
            (el as HTMLElement).style.display = el.classList.contains('pdf-only-flex') ? 'flex' : 'block';
        } else {
            (el as HTMLElement).style.display = 'block';
        }
    });

    const footerText = 'Copyright © FORCS CO., LTD. All rights reserved.';

    // Ensure PDF footer exists inside the capture root (kept hidden; we draw it in PDF to avoid clipping)
    const footerSelector = '.pdf-footer';
    let footer = clone.querySelector(footerSelector) as HTMLElement | null;
    if (!footer) {
        footer = document.createElement('div');
        footer.className = 'pdf-footer mt-6 text-center text-xs text-slate-400';
        footer.textContent = footerText;
        clone.appendChild(footer);
    }
    footer.classList.add('pdf-hide-on-export');
    footer.style.display = 'none';

    // Recalculate height after toggling PDF-only content
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    wrapper.style.height = 'auto';
    const updatedHeight = Math.ceil(clone.scrollHeight);
    if (updatedHeight !== captureHeight) {
        captureHeight = updatedHeight;
    }
    wrapper.style.height = `${captureHeight}px`;

    syncFormValues(element, clone);
    syncCanvas(element, clone);
    await waitForImages(clone);

    const linkTargets = Array.from(clone.querySelectorAll('[data-pdf-link]')) as HTMLElement[];
    const rootRect = clone.getBoundingClientRect();
    const linkRects = linkTargets
        .map((el) => {
            const rect = el.getBoundingClientRect();
            const href = el.getAttribute('data-pdf-link');
            if (!href || rect.width === 0 || rect.height === 0) return null;
            return {
                href,
                x: rect.left - rootRect.left,
                y: rect.top - rootRect.top + 6,
                w: rect.width,
                h: rect.height,
            };
        })
        .filter((item): item is { href: string; x: number; y: number; w: number; h: number } => Boolean(item));

    toast.loading('Capturing screen...', { id: 'pdf-export' });

    const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: captureWidth,
        height: captureHeight,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        scrollX: 0,
        scrollY: 0,
    });

    wrapper.remove();

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const footerHeightMm = 6;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let imgWidthMm = pageWidth;
    let imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    const maxImgHeightMm = pageHeight - footerHeightMm;
    if (imgHeightMm > maxImgHeightMm) {
        imgHeightMm = maxImgHeightMm;
        imgWidthMm = (canvas.width * imgHeightMm) / canvas.height;
    }

    const offsetX = (pageWidth - imgWidthMm) / 2;
    const offsetY = 0;

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgWidthMm, imgHeightMm, undefined, 'FAST');

    const scaleX = imgWidthMm / captureWidth;
    const scaleY = imgHeightMm / captureHeight;
    linkRects.forEach((link) => {
        pdf.link(
            offsetX + link.x * scaleX,
            offsetY + link.y * scaleY,
            link.w * scaleX,
            link.h * scaleY,
            { url: link.href }
        );
    });

    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text(footerText, pageWidth / 2, pageHeight - 2, { align: 'center' });

    const blob = pdf.output('blob');

    if (fileHandle) {
        // @ts-ignore
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast.success('PDF saved.', { id: 'pdf-export' });
    } else {
        download(blob, safeFileName, 'application/pdf');
        toast.success('PDF downloaded.', { id: 'pdf-export' });
    }
};
