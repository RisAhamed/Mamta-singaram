import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './PrescriptionPad.css';

const doctorsData = {
  ashok: {
    name: 'Dr. B.V. ASHOK, MDS.,',
    title: 'Professor, Conservative Dentist and Endodontist.',
    regNo: 'Reg. No : 7102',
    phone: '9884310206',
    email: 'akdental2021@gmail.com'
  },
  mamta: {
    name: 'Dr. Mamta Singaram, MDS.,',
    title: 'Oral maxillo facial & Implant Surgeon',
    regNo: '',
    phone: '95979 84160',
    email: 'akdental2021@gmail.com'
  }
};

function PrescriptionPad() {
    const { doctorId } = useParams();
    const billRef = useRef(null);

    // Resolve doctor data, default to Dr. Ashok if not found
    const doctorKey = (doctorId || 'ashok').toLowerCase();
    const doctor = doctorsData[doctorKey] || doctorsData.ashok;

    const autoResizeInput = (input) => {
        if (!input) return;
        // Create a hidden measurer span that mimics the input's font
        const measurer = document.createElement('span');
        measurer.style.cssText = `
            visibility: hidden;
            position: absolute;
            white-space: pre;
            font-size: ${getComputedStyle(input).fontSize};
            font-family: ${getComputedStyle(input).fontFamily};
            font-weight: ${getComputedStyle(input).fontWeight};
            letter-spacing: ${getComputedStyle(input).letterSpacing};
        `;
        measurer.textContent = input.value || input.placeholder;
        document.body.appendChild(measurer);
        const width = measurer.getBoundingClientRect().width;
        document.body.removeChild(measurer);
        input.style.width = `${Math.max(80, Math.ceil(width) + 10)}px`;
    };

    const autoResizeTextarea = (textarea) => {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const getBase64Image = (url) => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                } else {
                    resolve(url);
                }
            };
            img.onerror = () => resolve(url);
            img.src = url + '?t=' + Date.now();
        });
    };

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('billDate');
        if (dateInput) {
            dateInput.value = today;
        }
        const nameInput = document.getElementById('patientName');
        if (nameInput) autoResizeInput(nameInput);
    }, []);

    const updateEmptyRowClasses = () => {
        for (let i = 1; i <= 10; i++) {
            const row = document.getElementById(`procedure-row-${i}`);
            const nameInput = document.getElementById(`proc${i}Name`);
            const dateInput = document.getElementById(`proc${i}Date`);
            if (!row) continue;
            const nameEmpty = !nameInput?.value?.trim();
            const dateEmpty = !dateInput?.value?.trim();
            if (nameEmpty && dateEmpty) {
                row.classList.add('row-empty');
            } else {
                row.classList.remove('row-empty');
            }
        }
    };

    const handlePrint = () => {
        updateEmptyRowClasses();
        window.print();
    };

    const downloadPDF = async () => {
        const bill = billRef.current;
        if (!bill) return;

        const rawDate = document.getElementById('billDate')?.value || '';
        const date = rawDate ? rawDate.split('-').reverse().join('-') : 'Date';

        // ─── Track everything we modify for cleanup ───
        const allProcRows = [];
        const rowWasHidden = [];
        let logoImg = null;
        let origLogoSrc = '';
        let billDateInput = null;
        const procDateInputs = [];
        const procFormattedSpans = [];
        // Track all form fields we replace with divs for html2canvas
        const replacedFields = []; // { field, placeholder, parent }

        // ─── Helper: replace a form field (input/textarea) with a plain div ───
        // html2canvas cannot render text inside form fields properly — it clips them.
        // So we swap each field for a styled <div> containing the same text.
        const replaceFieldWithDiv = (field) => {
            if (!field || !field.parentNode) return;
            const value = field.value || '';
            const computed = getComputedStyle(field);
            const div = document.createElement('div');
            div.className = 'pdf-text-replacement';
            div.style.cssText = `
                font-size: ${computed.fontSize};
                font-family: ${computed.fontFamily};
                font-weight: ${computed.fontWeight};
                color: ${computed.color};
                letter-spacing: ${computed.letterSpacing};
                line-height: ${computed.lineHeight};
                padding: ${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft};
                border: none;
                border-bottom: ${computed.borderBottomWidth} ${computed.borderBottomStyle} ${computed.borderBottomColor};
                background: transparent;
                white-space: pre-wrap;
                word-break: break-word;
                overflow-wrap: break-word;
                min-height: ${computed.height};
                width: auto;
                box-sizing: ${computed.boxSizing};
                text-align: ${computed.textAlign};
                display: ${computed.display};
                vertical-align: ${computed.verticalAlign};
                min-width: ${computed.minWidth || '0'};
            `;
            div.textContent = value;
            field.parentNode.insertBefore(div, field);
            field.style.display = 'none';
            replacedFields.push({ field, placeholder: div });
        };

        // ─── Replace ALL procedure name textareas with plain divs ───
        for (let i = 1; i <= 10; i++) {
            const textarea = document.getElementById(`proc${i}Name`);
            if (textarea && textarea.value.trim()) {
                replaceFieldWithDiv(textarea);
            }
        }

        // ─── Replace key input fields with plain divs ───
        const fieldsToReplace = ['patientName', 'patientAge', 'billNo', 'amount'];
        fieldsToReplace.forEach((id) => {
            const field = document.getElementById(id);
            if (field && field.value.trim()) {
                replaceFieldWithDiv(field);
            }
        });

        // ─── Inject formatted bill-date span ───
        billDateInput = document.getElementById('billDate');
        const formattedSpan = document.createElement('span');
        formattedSpan.id = 'billDateFormatted';
        formattedSpan.style.cssText = 'font-size:inherit;color:inherit;font-family:inherit;';
        formattedSpan.textContent = date;
        if (billDateInput?.parentNode) {
            billDateInput.parentNode.insertBefore(formattedSpan, billDateInput.nextSibling);
            billDateInput.style.display = 'none';
        }

        // ─── Inject formatted procedure-date spans ───
        for (let i = 1; i <= 10; i++) {
            const procDateInput = document.getElementById(`proc${i}Date`);
            if (!procDateInput) continue;
            const rawProcDate = procDateInput.value || '';
            if (!rawProcDate) {
                procDateInputs.push(procDateInput);
                procFormattedSpans.push(document.createElement('span'));
                continue;
            }
            const formattedProcDate = rawProcDate.split('-').reverse().join('-');
            const procSpan = document.createElement('span');
            procSpan.className = 'proc-date-formatted';
            procSpan.style.cssText = 'font-size:inherit;color:inherit;font-family:inherit;font-weight:inherit;';
            procSpan.textContent = formattedProcDate;
            procDateInput.parentNode?.insertBefore(procSpan, procDateInput.nextSibling);
            procDateInput.style.display = 'none';
            procDateInputs.push(procDateInput);
            procFormattedSpans.push(procSpan);
        }

        // ─── Convert logo to base64 ───
        logoImg = bill.querySelector('.clinic-logo');
        origLogoSrc = logoImg?.src || '';
        if (logoImg) {
            const base64src = await getBase64Image('/logo.jpeg');
            logoImg.src = base64src;
            await new Promise((resolve) => {
                if (logoImg.complete) { resolve(); return; }
                logoImg.onload = () => resolve();
                logoImg.onerror = () => resolve();
            });
        }

        // ─── Wait for all images ───
        const images = Array.from(bill.querySelectorAll('img'));
        await Promise.all(images.map((img) => new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) { resolve(); return; }
            img.onload = () => resolve();
            img.onerror = () => resolve();
        })));

        window.scrollTo(0, 0);

        // ─── Hide toolbar ───
        const toolbar = document.querySelector('.toolbar');
        const origToolbarDisplay = toolbar?.style.display || '';
        if (toolbar) toolbar.style.display = 'none';

        // ─── Mark & hide empty procedure rows ───
        updateEmptyRowClasses();
        for (let i = 1; i <= 10; i++) {
            const row = document.getElementById(`procedure-row-${i}`);
            if (!row) continue;
            allProcRows.push(row);
            if (row.classList.contains('row-empty')) {
                rowWasHidden.push(true);
                row.style.display = 'none';
                row.style.height = '0';
                row.style.margin = '0';
                row.style.padding = '0';
                row.style.overflow = 'hidden';
            } else {
                rowWasHidden.push(false);
            }
        }

        // ─── Save original bill styles ───
        const origStyles = {
            position: bill.style.position,
            left: bill.style.left,
            top: bill.style.top,
            margin: bill.style.margin,
            width: bill.style.width,
            minWidth: bill.style.minWidth,
            maxWidth: bill.style.maxWidth,
            boxSizing: bill.style.boxSizing,
            height: bill.style.height,
            minHeight: bill.style.minHeight,
            boxShadow: bill.style.boxShadow,
            borderRadius: bill.style.borderRadius,
            zIndex: bill.style.zIndex,
            overflow: bill.style.overflow,
        };

        // ─── A4 at 96 dpi ───
        const A4_W = 794;

        // ─── Lock bill to A4 width, let height grow naturally ───
        bill.style.width = `${A4_W}px`;
        bill.style.minWidth = `${A4_W}px`;
        bill.style.maxWidth = `${A4_W}px`;
        bill.style.boxSizing = 'border-box';
        bill.style.height = 'auto';
        bill.style.minHeight = '1123px';
        bill.style.boxShadow = 'none';
        bill.style.borderRadius = '0';
        bill.style.zIndex = '9999';
        bill.style.overflow = 'visible';

        // ─── Force flex on key layout elements ───
        const headerDetails = bill.querySelector('.header-details');
        const headerLeft = bill.querySelector('.header-left');
        const sigSection = bill.querySelector('.signatures-section');
        const billMeta = bill.querySelector('.bill-meta');
        const billForm = bill.querySelector('.bill-form');
        const origHDDisplay = headerDetails?.style.display || '';
        const origHDFlexDir = headerDetails?.style.flexDirection || '';
        const origHDJustify = headerDetails?.style.justifyContent || '';
        const origHLDisplay = headerLeft?.style.display || '';
        const origHLAlign = headerLeft?.style.alignItems || '';
        const origSigDisplay = sigSection?.style.display || '';
        const origSigJustify = sigSection?.style.justifyContent || '';
        const origBMDisplay = billMeta?.style.display || '';
        const origFormDisplay = billForm?.style.display || '';
        const origFormFlex = billForm?.style.flex || '';
        const origFormFlexDir = billForm?.style.flexDirection || '';

        if (headerDetails) {
            headerDetails.style.display = 'flex';
            headerDetails.style.flexDirection = 'row';
            headerDetails.style.justifyContent = 'space-between';
            headerDetails.style.alignItems = 'flex-start';
        }
        if (headerLeft) {
            headerLeft.style.display = 'flex';
            headerLeft.style.flexDirection = 'row';
            headerLeft.style.alignItems = 'center';
            headerLeft.style.gap = '12px';
        }
        if (sigSection) {
            sigSection.style.display = 'flex';
            sigSection.style.flexDirection = 'row';
            sigSection.style.justifyContent = 'space-between';
            sigSection.style.alignItems = 'flex-start';
            sigSection.style.flexShrink = '0';
        }
        if (billMeta) {
            billMeta.style.display = 'flex';
            billMeta.style.flexDirection = 'row';
            billMeta.style.justifyContent = 'space-between';
        }
        if (billForm) {
            billForm.style.display = 'flex';
            billForm.style.flexDirection = 'column';
            billForm.style.flex = '1';
        }

        const procedureRows = Array.from(bill.querySelectorAll('.procedure-row'));
        const origProcRowStyles = procedureRows.map((row) => ({
            display: row.style.display,
            flexDirection: row.style.flexDirection,
            justifyContent: row.style.justifyContent,
            alignItems: row.style.alignItems,
        }));
        procedureRows.forEach((row) => {
            row.style.display = 'flex';
            row.style.flexDirection = 'row';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'flex-start';
        });

        const billSpacer = bill.querySelector('.bill-spacer');
        const origSpacerFlex = billSpacer?.style.flex || '';
        const origSpacerMinHeight = billSpacer?.style.minHeight || '';
        const origSpacerHeight = billSpacer?.style.height || '';

        if (billSpacer) {
            billSpacer.style.flex = '1';
            billSpacer.style.minHeight = '0';
            billSpacer.style.height = 'auto';
        }

        // Wait two frames for layout to fully settle
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // Measure actual height after all replacements and layout
        const captureH = Math.max(1123, bill.scrollHeight);

        const restoreStyles = () => {
            bill.style.position = origStyles.position;
            bill.style.left = origStyles.left;
            bill.style.top = origStyles.top;
            bill.style.margin = origStyles.margin;
            bill.style.width = origStyles.width;
            bill.style.minWidth = origStyles.minWidth;
            bill.style.maxWidth = origStyles.maxWidth;
            bill.style.boxSizing = origStyles.boxSizing;
            bill.style.height = origStyles.height;
            bill.style.minHeight = origStyles.minHeight;
            bill.style.boxShadow = origStyles.boxShadow;
            bill.style.borderRadius = origStyles.borderRadius;
            bill.style.zIndex = origStyles.zIndex;
            bill.style.overflow = origStyles.overflow;

            if (headerDetails) {
                headerDetails.style.display = origHDDisplay;
                headerDetails.style.flexDirection = origHDFlexDir;
                headerDetails.style.justifyContent = origHDJustify;
                headerDetails.style.alignItems = '';
            }
            if (headerLeft) {
                headerLeft.style.display = origHLDisplay;
                headerLeft.style.alignItems = origHLAlign;
                headerLeft.style.flexDirection = '';
                headerLeft.style.gap = '';
            }
            if (sigSection) {
                sigSection.style.display = origSigDisplay;
                sigSection.style.justifyContent = origSigJustify;
                sigSection.style.flexDirection = '';
                sigSection.style.alignItems = '';
                sigSection.style.flexShrink = '';
            }
            if (billMeta) {
                billMeta.style.display = origBMDisplay;
                billMeta.style.flexDirection = '';
                billMeta.style.justifyContent = '';
            }
            if (billForm) {
                billForm.style.display = origFormDisplay;
                billForm.style.flex = origFormFlex;
                billForm.style.flexDirection = origFormFlexDir;
            }

            procedureRows.forEach((row, idx) => {
                row.style.display = origProcRowStyles[idx].display;
                row.style.flexDirection = origProcRowStyles[idx].flexDirection;
                row.style.justifyContent = origProcRowStyles[idx].justifyContent;
                row.style.alignItems = origProcRowStyles[idx].alignItems;
            });

            if (billSpacer) {
                billSpacer.style.flex = origSpacerFlex;
                billSpacer.style.minHeight = origSpacerMinHeight;
                billSpacer.style.height = origSpacerHeight;
            }

            if (toolbar) toolbar.style.display = origToolbarDisplay;

            allProcRows.forEach((row, idx) => {
                if (rowWasHidden[idx]) {
                    row.style.display = '';
                    row.style.height = '';
                    row.style.margin = '';
                    row.style.padding = '';
                    row.style.overflow = '';
                }
            });
            for (let i = 1; i <= 10; i++) {
                const row = document.getElementById(`procedure-row-${i}`);
                if (row) row.classList.remove('row-empty');
            }

            if (logoImg) logoImg.src = origLogoSrc;

            const fSpan = document.getElementById('billDateFormatted');
            if (fSpan) fSpan.remove();
            if (billDateInput) billDateInput.style.display = '';

            procDateInputs.forEach((inp, idx) => {
                const span = procFormattedSpans[idx];
                if (span?.parentNode) span.parentNode.removeChild(span);
                if (inp) inp.style.display = '';
            });

            // ─── Restore all replaced form fields ───
            replacedFields.forEach(({ field, placeholder }) => {
                if (placeholder?.parentNode) placeholder.parentNode.removeChild(placeholder);
                if (field) field.style.display = '';
            });
        };

        try {
            const canvas = await html2canvas(bill, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                width: A4_W,
                windowWidth: A4_W,
                scrollX: 0,
                scrollY: 0,
                windowHeight: captureH,
                height: captureH,
                logging: false,
            });

            restoreStyles();

            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.97);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

            const patientName = document.getElementById('patientName')?.value?.trim() || 'Patient';
            const sanitizedName = patientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yyyy = now.getFullYear();
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            const timestamp = `${dd}-${mm}-${yyyy}_${hh}-${min}-${ss}`;

            const filename = `AK_Dental_${sanitizedName}_${timestamp}.pdf`;

            pdf.save(filename);
        } catch (err) {
            console.error('PDF generation failed:', err);
            restoreStyles();
        }
    };

    const clearFields = () => {
        if (window.confirm('Are you sure you want to clear all fields?')) {
            document.getElementById('bill-form')?.reset();
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('billDate');
            if (dateInput) {
                dateInput.value = today;
            }
        }
    };

    return (
        <div className="prescription-pad-page">
            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-brand">
                    AK MULTI SPECIALITY DENTAL CLINIC
                </div>
                <div className="action-buttons">
                    <button className="btn-primary" onClick={handlePrint} aria-label="Print Bill">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print
                    </button>
                    <button className="btn-secondary" onClick={downloadPDF} aria-label="Download PDF">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        PDF
                    </button>
                    <button className="btn-danger" onClick={clearFields} aria-label="Clear Form">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Clear
                    </button>
                </div>
            </div>

            {/* App Shell */}
            <div className="app-shell">
                <div className="bill-container" id="bill-container" ref={billRef}>

                    {/* Header */}
                    <header className="bill-header">
                        <h1 className="clinic-name" style={{ marginBottom: '4px' }}>AK MULTI SPECIALITY DENTAL CLINIC</h1>
                        <div className="address-line" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                            #34, 2nd Avenue, 1st floor, Besant Nagar, Chennai - 600090
                        </div>
                        <div className="header-details">
                            <div className="header-left">
                                <img
                                    src="/logo.jpeg"
                                    alt="AK Dental Logo"
                                    className="clinic-logo"
                                    crossOrigin="anonymous"
                                />
                                <div className="doctor-info">
                                    <div className="doctor-name">{doctor.name}</div>
                                    <div className="doctor-title">
                                        {doctor.title.split('\n').map((line, idx) => (
                                            <span key={idx}>
                                                {line}
                                                {idx < doctor.title.split('\n').length - 1 && <br />}
                                            </span>
                                        ))}
                                        {doctor.regNo && (
                                            <>
                                                <br />
                                                {doctor.regNo}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="header-right">
                                <div className="contact-info" style={{ marginTop: '4px' }}>Mobile: {doctor.phone}</div>
                                <div className="contact-info" style={{ marginTop: '6px' }}>E-mail: {doctor.email}</div>
                            </div>
                        </div>
                    </header>

                    <hr className="bill-divider" />

                    {/* Bill Form */}
                    <form id="bill-form" className="bill-form" onSubmit={(e) => e.preventDefault()}>

                        <div className="bill-meta">
                            <div>
                                <label htmlFor="billNo">BILL NO:-</label>
                                <input type="text" id="billNo" className="input-inline bill-no-input" placeholder="001" />
                            </div>
                            <div>
                                <label htmlFor="billDate">DATE:-</label>
                                <input type="date" id="billDate" className="input-inline date-input" />
                            </div>
                        </div>

                        <div className="patient-info">
                            This is to certify that
                            <label htmlFor="patientName" style={{ display: 'none' }}>Patient Name</label>
                            <input
                              type="text"
                              id="patientName"
                              className="input-inline patient-name-input"
                              placeholder="Patient Name"
                              onChange={(e) => autoResizeInput(e.target)}
                              onInput={(e) => autoResizeInput(e.target)}
                            />
                            aged
                            <label htmlFor="patientAge" style={{ display: 'none' }}>Age</label>
                            <input type="number" id="patientAge" className="input-inline age-input" placeholder="00" min="0" max="150" />
                            yrs was under my treatment for the following dental procedures
                        </div>

                        <div className="procedures-section">
                            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                                <div className="procedure-row" id={`procedure-row-${n}`} key={n}>
                                    <div className="procedure-left">
                                        <span className="proc-number" aria-hidden="true">{n}.</span>
                                        <label htmlFor={`proc${n}Name`} style={{ display: 'none' }}>Procedure {n}</label>
                                        <textarea
                                            id={`proc${n}Name`}
                                            className="input-inline procedure-name-input"
                                            placeholder="Procedure description"
                                            rows={1}
                                            onChange={(e) => autoResizeTextarea(e.target)}
                                            onInput={(e) => autoResizeTextarea(e.target)}
                                        />
                                    </div>
                                    <div className="procedure-right">
                                        <label htmlFor={`proc${n}Date`}>ON</label>
                                        <input type="date" id={`proc${n}Date`} className="input-inline procedure-date-input" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Spacer — grows to fill remaining space, pushing signatures to bottom */}
                        <div className="bill-spacer"></div>

                        <div className="amount-section" style={{ marginBottom: '70px' }}>
                            I have performed the above mentioned treatment procedures with informed consent from the patient and received Rs.
                            <label htmlFor="amount" style={{ display: 'none' }}>Amount</label>
                            <input
                            type="text"
                            id="amount"
                            className="input-inline amount-input"
                            placeholder="1000"
                            style={{
                                width: '60px',
                                textAlign: 'center',
                                padding: '0 2px',
                                border: 'none',
                                borderBottom: '1px solid #000',
                                background: 'transparent'
                            }}
                            />
                            as professional charges.
                        </div>

                        <div className="signatures-section">
                            <div className="signature-box">
                                <div className="signature-line"></div>
                                <div className="signature-label">Doctor's Seal:-</div>
                            </div>
                            <div className="signature-box">
                                <div className="signature-line"></div>
                                <div className="signature-label">Doctor's Signature:</div>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default PrescriptionPad;
