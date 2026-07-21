"""Extract and associate PoE skill icons embedded in the supplied PDFs."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from PIL import Image
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent
DEFAULT_PDFS = [
    Path(r"C:\Users\saulo\Desktop\Salvar.pdf"),
    Path(r"C:\Users\saulo\Desktop\Salvar 2.pdf"),
    Path(r"C:\Users\saulo\Desktop\Salvar 3.pdf"),
]


def safe_name(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._")
    return value or "unnamed"


def natural_key(image) -> tuple[int, str]:
    match = re.search(r"(\d+)", image.name)
    return (int(match.group(1)) if match else 10**9, image.name)


def skill_name(record: dict) -> str:
    title = record["wiki_title"]
    title = re.sub(r"^File:", "", title, flags=re.I)
    title = re.sub(r"_skill_icon\.png$", "", title, flags=re.I)
    return title.replace("_", " ")


def collect_icons(pdf_paths: list[Path]) -> list[dict]:
    icons = []
    for pdf_path in pdf_paths:
        reader = PdfReader(str(pdf_path))
        for page_number, page in enumerate(reader.pages, start=1):
            for image in sorted(page.images, key=natural_key):
                width, height = image.image.size
                # Keep every embedded image; quality review is recorded in the manifest.
                icons.append({
                    "pdf": str(pdf_path),
                    "pdf_name": pdf_path.name,
                    "page": page_number,
                    "embedded_name": image.name,
                    "image": image,
                    "width": width,
                    "height": height,
                })
    return icons


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", nargs="*", type=Path, default=DEFAULT_PDFS)
    parser.add_argument("--no-upscale", action="store_true")
    args = parser.parse_args()

    index_path = ROOT / "skill_sprite_index.json"
    if not index_path.exists():
        raise SystemExit(f"Índice ausente: {index_path}")
    records = json.loads(index_path.read_text(encoding="utf-8"))["records"]
    icons = collect_icons(args.pdf)
    if len(icons) < len(records):
        raise SystemExit(
            f"Associação interrompida: PDFs têm {len(icons)} ícones e o índice tem {len(records)} skills."
        )

    output = ROOT / "pdf_extracted"
    native_dir = output / "native_png"
    raw_dir = output / "raw_embedded"
    upscale_dir = output / "upscaled_2x"
    for directory in (native_dir, raw_dir, upscale_dir):
        directory.mkdir(parents=True, exist_ok=True)

    associations = []
    for position, item in enumerate(icons):
        record = records[position] if position < len(records) else None
        name = skill_name(record) if record else f"unmatched_pdf_image_{position + 1}"
        stem = safe_name(name) + "_skill_icon"
        native_path = native_dir / f"{stem}.png"
        raw_ext = ".jpg" if item["image"].image.format == "JPEG" else ".bin"
        raw_path = raw_dir / f"{stem}{raw_ext}"
        item["image"].image.save(native_path, format="PNG")
        raw_path.write_bytes(item["image"].data)

        upscale_path = None
        if not args.no_upscale:
            enlarged = item["image"].image.resize(
                (item["width"] * 2, item["height"] * 2), Image.Resampling.LANCZOS
            )
            upscale_path = upscale_dir / f"{stem}.png"
            enlarged.save(upscale_path, format="PNG")

        associations.append({
            "skill": name,
            "wiki_title": record["wiki_title"] if record else None,
            "source_pdf": item["pdf_name"],
            "page": item["page"],
            "embedded_image": item["embedded_name"],
            "native_size": [item["width"], item["height"]],
            "native_png": str(native_path.relative_to(ROOT)),
            "raw_embedded": str(raw_path.relative_to(ROOT)),
            "upscaled_2x": str(upscale_path.relative_to(ROOT)) if upscale_path else None,
            "association_status": "matched" if record else "unmatched",
        })

    manifest = {
        "source_pdfs": [str(path) for path in args.pdf],
        "source_index": str(index_path),
        "count": len(associations),
        "association_method": "PDF order after filtering square embedded icons <= 128px",
        "records": associations,
    }
    (output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"extracted={len(associations)} native={native_dir} upscale={not args.no_upscale}")


if __name__ == "__main__":
    main()
