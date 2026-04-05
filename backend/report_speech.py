from pydantic import BaseModel
from typing import Optional, List


class MetadataFlags(BaseModel):
    re_encoded: bool
    suspicious_software: bool
    timestamp_missing: bool
    framerate_inconsistent: bool
    bitrate_anomaly: bool
    duration_size_mismatch: bool


class MetadataReport(BaseModel):
    filename: str

    # Core
    format: Optional[str]
    duration_seconds: Optional[float]
    size_bytes: Optional[int]

    # Encoding
    encoding_software: Optional[str]
    creation_time: Optional[str]

    # Media-specific
    frame_rate: Optional[str] = None
    bit_rate: Optional[int]
    codec: Optional[str]

    # ✅ ADD THESE (THIS FIXES YOUR ERROR)
    sample_rate: Optional[int] = None
    channels: Optional[int] = None

    # Flags & signals
    flags: MetadataFlags
    risk_signals: List[str]

    # Context
    source_platform: Optional[str] = None
    platform_note: Optional[str] = None