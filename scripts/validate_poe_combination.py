#!/usr/bin/env python3
"""Validate combination structure without fabricating PoB measurements."""
import json
import sys
from pathlib import Path


REQUIRED = ("id", "request", "layers", "relations", "validation", "score", "provenance")
MEASUREMENT_STATUSES = {"not_run", "running", "measured", "failed", "pending"}


def validate(candidate):
    blockers = []
    warnings = []
    for key in REQUIRED:
        if key not in candidate:
            blockers.append(f"missing:{key}")

    validation = candidate.get("validation", {})
    measurement = candidate.get("measurement", {})
    status = validation.get("status")
    if status not in {"generated", "blocked", "validated_partial", "validated", "needs_review", "invalid"}:
        blockers.append("invalid:validation.status")
    if measurement.get("status", "not_run") not in MEASUREMENT_STATUSES:
        blockers.append("invalid:measurement.status")

    # A deterministic validator may never approve a measured result.
    if "metrics" in candidate.get("layers", {}).get("full_build", {}) and measurement.get("status") != "measured":
        warnings.append("metrics_present_without_pob_measurement")
    if measurement.get("status") != "measured":
        warnings.append("pob_app_metrics_pending")

    critical = any(x.startswith("missing:") or x.startswith("invalid:") for x in blockers)
    result = dict(candidate)
    result["validation"] = dict(validation)
    result["validation"].update({"blockers": blockers, "warnings": warnings, "deterministic": True})
    result["measurement"] = dict(measurement)
    result["measurement"].setdefault("status", "not_run")
    result["measurement"].setdefault("source", "path_of_building_app")
    result["measurement"].setdefault("metrics", None)
    result["evaluation"] = {"status": "pending_measurement", "score": None}
    if critical:
        result["validation"]["status"] = "invalid"
    elif result["measurement"]["status"] != "measured":
        result["validation"]["status"] = "needs_review"
    return result


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: validate_poe_combination.py candidate.json")
    path = Path(sys.argv[1])
    candidate = json.loads(path.read_text(encoding="utf-8-sig"))
    print(json.dumps(validate(candidate), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
