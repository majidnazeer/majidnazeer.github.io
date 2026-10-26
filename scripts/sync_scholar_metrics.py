#!/usr/bin/env python3
"""Sync Google Scholar All-column metrics into data.js and index.html fallbacks.

Primary: scrape the public Scholar profile HTML.
Optional: SerpAPI if SERPAPI_KEY is set (more reliable from CI).
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_JS = ROOT / "data.js"
INDEX_HTML = ROOT / "index.html"
SCHOLAR_USER = "uDGLThoAAAAJ"
SCHOLAR_URLS = [
    f"https://scholar.google.com/citations?user={SCHOLAR_USER}&hl=en",
    f"https://scholar.google.com.hk/citations?user={SCHOLAR_USER}&hl=en",
]


def fetch(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_scholar_html(html: str) -> dict[str, int] | None:
    vals = re.findall(r'class="gsc_rsb_std"[^>]*>([0-9,]+)<', html)
    if len(vals) < 6:
        vals = re.findall(r"gsc_rsb_std[^>]*>\s*([0-9,]+)", html)
    if len(vals) < 6:
        return None
    nums = [int(v.replace(",", "")) for v in vals[:6]]
    # Layout: Citations All/Since, h-index All/Since, i10-index All/Since
    return {
        "citations": nums[0],
        "hIndex": nums[2],
        "i10Index": nums[4],
    }


def fetch_via_serpapi(api_key: str) -> dict[str, int] | None:
    qs = urllib.parse.urlencode(
        {
            "engine": "google_scholar_author",
            "author_id": SCHOLAR_USER,
            "hl": "en",
            "api_key": api_key,
        }
    )
    raw = fetch(f"https://serpapi.com/search.json?{qs}")
    data = json.loads(raw)
    cited = (data.get("cited_by") or {}).get("table") or []
    out: dict[str, int] = {}
    for row in cited:
        name = (row.get("name") or "").strip().lower()
        citations = (row.get("citations") or {}).get("all")
        if citations is None:
            continue
        if name == "citations":
            out["citations"] = int(citations)
        elif name in ("h-index", "h index"):
            out["hIndex"] = int(citations)
        elif name in ("i10-index", "i10 index"):
            out["i10Index"] = int(citations)
    if {"citations", "hIndex", "i10Index"} <= out.keys():
        return out
    return None


def fetch_metrics() -> dict[str, int]:
    errors: list[str] = []
    for url in SCHOLAR_URLS:
        try:
            html = fetch(url)
            metrics = parse_scholar_html(html)
            if metrics:
                print(f"Fetched Scholar metrics from {url}")
                return metrics
            errors.append(f"{url}: could not parse metrics table")
        except (urllib.error.URLError, TimeoutError, ValueError) as exc:
            errors.append(f"{url}: {exc}")

    api_key = os.environ.get("SERPAPI_KEY", "").strip()
    if api_key:
        try:
            metrics = fetch_via_serpapi(api_key)
            if metrics:
                print("Fetched Scholar metrics via SerpAPI")
                return metrics
            errors.append("SerpAPI: incomplete cited_by table")
        except Exception as exc:  # noqa: BLE001
            errors.append(f"SerpAPI: {exc}")

    raise RuntimeError(
        "Could not fetch Google Scholar metrics.\n" + "\n".join(errors)
    )


def update_data_js(metrics: dict[str, int]) -> bool:
    text = DATA_JS.read_text(encoding="utf-8")
    pattern = re.compile(
        r"var SCHOLAR_METRICS = \{\s*"
        r"citations:\s*\d+\s*,\s*"
        r"hIndex:\s*\d+\s*,\s*"
        r"i10Index:\s*\d+\s*"
        r"\};",
        re.M,
    )
    replacement = (
        "var SCHOLAR_METRICS = {\n"
        f"  citations: {metrics['citations']},\n"
        f"  hIndex: {metrics['hIndex']},\n"
        f"  i10Index: {metrics['i10Index']}\n"
        "};"
    )
    new_text, n = pattern.subn(replacement, text, count=1)
    if n != 1:
        raise RuntimeError("SCHOLAR_METRICS block not found in data.js")
    if new_text == text:
        return False
    DATA_JS.write_text(new_text, encoding="utf-8")
    return True


def update_index_fallbacks(metrics: dict[str, int]) -> bool:
    text = INDEX_HTML.read_text(encoding="utf-8")
    cit = f"{metrics['citations']:,}"
    replacements = [
        (
            r'id="statCitations" data-fallback="[^"]*">[^<]*<',
            f'id="statCitations" data-fallback="{cit}">{cit}<',
        ),
        (
            r'id="statHIndex" data-fallback="[^"]*">[^<]*<',
            f'id="statHIndex" data-fallback="{metrics["hIndex"]}">{metrics["hIndex"]}<',
        ),
        (
            r'id="statI10" data-fallback="[^"]*">[^<]*<',
            f'id="statI10" data-fallback="{metrics["i10Index"]}">{metrics["i10Index"]}<',
        ),
    ]
    new_text = text
    for pattern, repl in replacements:
        new_text, n = re.subn(pattern, repl, new_text, count=1)
        if n != 1:
            raise RuntimeError(f"Could not update index.html for pattern {pattern}")
    if new_text == text:
        return False
    INDEX_HTML.write_text(new_text, encoding="utf-8")
    return True


def bump_cache_token(metrics: dict[str, int]) -> bool:
    """Bump data.js / script.js cache query so Pages visitors get fresh metrics."""
    token = f"cite{metrics['citations']}"
    changed = False
    for path in ROOT.glob("*.html"):
        text = path.read_text(encoding="utf-8")
        new_text = re.sub(
            r'(src="data\.js)\?v=[^"]+"',
            rf'\1?v={token}"',
            text,
        )
        new_text = re.sub(
            r'(src="script\.js)\?v=[^"]+"',
            rf'\1?v={token}"',
            new_text,
        )
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            changed = True
    return changed


def main() -> int:
    metrics = fetch_metrics()
    print(
        f"citations={metrics['citations']} "
        f"h-index={metrics['hIndex']} "
        f"i10-index={metrics['i10Index']}"
    )
    changed = update_data_js(metrics)
    changed = update_index_fallbacks(metrics) or changed
    if changed:
        bump_cache_token(metrics)
        print("Updated site metrics files.")
    else:
        print("Metrics already up to date.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
