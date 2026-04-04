from reportlab.platypus import SimpleDocTemplate, Paragraph, Image, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime

def generate_report(
    output_path,
    input_path,
    overlay_path,
    metadata_status,
    metadata_score,
    metadata_flags,
    ai_result,
    ai_conf,
    deepfake_result,
    tampered,
    tamper_conf
):

    doc = SimpleDocTemplate(output_path)
    styles = getSampleStyleSheet()
    elements = []

    # ===== TITLE =====
    elements.append(Paragraph("Digital Image Authentication Report", styles['Title']))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph(f"Generated: {datetime.now()}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # =====================================================
    # ===== METADATA SECTION ===============================
    # =====================================================
    elements.append(Paragraph("Metadata Analysis", styles['Heading2']))
    elements.append(Paragraph(f"Status: {metadata_status}", styles['Normal']))
    elements.append(Paragraph(f"Risk Score: {metadata_score}", styles['Normal']))

    if metadata_flags:
        elements.append(Paragraph("Flags:", styles['Heading3']))
        for flag in metadata_flags:
            elements.append(Paragraph(f"- {flag}", styles['Normal']))

    elements.append(Spacer(1, 20))

    # =====================================================
    # ===== AI DETECTION ==================================
    # =====================================================
    elements.append(Paragraph("AI Generated Detection", styles['Heading2']))
    elements.append(Paragraph(f"Result: {ai_result}", styles['Normal']))
    elements.append(Paragraph(f"Confidence: {ai_conf:.4f}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # =====================================================
    # ===== DEEPFAKE ======================================
    # =====================================================
    elements.append(Paragraph("Deepfake Detection", styles['Heading2']))

    if "error" not in deepfake_result:
        elements.append(Paragraph(f"Probability: {deepfake_result['deepfake_probability']}", styles['Normal']))
        elements.append(Paragraph(f"Verdict: {deepfake_result['verdict']}", styles['Normal']))
    else:
        elements.append(Paragraph("Deepfake detection failed", styles['Normal']))

    elements.append(Spacer(1, 20))

    # =====================================================
    # ===== TAMPERING =====================================
    # =====================================================
    elements.append(Paragraph("Tampering Detection", styles['Heading2']))
    elements.append(Paragraph(f"Tampered: {tampered}", styles['Normal']))
    elements.append(Paragraph(f"Confidence: {tamper_conf:.4f}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # =====================================================
    # ===== IMAGES ========================================
    # =====================================================
    elements.append(Paragraph("Original Image", styles['Heading3']))
    elements.append(Image(input_path, width=400, height=300))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Tampering Overlay", styles['Heading3']))
    elements.append(Image(overlay_path, width=400, height=300))

    doc.build(elements)