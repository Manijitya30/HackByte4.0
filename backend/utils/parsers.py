def parse_bitrate(value):
    if not value:
        return None
    try:
        value = str(value).lower().strip()

        if "mbps" in value:
            return int(float(value.replace("mbps", "")) * 1_000_000)
        elif "kbps" in value:
            return int(float(value.replace("kbps", "")) * 1_000)
        else:
            return int(float(value))
    except:
        return None


def parse_duration(value):
    if not value:
        return None
    try:
        value = str(value).lower().replace("s", "").strip()
        return float(value)
    except:
        return None


def parse_filesize(value):
    if not value:
        return None
    try:
        value = str(value).lower().strip()

        if "gib" in value or "gb" in value:
            return int(float(value.split()[0]) * 1024 * 1024 * 1024)

        elif "mib" in value or "mb" in value:
            return int(float(value.split()[0]) * 1024 * 1024)

        elif "kib" in value or "kb" in value:
            return int(float(value.split()[0]) * 1024)

        else:
            return int(value)

    except:
        return None