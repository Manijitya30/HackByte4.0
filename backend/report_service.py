def generate_final_report(metadata, ai_result, speaker_result, tamper_result):

    report = {}

    # -----------------------------
    # Metadata
    # -----------------------------
    metadata_score = len(metadata.risk_signals)

    if metadata_score >= 3:
        metadata_status = "HIGHLY_SUSPICIOUS"
    elif metadata_score >= 1:
        metadata_status = "SUSPICIOUS"
    else:
        metadata_status = "CLEAN"

    report["metadata"] = {
        "status": metadata_status,
        "issues": metadata.risk_signals
    }

    # -----------------------------
    # AI Detection
    # -----------------------------
    report["ai_detection"] = ai_result

    # -----------------------------
    # Speaker
    # -----------------------------
    report["speaker"] = speaker_result

    # -----------------------------
    # Tampering
    # -----------------------------
    report["tampering"] = tamper_result

    # -----------------------------
    # Final Risk Score (STABLE)
    # -----------------------------
    risk_score = 0

    # Metadata (max 20)
    risk_score += min(metadata_score * 5, 20)

    # AI (max 40)
    risk_score += int(ai_result.get("ai_probability", 0) * 40)

    # Tampering (max 30)
    risk_score += int(tamper_result.get("tamper_score", 0) * 30)

    # Speaker
    if speaker_result.get("verdict") == "DIFFERENT":
        risk_score += 30
    elif speaker_result.get("verdict") == "UNCERTAIN":
        risk_score += 15

    # -----------------------------
    # Final Verdict
    # -----------------------------
    if risk_score >= 70:
        verdict = "❌ FAKE AUDIO"
    elif risk_score >= 40:
        verdict = "⚠️ SUSPICIOUS AUDIO"
    else:
        verdict = "✅ GENUINE AUDIO"

    report["final"] = {
        "risk_score": risk_score,
        "verdict": verdict
    }

    return report