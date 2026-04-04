import subprocess
import json
from models.report import MetadataReport, MetadataFlags
import shutil
import os

SUSPICIOUS_SOFTWARE = [
    "adobe premiere", "after effects", "davinci resolve",
    "handbrake", "ffmpeg", "avisynth", "vegas pro",
    "camtasia", "obs studio", "kdenlive"
]

PLATFORM_PATTERNS = {
    "whatsapp": "WhatsApp",
    "telegram": "Telegram",
    "instagram": "Instagram",
    "youtube": "YouTube",
    "tiktok": "TikTok",
}

def run_ffprobe(filepath: str) -> dict:
    command = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        filepath
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        raise ValueError(f"FFprobe failed: {result.stderr}")
    return json.loads(result.stdout)

# def run_ffprobe(filepath: str) -> dict:
#     command = [
#         "ffprobe",
#         "-v", "quiet",
#         "-print_format", "json",
#         "-show_format",
#         "-show_streams",
#         filepath
#     ]
#     result = subprocess.run(command, capture_output=True, text=True)
#     if result.returncode != 0:
#         raise ValueError(f"FFprobe failed: {result.stderr}")
#     return json.loads(result.stdout)

def extract_video_stream(streams: list) -> dict:
    for stream in streams:
        if stream.get("codec_type") == "video":
            return stream
    return {}

def parse_frame_rate(rate_str: str) -> float:
    try:
        if "/" in rate_str:
            num, den = rate_str.split("/")
            return round(int(num) / int(den), 3)
        return float(rate_str)
    except:
        return 0.0

def analyze_metadata(filepath: str, filename: str) -> MetadataReport:
    raw = run_ffprobe(filepath)

    fmt = raw.get("format", {})
    streams = raw.get("streams", [])
    video_stream = extract_video_stream(streams)

    encoding_software = (
        fmt.get("tags", {}).get("encoder") or
        fmt.get("tags", {}).get("software") or
        fmt.get("tags", {}).get("writing_application")
    )
    creation_time = fmt.get("tags", {}).get("creation_time")
    duration = float(fmt.get("duration", 0)) or None
    size = int(fmt.get("size", 0)) or None
    bit_rate = int(fmt.get("bit_rate", 0)) or None
    codec = video_stream.get("codec_name")
    fmt_name = fmt.get("format_long_name")

    raw_frame_rate = video_stream.get("r_frame_rate", "")
    avg_frame_rate = video_stream.get("avg_frame_rate", "")
    r_fps = parse_frame_rate(raw_frame_rate)
    avg_fps = parse_frame_rate(avg_frame_rate)

    risk_signals = []

    # 1. Suspicious software
    suspicious_software = False
    if encoding_software:
        for sw in SUSPICIOUS_SOFTWARE:
            if sw in encoding_software.lower():
                suspicious_software = True
                risk_signals.append(f"Encoded with suspicious software: {encoding_software}")
                break

    # 2. Missing timestamp
    timestamp_missing = creation_time is None
    if timestamp_missing:
        risk_signals.append("Creation timestamp is missing from metadata")

    # 3. Frame rate inconsistency
    framerate_inconsistent = False
    if r_fps and avg_fps:
        if abs(r_fps - avg_fps) > 2.0:
            framerate_inconsistent = True
            risk_signals.append(
                f"Frame rate inconsistency: declared {r_fps}fps vs average {avg_fps}fps"
            )

    # 4. Bit rate anomaly
    bitrate_anomaly = False
    if bit_rate and bit_rate < 100_000:
        bitrate_anomaly = True
        risk_signals.append(
            f"Unusually low bit rate: {bit_rate // 1000} kbps — suggests heavy re-compression"
        )

    # 5. Duration vs file size mismatch
    duration_size_mismatch = False
    if duration and size:
        if size < duration * 50_000:
            duration_size_mismatch = True
            risk_signals.append(
                f"File size ({size // 1024}KB) too small for duration ({round(duration, 1)}s)"
            )

    # 6. Re-encoding detection
    has_device_info = any([
        fmt.get("tags", {}).get("make"),
        fmt.get("tags", {}).get("model"),
        fmt.get("tags", {}).get("com.android.version"),
        fmt.get("tags", {}).get("artist"),
    ])
    re_encoded = not has_device_info
    if re_encoded:
        risk_signals.append("No original device metadata — video was likely re-encoded")

    # 7. Platform detection
    source_platform = None
    platform_note = None

    filename_lower = filename.lower()
    for keyword, platform_name in PLATFORM_PATTERNS.items():
        if keyword in filename_lower:
            source_platform = platform_name
            platform_note = (
                f"{platform_name} automatically re-encodes videos upon transmission, "
                f"which removes original device metadata. "
                f"Re-encoding and missing timestamp flags alone are not conclusive "
                f"evidence of tampering for videos sourced from {platform_name}."
            )
            break

    flags = MetadataFlags(
        re_encoded=re_encoded,
        suspicious_software=suspicious_software,
        timestamp_missing=timestamp_missing,
        framerate_inconsistent=framerate_inconsistent,
        bitrate_anomaly=bitrate_anomaly,
        duration_size_mismatch=duration_size_mismatch,
    )

    return MetadataReport(
        filename=filename,
        format=fmt_name,
        duration_seconds=round(duration, 2) if duration else None,
        size_bytes=size,
        encoding_software=encoding_software,
        creation_time=creation_time,
        frame_rate=f"{r_fps}fps",
        bit_rate=bit_rate,
        codec=codec,
        flags=flags,
        risk_signals=risk_signals,
        source_platform=source_platform,
        platform_note=platform_note,
    )