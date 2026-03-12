import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import download from 'downloadjs';
import { loadNanumSquareFonts, registerNanumSquareFont } from './fontLoader';
import { extractTextElements, TextElement } from './textExtractor';

export const exportToPdf = async (
    elementId: string,
    fileName: string,
    options?: { singlePage?: boolean; fitToPage?: boolean; orientation?: 'portrait' | 'landscape' }
) => {
    // Note: elementId might be passed generally, but we often work with a detached element or a specific ID.
    // In our refactor, we might pass the HTMLElement directly or an ID.
    // The reference uses ID. Let's start with ID but support our cloning strategy.

    // For off-screen cloning, we might append the clone with a specific ID.
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    try {
        // IMPORTANT: Request save location FIRST, before any heavy processing
        // This must happen within 5 seconds of user click (User Activation window)
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
                    // User cancelled the save dialog
                    return;
                }
                console.warn('File System Access API failed, will use fallback:', err);
            }
        }

        toast.loading('PDF 생성 중... (레이아웃 계산 중)', { id: 'pdf-export' });

        // 0. Load Korean font first
        await loadNanumSquareFonts();
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }

        toast.loading('PDF 생성 중... (시각 요소 렌더링 중)', { id: 'pdf-export' });
        await new Promise(resolve => setTimeout(resolve, 500));

        // Ensure small teal text renders clearly in canvas capture
        const bodyClass = 'pdf-exporting';
        document.body.classList.add(bodyClass);
        const exportStyle = document.createElement('style');
        exportStyle.setAttribute('data-pdf-export-style', 'true');
        exportStyle.textContent = `
            /* --- Skill Default CSS --- */
            .pdf-exporting .pdf-improvement-badge {
                background-color: #f0fdfa !important;
                border-color: #ccfbf1 !important;
            }
            .pdf-exporting .pdf-improvement-badge--stacked .pdf-improvement-value {
                color: #0f766e !important;
                -webkit-text-fill-color: #0f766e !important;
                opacity: 1 !important;
                line-height: 1.1 !important;
                transform: translateY(-3px) !important;
            }
            .pdf-exporting .pdf-improvement-label {
                color: #0f766e !important;
                -webkit-text-fill-color: #0f766e !important;
                opacity: 0.7 !important;
            }
            .pdf-exporting .pdf-improvement-badge--stacked .pdf-improvement-label {
                margin-bottom: 2px !important;
                transform: translateY(-2px) !important;
            }
            .pdf-exporting .pdf-improvement-badge:not(.pdf-improvement-badge--stacked) .pdf-improvement-value {
                color: transparent !important;
                -webkit-text-fill-color: transparent !important;
                opacity: 0 !important;
            }
            .pdf-exporting .pdf-improvement-badge:not(.pdf-improvement-badge--stacked) .pdf-improvement-overlay {
                display: flex !important;
                position: absolute !important;
                inset: 0 !important;
                align-items: center !important;
                justify-content: center !important;
                transform: translateY(-4px) !important;
                color: #0f766e !important;
                -webkit-text-fill-color: #0f766e !important;
            }
            .pdf-exporting .pdf-kpi-pill-text {
                display: inline-block !important;
                transform: translateY(-4px) !important;
            }
            .pdf-exporting .pdf-slider-value-text {
                display: inline-block !important;
                transform: translateY(-4px) !important;
            }
            .pdf-exporting .pdf-cta-text {
                display: inline-block !important;
                transform: translateY(-3px) !important;
            }

            /* --- Project Specific CSS (ROI) --- */
            /* Step 4 tweaks */
            .pdf-exporting .pdf-hide-on-export {
                display: none !important;
            }
            .pdf-exporting .recharts-tooltip-wrapper {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* --- PDF Font Size Boosting --- */
            /* 1. Hero Section */
            .pdf-exporting #pdf-hero h2 { font-size: 14px !important; }
            .pdf-exporting .pdf-hero-value { 
                transform: scale(1.2) !important; 
                transform-origin: center; 
                position: relative !important;
                top: -10px !important; /* Aggressive Lift */
                line-height: 0.9 !important; 
                display: flex !important; 
                align-items: center !important; 
                padding-bottom: 0 !important;
                margin-bottom: 5px !important; 
            }
            
            /* Specific fix for LOSS CHECK badge */
            .pdf-exporting .pdf-hero-value .absolute {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding-top: 1px !important; 
                line-height: 1 !important;
                height: 22px !important; 
                top: -24px !important; /* Adjust position relative to new parent scale */
            }

            .pdf-exporting #pdf-hero p { font-size: 16px !important; line-height: 1.6 !important; }

            /* 2. Slider Controls */
            .pdf-exporting label { font-size: 16px !important; color: #1e293b !important; } 
            .pdf-exporting .text-\[11px\] { font-size: 13px !important; line-height: 1.4 !important; } 
            .pdf-exporting .pdf-slider-value-text-pdf { 
                font-size: 16px !important; 
                font-weight: 800 !important; 
                line-height: 1 !important; 
                position: relative !important;
                top: -5px !important; /* Stronger offset for slider values */
                display: inline-block !important;
            }
            .pdf-exporting .pdf-slider-value { 
                display: flex !important; 
                align-items: center !important; 
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                height: 32px !important; 
                padding-top: 4px !important; /* Counter-balance to ensure container size */
            }

            /* 3. KPI Cards */
            .pdf-exporting h4 { font-size: 14px !important; font-weight: 700 !important; } 
            .pdf-exporting .text-2xl { font-size: 2.2rem !important; } 
            .pdf-exporting .text-3xl { font-size: 2.5rem !important; } 
            
            /* KPI Card Value Container */
            .pdf-exporting .text-2xl.flex, 
            .pdf-exporting .text-3xl.flex {
                align-items: center !important; 
                line-height: 1 !important;
                position: relative !important;
                top: -8px !important; 
                margin-top: -2px !important;
            }

            /* 5. Specific Fixes for Bottom ESG Cards - Match Web View */
            /* Green Card Main Number */
            .pdf-exporting .text-5xl {
                font-size: 42px !important; /* Boost significantly */
                line-height: 1 !important;
            }

            /* Carbon/Water Cards: Number + Unit alignment */
            .pdf-exporting #pdf-esg .text-2xl {
                position: relative !important;
                top: -2px !important;
                margin-bottom: 15px !important; 
                display: block !important; 
            }
            
            /* Ensure Unit text is visible and sized right */
            .pdf-exporting #pdf-esg .text-2xl .text-sm {
                font-size: 16px !important;
                transform: none !important; 
            }

            /* 6. Specific Fix for Detail Table Improvement Effect */
            .pdf-exporting .pdf-improvement-badge {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                height: 100% !important;
            }
            .pdf-exporting .pdf-improvement-value {
                position: relative !important;
                top: -3px !important; 
                line-height: 1 !important;
            }
            
            /* 4. Detail Table & ESG */
            .pdf-exporting .text-sm { font-size: 15px !important; }
            .pdf-exporting .text-xs { font-size: 13px !important; }
            .pdf-exporting .font-medium { font-weight: 600 !important; }
        `;
        document.head.appendChild(exportStyle);

        const applyTempStyles = (selector: string, styles: Partial<CSSStyleDeclaration>) => {
            const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
            const originals = elements.map((el) => ({
                el,
                style: el.getAttribute('style') ?? ''
            }));
            elements.forEach((el) => {
                Object.entries(styles).forEach(([key, value]) => {
                    // @ts-ignore - assigning CSSStyleDeclaration dynamically
                    el.style[key] = value as string;
                });
            });
            return () => {
                originals.forEach(({ el, style }) => {
                    if (style) {
                        el.setAttribute('style', style);
                    } else {
                        el.removeAttribute('style');
                    }
                });
            };
        };

        const restoreKpiPill = applyTempStyles('.pdf-kpi-pill-text', {
            display: 'inline-block',
            transform: 'translateY(-4px)',
        });
        const restoreSliderValue = applyTempStyles('.pdf-slider-value-text', {
            display: 'inline-block',
            transform: 'translateY(-4px)',
        });
        const restoreCta = applyTempStyles('.pdf-cta-text', {
            display: 'inline-block',
            transform: 'translateY(-3px)',
        });

        // Reset CSS scale on ancestor element for accurate capture
        // Find the ancestor with scale transform
        let scaleWrapper: HTMLElement | null = element.parentElement;
        let originalTransform = '';
        while (scaleWrapper) {
            if (scaleWrapper.style.transform && scaleWrapper.style.transform.includes('scale')) {
                originalTransform = scaleWrapper.style.transform;
                scaleWrapper.style.transform = 'scale(1)';
                // Force reflow to apply the style change
                void scaleWrapper.offsetHeight;
                break;
            }
            scaleWrapper = scaleWrapper.parentElement;
        }

        // 1. Get original element dimensions
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;

        if (elementWidth === 0 || elementHeight === 0) {
            throw new Error('요소 크기가 유효하지 않습니다. (width 또는 height가 0)');
        }

        // Common PDF Specs
        const isLandscape = options?.orientation === 'landscape';
        const A4_WIDTH_MM = isLandscape ? 297 : 210;
        const A4_HEIGHT_MM = isLandscape ? 210 : 297;
        const PAGE_MARGIN_MM = 0; // Keeping it 0 as requested, though safe split helps.
        const CONTENT_WIDTH_MM = A4_WIDTH_MM - (PAGE_MARGIN_MM * 2);
        const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - (PAGE_MARGIN_MM * 2);

        // Calculate scaling
        const widthScale = CONTENT_WIDTH_MM / elementWidth;
        const heightScale = CONTENT_HEIGHT_MM / elementHeight;
        const pxToMm = options?.fitToPage ? Math.min(widthScale, heightScale) : widthScale;
        const PAGE_HEIGHT_PX = CONTENT_HEIGHT_MM / pxToMm;

        // Smart Page Split Calculation (Only needed if NOT fitToPage and NOT singlePage without fit)
        // Actually, let's keep the splitPoints logic always, but it might not be used if fitToPage is true.
        const splitPoints: number[] = [0];
        let currentSplitY = 0;

        // Iterate through children to find clear break points
        const children = Array.from(element.children) as HTMLElement[];
        // Ensure they are sorted by position
        children.sort((a, b) => a.offsetTop - b.offsetTop);

        for (const child of children) {
            const childTop = child.offsetTop;
            const childHeight = child.offsetHeight;
            const childBottom = childTop + childHeight;

            // Check if this child crosses the current page boundary
            // The boundary is relative to the currentSplitY
            const remainingPageSpace = (currentSplitY + PAGE_HEIGHT_PX) - childTop;

            if (remainingPageSpace < 0) {
                // The element starts AFTER the page boundary.
                // We need to advance currentSplitY to catch up.
                currentSplitY += PAGE_HEIGHT_PX;
                splitPoints.push(currentSplitY);
            }

            // Now check if it FITS in the remaining space
            // If childBottom > currentSplitY + PAGE_HEIGHT_PX
            if (childBottom > currentSplitY + PAGE_HEIGHT_PX) {
                // formatting issue: Child crosses page boundary.

                // Strategy:
                // 1. If child is smaller than a page, MOVE it to the next page.
                // 2. If child is huge, break at page boundary (hard split).

                if (childHeight < PAGE_HEIGHT_PX) {
                    // Move the split point to the TOP of this child.
                    // But only if we aren't already at the top (avoid infinite loop or empty pages if top==currentSplitY)
                    if (childTop > currentSplitY) {
                        currentSplitY = childTop;
                        splitPoints.push(currentSplitY);
                    } else {
                        // It's at the top and still overflows? It's bigger than a page.
                        // Handled by standard flow (hard split loop below).
                    }
                }

                // If we moved the split (currentSplitY = childTop), now check if it overflows the NEW page.
                // Or if we didn't move it (it's huge).
                // We loop to add hard splits for long content.
                while (childBottom > currentSplitY + PAGE_HEIGHT_PX) {
                    currentSplitY += PAGE_HEIGHT_PX;
                    splitPoints.push(currentSplitY);
                }
            }
        }

        // Add final endpoint (total scroll height)
        if (splitPoints[splitPoints.length - 1] < element.scrollHeight) {
            splitPoints.push(element.scrollHeight);
        }

        // Remove duplicates and sort
        const uniqueSplitPoints = Array.from(new Set(splitPoints)).sort((a, b) => a - b);

        // Debug split points only if we are using them
        if (!options?.singlePage) {
            console.log(`PDF Generation: Smart Split Points (px):`, uniqueSplitPoints);
        }

        const elementBounds = element.getBoundingClientRect();

        // Calculate true content height by checking children
        let maxBottom = 0;
        const visibleChildren = Array.from(element.children) as HTMLElement[];
        visibleChildren.forEach(child => {
            // Check if truly visible
            const style = window.getComputedStyle(child);
            if (style.display !== 'none' && style.visibility !== 'hidden' && child.offsetHeight > 0) {
                const bottom = child.offsetTop + child.offsetHeight;
                if (bottom > maxBottom) maxBottom = bottom;
            }
        });

        // Fallback to scrollHeight if calculation fails, otherwise use maxBottom + buffer
        const finalContentHeight = maxBottom > 0 ? maxBottom + 50 : element.scrollHeight;

        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const currentScrollX = window.scrollX || window.pageXOffset || 0;
        const currentScrollY = window.scrollY || window.pageYOffset || 0;
        const captureWidth = Math.ceil(element.scrollWidth);
        const captureHeight = Math.ceil(finalContentHeight);

        // Generate full canvas
        const fullCanvas = await html2canvas(element, {
            scale: 2, // High res for print
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: viewportWidth,
            width: captureWidth,
            height: captureHeight, // Use calculated tight height
            windowHeight: viewportHeight,
            x: 0,
            y: 0,
            // Compensate for current scroll position to avoid vertical offset in output
            scrollX: -currentScrollX,
            scrollY: -currentScrollY,
        });

        document.body.classList.remove(bodyClass);
        exportStyle.remove();
        restoreKpiPill();
        restoreSliderValue();
        restoreCta();

        // Restore original CSS
        if (scaleWrapper && originalTransform) {
            scaleWrapper.style.transform = originalTransform;
        }

        toast.loading('PDF 페이지 분할 및 텍스트 추출 중...', { id: 'pdf-export' });

        let pdf: jsPDF;

        // Pre-extract text elements (positions are relative to the top of the element)
        const textElements: TextElement[] = extractTextElements(
            element,
            elementBounds,
            pxToMm,
            0
        );

        // Pre-extract links
        const linkElements: { x: number, y: number, w: number, h: number, url: string }[] = [];
        element.querySelectorAll('a').forEach((link) => {
            const href = link.getAttribute('href');
            if (!href) return;
            const rect = link.getBoundingClientRect();
            linkElements.push({
                x: (rect.left - elementBounds.left) * pxToMm,
                y: (rect.top - elementBounds.top) * pxToMm,
                w: rect.width * pxToMm,
                h: rect.height * pxToMm,
                url: href
            });
        });

        if (options?.singlePage) {
            console.log("PDF Generation: Single Page Mode active");
            const imgData = fullCanvas.toDataURL('image/jpeg', 0.95);

            if (options?.fitToPage) {
                // Initialize PDF with A4 size and scale content to fit
                pdf = new jsPDF(isLandscape ? 'l' : 'p', 'mm', 'a4');
                registerNanumSquareFont(pdf);

                const renderWidthMm = elementWidth * pxToMm;
                const renderHeightMm = elementHeight * pxToMm;
                const offsetX = PAGE_MARGIN_MM + (CONTENT_WIDTH_MM - renderWidthMm) / 2;
                const offsetY = PAGE_MARGIN_MM + (CONTENT_HEIGHT_MM - renderHeightMm) / 2;

                pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidthMm, renderHeightMm);

                // Add Invisible Text Layer (Single Page A4 Fit)
                const DEBUG_OCR = false;
                // @ts-ignore
                if (!DEBUG_OCR && pdf.GState) { try { pdf.setGState(new pdf.GState({ opacity: 0.01 })); } catch { } }
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('NanumSquare', 'normal');

                textElements.forEach(el => {
                    const finalY = el.y + offsetY;
                    pdf.setFontSize(el.fontSize);
                    pdf.setFont('NanumSquare', el.isBold ? 'bold' : 'normal');
                    pdf.text(el.text, el.x + offsetX, finalY);
                });

                linkElements.forEach(link => {
                    pdf.link(link.x + offsetX, link.y + offsetY, link.w, link.h, { url: link.url });
                });

                // @ts-ignore
                if (!DEBUG_OCR && pdf.GState) { try { pdf.setGState(new pdf.GState({ opacity: 1 })); } catch { } }
            } else {
                // Calculate total height in mm
                // Use actual canvas aspect ratio to prevent distortion!
                const pdfWidth = CONTENT_WIDTH_MM;
                const pdfHeight = (fullCanvas.height * pdfWidth) / fullCanvas.width;

                // Initialize PDF with custom size
                // (Using calculated height instead of elementHeight * pxToMm to be safer against scale issues)
                pdf = new jsPDF('p', 'mm', [A4_WIDTH_MM, pdfHeight + (PAGE_MARGIN_MM * 2)]);

                // Add font
                registerNanumSquareFont(pdf);

                // Add full image
                pdf.addImage(imgData, 'JPEG', PAGE_MARGIN_MM, PAGE_MARGIN_MM, pdfWidth, pdfHeight);

                // Add Invisible Text Layer (Single Page)
                // Debug Text Color
                const DEBUG_OCR = false;
                // @ts-ignore
                if (!DEBUG_OCR && pdf.GState) { try { pdf.setGState(new pdf.GState({ opacity: 0.01 })); } catch { } }

                // Safety: Set color to white in case opacity fails, minimizing visual impact
                pdf.setTextColor(255, 255, 255);

                pdf.setFont('NanumSquare', 'normal');

                // Recalculate scale for text layer if image was adjusted
                // But pxToMm was dynamic? No, pxToMm was constant based on elementWidth.
                // Our image is scaled to CONTENT_WIDTH_MM.
                // elementWidth * pxToMm === CONTENT_WIDTH_MM.
                // So text coordinates should match if elementWidth match.
                // But fullCanvas might be different from elementWidth? 
                // html2canvas scale=2 means fullCanvas.width = elementWidth * 2.
                // pdfHeight calc uses fullCanvas ratio.
                // It should be fine.

                textElements.forEach(el => {
                    const finalY = el.y + PAGE_MARGIN_MM; // No slicing, so just add margin
                    pdf.setFontSize(el.fontSize);
                    pdf.setFont('NanumSquare', el.isBold ? 'bold' : 'normal');
                    pdf.text(el.text, el.x + PAGE_MARGIN_MM, finalY);
                });

                linkElements.forEach(link => {
                    pdf.link(link.x + PAGE_MARGIN_MM, link.y + PAGE_MARGIN_MM, link.w, link.h, { url: link.url });
                });

                // @ts-ignore
                if (!DEBUG_OCR && pdf.GState) { try { pdf.setGState(new pdf.GState({ opacity: 1 })); } catch { } }
            }

        } else {
            // Multi-page Logic (Original)
            pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // Register Fonts
            registerNanumSquareFont(pdf);

            for (let i = 0; i < uniqueSplitPoints.length - 1; i++) {
                if (i > 0) pdf.addPage();

                const startY = uniqueSplitPoints[i];
                const endY = uniqueSplitPoints[i + 1];
                const sliceHeightPx = endY - startY;

                // If the slice is empty or weirdly small, skip?
                if (sliceHeightPx <= 1) continue;

                const canvasScale = fullCanvas.width / elementWidth; // e.g. 2

                // Source rectangle on Full Canvas
                const srcY = startY * canvasScale;
                const srcH = sliceHeightPx * canvasScale;

                // Create temporary canvas for this page slice
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = fullCanvas.width;
                pageCanvas.height = srcH;
                const ctx = pageCanvas.getContext('2d');

                if (ctx) {
                    // Draw slice
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                    ctx.drawImage(
                        fullCanvas,
                        0, srcY, fullCanvas.width, srcH, // Source
                        0, 0, pageCanvas.width, pageCanvas.height // Dest
                    );
                }

                // Convert slice to Image Data
                const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);

                // Add Image to PDF
                // Height in mm
                const imgHeightMm = sliceHeightPx * pxToMm;

                pdf.addImage(pageImgData, 'JPEG', PAGE_MARGIN_MM, PAGE_MARGIN_MM, CONTENT_WIDTH_MM, imgHeightMm);

                // --- Add Text Layer for this Page ---
                const startYMm = startY * pxToMm;
                const endYMm = endY * pxToMm;

                // Debug Text Color
                const DEBUG_OCR = false;
                // @ts-ignore
                if (!DEBUG_OCR && pdf.GState) { try { pdf.setGState(new pdf.GState({ opacity: 0.01 })); } catch { } }

                // Safety: White text
                pdf.setTextColor(255, 255, 255);

                pdf.setFont('NanumSquare', 'normal');

                textElements.forEach(el => {
                    // Check if element belongs to this slice
                    if (el.y >= startYMm && el.y < endYMm) {
                        const localY = el.y - startYMm + PAGE_MARGIN_MM;

                        // Baseline adjustment
                        const fontHeightMm = el.fontSize * 0.353;
                        const baselineOffset = fontHeightMm * 0.80;
                        const finalY = localY + baselineOffset;

                        pdf.setFontSize(el.fontSize);
                        pdf.setFont('NanumSquare', el.isBold ? 'bold' : 'normal');
                        pdf.text(el.text, el.x + PAGE_MARGIN_MM, finalY);
                    }
                });

                // --- Add Links for this Page ---
                linkElements.forEach(link => {
                    if (link.y >= startYMm && link.y < endYMm) {
                        const localY = link.y - startYMm + PAGE_MARGIN_MM;
                        const displayedHeight = Math.min(link.h, (endYMm - startYMm) - (link.y - startYMm));

                        pdf.link(link.x + PAGE_MARGIN_MM, localY, link.w, displayedHeight, { url: link.url });
                    }
                });

                // @ts-ignore
                if (!DEBUG_OCR && pdf.GState) { try { pdf.setGState(new pdf.GState({ opacity: 1 })); } catch { } }
            }
        }

        // 5. Save PDF
        const blob = pdf.output('blob');

        if (fileHandle) {
            // @ts-ignore
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            toast.success('PDF가 저장되었습니다. (저장 위치 확인)', { id: 'pdf-export' });
        } else {
            // Fallback
            download(blob, safeFileName, 'application/pdf');
            toast.success('PDF가 다운로드 폴더에 저장되었습니다. (브라우저 다운로드 확인)', { id: 'pdf-export' });
        }

    } catch (error) {
        console.error('Error exporting to PDF:', error);
        toast.error('PDF 생성 중 오류가 발생했습니다.', { id: 'pdf-export' });
    }
};


