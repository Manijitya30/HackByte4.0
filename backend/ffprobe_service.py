from report_speech import MetadataReport, MetadataFlags
from utils.exiftool import run_exiftool
from utils.parsers import parse_bitrate, parse_duration, parse_filesize


SUSPICIOUS_SOFTWARE = [
    "audacity", "ffmpeg", "fl studio", "reaper",
    "adobe audition", "garageband", "logic pro"
]

PLATFORM_HINTS = [
    "whatsapp", "telegram", "instagram"
]


def analyze_metadata(filepath: str, filename: str):
    metadata = run_exiftool(filepath)

    # ============================
    # PARSED NUMERIC VALUES
    # ============================
    duration = parse_duration(metadata.get("Duration"))
    size = parse_filesize(metadata.get("FileSize"))
    bit_rate = parse_bitrate(metadata.get("AudioBitrate"))

    sample_rate = metadata.get("SampleRate")
    channels = metadata.get("NumChannels")

    software = str(metadata.get("Software", "")).lower()
    creation_time = metadata.get("CreateDate")

    file_type = metadata.get("FileType")
    codec = metadata.get("AudioFormat")

    # ============================
    # ANALYSIS STORAGE
    # ============================
    risk_signals = []
    metadata_details = []
    missing_fields = []

    # ============================
    # 1. BASIC INFO
    # ============================
    if file_type:
        metadata_details.append(f"File type: {file_type}")

    if codec:
        metadata_details.append(f"Audio codec: {codec}")

    # ============================
    # 2. QUALITY ANALYSIS
    # ============================
    if sample_rate:
        metadata_details.append(f"Sample rate: {sample_rate} Hz")

        if int(sample_rate) < 16000:
            risk_signals.append("Low sample rate — reduced audio quality")

    else:
        missing_fields.append("Sample rate missing")

    if channels:
        metadata_details.append(f"Channels: {channels}")
        if int(channels) == 1:
            metadata_details.append("Mono audio (common in recordings)")
    else:
        missing_fields.append("Channel info missing")

    # ============================
    # 3. BITRATE ANALYSIS
    # ============================
    bitrate_anomaly = False

    if bit_rate:
        metadata_details.append(f"Bitrate: {bit_rate} bps")

        if bit_rate < 64000:
            bitrate_anomaly = True
            risk_signals.append("Low bitrate — possible compression or tampering")
    else:
        missing_fields.append("Bitrate unavailable")

    # ============================
    # 4. DURATION VS SIZE
    # ============================
    duration_size_mismatch = False

    if duration and size:
        metadata_details.append(f"Duration: {duration}s")
        metadata_details.append(f"File size: {size} bytes")

        if size < duration * 4000:
            duration_size_mismatch = True
            risk_signals.append("File size too small for duration — heavy compression suspected")
    else:
        missing_fields.append("Duration or file size missing")

    # ============================
    # 5. SOFTWARE ANALYSIS
    # ============================
    suspicious_software = False

    if software:
        metadata_details.append(f"Processed using: {software}")

        if any(x in software for x in SUSPICIOUS_SOFTWARE):
            suspicious_software = True
            risk_signals.append("Audio processed using editing software")

    else:
        missing_fields.append("Software tag missing")

    # ============================
    # 6. TIMESTAMP ANALYSIS
    # ============================
    timestamp_missing = False

    if creation_time:
        metadata_details.append(f"Creation time: {creation_time}")
    else:
        timestamp_missing = True
        missing_fields.append("Creation timestamp missing")

    # ============================
    # 7. PLATFORM DETECTION
    # ============================
    platform_detected = None

    filename_lower = filename.lower()
    for p in PLATFORM_HINTS:
        if p in filename_lower:
            platform_detected = p
            metadata_details.append(f"Likely sourced from {p}")
            break

    # ============================
    # 8. RE-ENCODING DETECTION
    # ============================
    has_origin_data = any([
        metadata.get("Artist"),
        metadata.get("Encoder"),
        metadata.get("Make")
    ])

    re_encoded = not has_origin_data

    if re_encoded:
        risk_signals.append("No original recording metadata — likely re-encoded")

    # ============================
    # FLAGS
    # ============================
    flags = MetadataFlags(
        re_encoded=re_encoded,
        suspicious_software=suspicious_software,
        timestamp_missing=timestamp_missing,
        framerate_inconsistent=False,
        bitrate_anomaly=bitrate_anomaly,
        duration_size_mismatch=duration_size_mismatch,
    )

    # ============================
    # FINAL INTERPRETATION
    # ============================
    if platform_detected:
        risk_level = "LOW"
        conclusion = (
            f"Audio appears to be processed by {platform_detected}. "
            "Metadata loss is expected and not conclusive of tampering."
        )
    elif len(risk_signals) >= 4:
        risk_level = "HIGH"
        conclusion = "Strong evidence of manipulation or synthetic generation"
    elif len(risk_signals) >= 2:
        risk_level = "MEDIUM"
        conclusion = "Multiple suspicious indicators detected"
    elif len(risk_signals) == 1:
        risk_level = "LOW"
        conclusion = "Minor anomaly detected"
    else:
        risk_level = "NONE"
        conclusion = "Metadata appears consistent and natural"

    # ============================
    # RETURN
    # ============================
    return MetadataReport(
        filename=filename,
        format=file_type,
        duration_seconds=duration,
        size_bytes=size,
        encoding_software=metadata.get("Software"),
        creation_time=creation_time,
        frame_rate=None,
        bit_rate=bit_rate,
        codec=codec,
        sample_rate=sample_rate,
        channels=channels,
        flags=flags,
        risk_signals=risk_signals,
        source_platform=platform_detected,
        platform_note=(
            "Social media platforms re-encode audio and remove metadata"
            if platform_detected else None
        ),
    ), {
        "details": metadata_details,
        "missing_fields": missing_fields,
        "risk_level": risk_level,
        "conclusion": conclusion
    }