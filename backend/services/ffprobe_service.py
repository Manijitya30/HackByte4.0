from models.report import MetadataReport, MetadataFlags
from utils.exiftool import run_exiftool
from utils.parsers import parse_bitrate, parse_duration, parse_filesize


def analyze_metadata(filepath: str, filename: str) -> MetadataReport:
    metadata = run_exiftool(filepath)

    # ============================
    # PARSED NUMERIC VALUES
    # ============================
    duration = parse_duration(metadata.get("Duration"))
    size = parse_filesize(metadata.get("FileSize"))
    bit_rate = parse_bitrate(metadata.get("AvgBitrate"))

    # ============================
    # RAW FIELDS
    # ============================
    software = str(metadata.get("Software", "")).lower()
    creation_time = metadata.get("CreateDate")
    modify_time = metadata.get("ModifyDate")

    make = metadata.get("Make")
    model = metadata.get("Model")

    gps_lat = metadata.get("GPSLatitude")
    gps_lon = metadata.get("GPSLongitude")

    frame_rate = metadata.get("VideoFrameRate")
    codec = metadata.get("VideoCodec")

    risk_signals = []
    metadata_details = []
    missing_fields = []

    # ============================
    # 1. DEVICE INFORMATION
    # ============================
    if make and model:
        metadata_details.append(f"Captured using device: {make} {model}")
    else:
        missing_fields.append("Device information missing")
        risk_signals.append("No camera/device metadata — possible re-encoding or AI generation")

    # ============================
    # 2. SOFTWARE ANALYSIS
    # ============================
    suspicious_software = False
    if software:
        metadata_details.append(f"Processed using software: {software}")

        if any(x in software for x in [
            "premiere", "after effects", "davinci", "ffmpeg", "capcut"
        ]):
            suspicious_software = True
            risk_signals.append("Video processed using editing software")
    else:
        missing_fields.append("Software tag missing")

    # ============================
    # 3. TIMESTAMP ANALYSIS
    # ============================
    timestamp_missing = False

    if creation_time:
        metadata_details.append(f"Creation time: {creation_time}")
    else:
        timestamp_missing = True
        missing_fields.append("Creation timestamp missing")
        risk_signals.append("No creation timestamp — weak evidence of origin")

    if modify_time and creation_time and modify_time != creation_time:
        risk_signals.append("File modified after creation")

    # ============================
    # 4. BITRATE ANALYSIS
    # ============================
    bitrate_anomaly = False
    if bit_rate:
        metadata_details.append(f"Bitrate: {bit_rate} bps")

        if bit_rate < 100000:
            bitrate_anomaly = True
            risk_signals.append("Low bitrate — heavy compression or recompression")
    else:
        missing_fields.append("Bitrate information unavailable")

    # ============================
    # 5. SIZE vs DURATION
    # ============================
    duration_size_mismatch = False
    if duration and size:
        metadata_details.append(f"Duration: {duration}s | Size: {size} bytes")

        if size < duration * 50000:
            duration_size_mismatch = True
            risk_signals.append("File size too small for duration — possible recompression")
    else:
        missing_fields.append("Duration or file size missing")

    # ============================
    # 6. GPS ANALYSIS
    # ============================
    if gps_lat and gps_lon:
        metadata_details.append(f"GPS location available: {gps_lat}, {gps_lon}")
    else:
        metadata_details.append("No GPS data present")

    # ============================
    # 7. FORMAT INFO
    # ============================
    if codec:
        metadata_details.append(f"Codec: {codec}")
    if frame_rate:
        metadata_details.append(f"Frame rate: {frame_rate}")

    # ============================
    # FLAGS
    # ============================
    flags = MetadataFlags(
        re_encoded=not (make and model),
        suspicious_software=suspicious_software,
        timestamp_missing=timestamp_missing,
        framerate_inconsistent=False,
        bitrate_anomaly=bitrate_anomaly,
        duration_size_mismatch=duration_size_mismatch,
    )

    # ============================
    # FINAL INTERPRETATION
    # ============================
    if len(risk_signals) >= 4:
        overall_risk = "HIGH"
        conclusion = "Strong evidence of tampering or re-encoding"
    elif len(risk_signals) >= 2:
        overall_risk = "MEDIUM"
        conclusion = "Some suspicious indicators present"
    elif len(risk_signals) == 1:
        overall_risk = "LOW"
        conclusion = "Minor inconsistencies detected"
    else:
        overall_risk = "NONE"
        conclusion = "Metadata appears consistent and normal"

    return MetadataReport(
        filename=filename,
        format=metadata.get("FileType"),
        duration_seconds=duration,
        size_bytes=size,
        encoding_software=metadata.get("Software"),
        creation_time=creation_time,
        frame_rate=str(frame_rate),
        bit_rate=bit_rate,
        codec=codec,
        flags=flags,
        risk_signals=risk_signals,
        source_platform=None,
        platform_note=None,
    ), {
        "details": metadata_details,
        "missing_fields": missing_fields,
        "risk_level": overall_risk,
        "conclusion": conclusion
    }