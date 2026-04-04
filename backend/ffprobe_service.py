import subprocess
import json
import shutil
from report_speech import MetadataReport, MetadataFlags

def run_ffprobe(filepath: str) -> dict:
    if not shutil.which("ffprobe"):
        raise EnvironmentError("ffprobe not installed")

    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_format", "-show_streams", filepath],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise ValueError(result.stderr)

    return json.loads(result.stdout)


def analyze_metadata(filepath: str, filename: str) -> MetadataReport:
    raw = run_ffprobe(filepath)

    fmt = raw.get("format", {})
    streams = raw.get("streams", [])

    bit_rate = int(fmt.get("bit_rate", 0)) or None
    duration = float(fmt.get("duration", 0)) or None
    size = int(fmt.get("size", 0)) or None

    risk_signals = []

    if bit_rate and bit_rate < 64000:
        risk_signals.append("Low bitrate")

    if duration and size and size < duration * 5000:
        risk_signals.append("Size-duration mismatch")

    flags = MetadataFlags(
        re_encoded=False,
        suspicious_software=False,
        timestamp_missing=False,
        framerate_inconsistent=False,
        bitrate_anomaly=bool(bit_rate and bit_rate < 64000),
        duration_size_mismatch=bool(duration and size and size < duration * 5000),
    )

    return MetadataReport(
        filename=filename,
        format=fmt.get("format_long_name"),
        duration_seconds=duration,
        size_bytes=size,
        encoding_software=None,
        creation_time=None,
        frame_rate=None,
        bit_rate=bit_rate,
        codec=None,
        sample_rate=None,
        channels=None,
        flags=flags,
        risk_signals=risk_signals,
        source_platform=None,
        platform_note=None,
    )