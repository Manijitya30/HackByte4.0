from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
import os
import tempfile
import cv2

styles = getSampleStyleSheet()


def save_frame(video_path, frame_number):
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        return None

    temp_path = tempfile.mktemp(suffix=".jpg")
    cv2.imwrite(temp_path, frame)
    return temp_path


def generate_video_report(
    output_path,
    video_path,
    metadata,
    metadata_extra,
    deepfake,
    compression,
    splice,
    sync
):
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    elements = []

    # ============================
    # TITLE
    # ============================
    elements.append(Paragraph("Video Forensic Analysis Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    # ============================
    # SUMMARY
    # ============================
    verdict = "GENUINE"

    if deepfake["verdict"] in ["HIGH_RISK", "SUSPICIOUS"]:
        verdict = "FAKE"

    if splice["overall_suspicious"]:
        verdict = "TAMPERED"

    elements.append(Paragraph(f"<b>Final Verdict:</b> {verdict}", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    # ============================
    # METADATA
    # ============================
    elements.append(Paragraph("Metadata Analysis", styles["Heading2"]))

    elements.append(Paragraph(
        f"Creation Time: {metadata.creation_time}", styles["Normal"]))
    elements.append(Paragraph(
        f"Encoding Software: {metadata.encoding_software}", styles["Normal"]))

    for r in metadata.risk_signals:
        elements.append(Paragraph(f"- {r}", styles["Normal"]))

    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("Metadata Details", styles["Heading2"]))

    for d in metadata_extra["details"]:
        elements.append(Paragraph(f"- {d}", styles["Normal"]))

    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Missing Metadata", styles["Heading3"]))
    for m in metadata_extra["missing_fields"]:
        elements.append(Paragraph(f"- {m}", styles["Normal"]))

    elements.append(Spacer(1, 8))

    elements.append(Paragraph(f"Risk Level: {metadata_extra['risk_level']}", styles["Normal"]))
    elements.append(Paragraph(f"Conclusion: {metadata_extra['conclusion']}", styles["Normal"]))

    # ============================
    # DEEPFAKE
    # ============================
    elements.append(Paragraph("Deepfake Analysis", styles["Heading2"]))

    elements.append(Paragraph(
        f"Average Deepfake Score: {deepfake['average_deepfake_score']}", styles["Normal"]))
    elements.append(Paragraph(
        f"Maximum Frame Score: {deepfake['max_deepfake_score']}", styles["Normal"]))

    # ✅ NEW: CLEAR VERDICT
    elements.append(Paragraph(
        f"<b>Deepfake Verdict:</b> {deepfake['verdict']}", styles["Normal"]))

    elements.append(Paragraph(
        f"<b>Conclusion:</b> {deepfake['conclusion']}", styles["Normal"]))

    elements.append(Spacer(1, 8))

    # ✅ HANDLE BOTH CASES
    if deepfake["flagged_frames"]:
        elements.append(Paragraph("Suspicious Frames (Evidence):", styles["Heading3"]))

        for frame in deepfake["flagged_frames"][:3]:
            frame_img = save_frame(video_path, frame["frame_number"])
            if frame_img:
                elements.append(Paragraph(
                    f"Frame {frame['frame_number']} ({frame['timestamp_seconds']}s) - Score: {frame['deepfake_probability']}",
                    styles["Normal"]
                ))
                elements.append(Image(frame_img, width=300, height=200))
    else:
        elements.append(Paragraph(
            "No frames were flagged as deepfake. The video appears visually consistent.",
            styles["Normal"]
        ))

    elements.append(Spacer(1, 10))

    # ============================
    # COMPRESSION
    # ============================
    elements.append(Paragraph("Compression Analysis", styles["Heading2"]))

    elements.append(Paragraph(
        f"Suspicious Frame Ratio: {compression['suspicious_ratio']}", styles["Normal"]))

    elements.append(Paragraph(
        compression["explanation"], styles["Normal"]))

    for f in compression["top_suspicious_frames"]:
        elements.append(Paragraph(
            f"Frame {f['frame_index']} ({f['timestamp_seconds']}s) - Confidence: {f['confidence']}",
            styles["Normal"]
        ))

    # ============================
    # SPLICE
    # ============================
    elements.append(Paragraph("Splice Detection", styles["Heading2"]))

    elements.append(Paragraph(splice["explanation"], styles["Normal"]))

    for s in splice["splice_points"]:
        elements.append(Paragraph(
            f"HIGH severity splice at {s['from_timestamp']}s → {s['to_timestamp']}s",
            styles["Normal"]
        ))

    for a in splice["anomalous_transitions"]:
        elements.append(Paragraph(
            f"MEDIUM anomaly at {a['from_timestamp']}s → {a['to_timestamp']}s",
            styles["Normal"]
        ))

    # ============================
    # SYNC
    # ============================
    elements.append(Paragraph("Audio-Video Synchronization", styles["Heading2"]))

    elements.append(Paragraph(
        f"Status: {sync['status']}", styles["Normal"]))

    elements.append(Paragraph(
        f"Confidence: {sync['confidence']}", styles["Normal"]))

    elements.append(Paragraph(
        f"Lag (frames): {sync.get('lag_frames', 'N/A')}", styles["Normal"]))

    elements.append(Paragraph(
        sync.get("explanation", ""), styles["Normal"]))

    # ============================
    # FINAL NOTE
    # ============================
    elements.append(Paragraph(
        "Note: This report is generated using automated forensic analysis techniques. "
        "Results should be interpreted alongside expert testimony.",
        styles["Italic"]
    ))

    doc.build(elements)