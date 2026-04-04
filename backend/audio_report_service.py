from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

styles = getSampleStyleSheet()


def generate_audio_report(
    output_path,
    filename,
    metadata,
    metadata_extra,
    ai_result,
    speaker_result,
    tamper_result,
    final_result
):
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    elements = []

    # ============================
    # TITLE
    # ============================
    elements.append(Paragraph("Audio Forensic Analysis Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    # ============================
    # SUMMARY
    # ============================
    elements.append(Paragraph("Case Summary", styles["Heading2"]))

    elements.append(Paragraph(f"File: {filename}", styles["Normal"]))
    elements.append(Paragraph(
        f"Final Verdict: {final_result['verdict']}", styles["Normal"]))
    elements.append(Paragraph(
        f"Risk Score: {final_result['risk_score']}", styles["Normal"]))

    elements.append(Spacer(1, 12))

    # ============================
    # METADATA (RAW DETAILS)
    # ============================
    elements.append(Paragraph("Metadata (Technical Details)", styles["Heading2"]))

    elements.append(Paragraph(f"Format: {metadata.format}", styles["Normal"]))
    elements.append(Paragraph(f"Duration: {metadata.duration_seconds} sec", styles["Normal"]))
    elements.append(Paragraph(f"File Size: {metadata.size_bytes} bytes", styles["Normal"]))
    elements.append(Paragraph(f"Bitrate: {metadata.bit_rate}", styles["Normal"]))
    elements.append(Paragraph(f"Codec: {metadata.codec}", styles["Normal"]))
    elements.append(Paragraph(f"Sample Rate: {metadata.sample_rate}", styles["Normal"]))
    elements.append(Paragraph(f"Channels: {metadata.channels}", styles["Normal"]))
    elements.append(Paragraph(f"Software: {metadata.encoding_software}", styles["Normal"]))
    elements.append(Paragraph(f"Creation Time: {metadata.creation_time}", styles["Normal"]))

    elements.append(Spacer(1, 10))

    # ============================
    # METADATA FLAGS
    # ============================
    elements.append(Paragraph("Metadata Flags", styles["Heading3"]))

    elements.append(Paragraph(
        f"Re-encoded: {metadata.flags.re_encoded}", styles["Normal"]))
    elements.append(Paragraph(
        f"Suspicious Software: {metadata.flags.suspicious_software}", styles["Normal"]))
    elements.append(Paragraph(
        f"Timestamp Missing: {metadata.flags.timestamp_missing}", styles["Normal"]))
    elements.append(Paragraph(
        f"Bitrate Anomaly: {metadata.flags.bitrate_anomaly}", styles["Normal"]))
    elements.append(Paragraph(
        f"Duration-Size Mismatch: {metadata.flags.duration_size_mismatch}", styles["Normal"]))

    elements.append(Spacer(1, 10))

    # ============================
    # METADATA INTERPRETATION
    # ============================
    elements.append(Paragraph("Metadata Interpretation", styles["Heading2"]))

    for d in metadata_extra["details"]:
        elements.append(Paragraph(f"- {d}", styles["Normal"]))

    elements.append(Spacer(1, 6))

    elements.append(Paragraph("Missing Metadata:", styles["Heading3"]))
    for m in metadata_extra["missing_fields"]:
        elements.append(Paragraph(f"- {m}", styles["Normal"]))

    elements.append(Spacer(1, 6))

    elements.append(Paragraph(
        f"Risk Level: {metadata_extra['risk_level']}", styles["Normal"]))
    elements.append(Paragraph(
        f"Conclusion: {metadata_extra['conclusion']}", styles["Normal"]))

    elements.append(Spacer(1, 12))

    # ============================
    # AI DETECTION
    # ============================
    elements.append(Paragraph("AI Voice Detection", styles["Heading2"]))

    elements.append(Paragraph(
        f"AI Probability: {ai_result.get('ai_probability')}", styles["Normal"]))
    elements.append(Paragraph(
        f"Verdict: {ai_result.get('verdict')}", styles["Normal"]))
    elements.append(Paragraph(
        f"MFCC Variance: {ai_result.get('mfcc_variance')}", styles["Normal"]))

    elements.append(Spacer(1, 10))

    # ============================
    # SPEAKER VERIFICATION
    # ============================
    elements.append(Paragraph("Speaker Verification", styles["Heading2"]))

    elements.append(Paragraph(
        f"Similarity Score: {speaker_result.get('similarity')}", styles["Normal"]))
    elements.append(Paragraph(
        f"Verdict: {speaker_result.get('verdict')}", styles["Normal"]))

    elements.append(Spacer(1, 10))

    # ============================
    # TAMPERING
    # ============================
    elements.append(Paragraph("Tampering Detection", styles["Heading2"]))

    elements.append(Paragraph(
        f"Tamper Score: {tamper_result.get('tamper_score')}", styles["Normal"]))
    elements.append(Paragraph(
        f"Verdict: {tamper_result.get('verdict')}", styles["Normal"]))
    elements.append(Paragraph(
        f"Energy Variation: {tamper_result.get('energy_variation')}", styles["Normal"]))
    elements.append(Paragraph(
        f"Spike Count: {tamper_result.get('spike_count')}", styles["Normal"]))

    elements.append(Spacer(1, 12))

    # ============================
    # FINAL INTERPRETATION
    # ============================
    elements.append(Paragraph("Final Interpretation", styles["Heading2"]))

    elements.append(Paragraph(
        f"Overall Risk Score: {final_result['risk_score']}", styles["Normal"]))
    elements.append(Paragraph(
        f"Final Verdict: {final_result['verdict']}", styles["Normal"]))

    elements.append(Spacer(1, 12))

    elements.append(Paragraph(
        "Note: This report is generated using automated forensic analysis. "
        "It should be interpreted alongside expert testimony.",
        styles["Italic"]
    ))

    doc.build(elements)