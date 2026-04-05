import subprocess
import json
import shutil

def run_exiftool(filepath: str) -> dict:
    if not shutil.which("exiftool"):
        raise EnvironmentError("ExifTool not installed")

    result = subprocess.run(
        ["exiftool", "-json", filepath],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise ValueError(result.stderr)

    data = json.loads(result.stdout)
    return data[0] if isinstance(data, list) else data