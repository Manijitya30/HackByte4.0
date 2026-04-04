from pydantic import BaseModel
from typing import Optional

class MetadataFlags(BaseModel):
    re_encoded: bool
    suspicious_software: bool
    timestamp_missing: bool
    framerate_inconsistent: bool
    bitrate_anomaly: bool
    duration_size_mismatch: bool

class MetadataReport(BaseModel):
    filename: str
    format: Optional[str]
    duration_seconds: Optional[float]
    size_bytes: Optional[int]
    encoding_software: Optional[str]
    creation_time: Optional[str]
    frame_rate: Optional[str]
    bit_rate: Optional[int]
    codec: Optional[str]
    flags: MetadataFlags
    risk_signals: list[str]
    source_platform: Optional[str]       
    platform_note: Optional[str]          