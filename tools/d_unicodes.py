#!/usr/bin/env python3
import argparse
import io
import sys
import unicodedata

SURROGATE_START = 0xD800
SURROGATE_END = 0xDFFF
UNICODE_MAX = 0x10FFFF


def iter_codepoints(assigned_only: bool):
    for cp in range(0, UNICODE_MAX + 1):
        # Skip UTF-16 surrogate code points: not valid Unicode scalar values
        if SURROGATE_START <= cp <= SURROGATE_END:
            continue
        ch = chr(cp)
        if assigned_only:
            # unicodedata.name(...) raises for surrogates (already skipped)
            # Returns None for unassigned in Python 3.11+ via default; older versions need try/except
            try:
                # If name lookup fails, it's unassigned
                unicodedata.name(ch)
            except ValueError:
                continue
        yield ch


def main():
    parser = argparse.ArgumentParser(
        description="Generate a text file containing Unicode characters."
    )
    parser.add_argument(
        "--out", default="unicodes.utf8",
        help="Output file path (default: unicodes.utf8)"
    )
    parser.add_argument(
        "--encoding", choices=["utf-8", "utf-16", "utf-32"], default="utf-8",
        help="Text encoding (default: utf-8). For utf-16/utf-32 a BOM is written once."
    )
    parser.add_argument(
        "--assigned-only", action="store_true",
        help="Include only assigned characters (skip unassigned)."
    )
    parser.add_argument(
        "--separator", choices=["none", "newline", "null"], default="none",
        help="Separator after each character (default: none)."
    )
    parser.add_argument(
        "--chunk", type=int, default=8192,
        help="Characters per write chunk (default: 8192)."
    )

    args = parser.parse_args()

    sep = "" if args.separator == "none" else (
        "\n" if args.separator == "newline" else "\x00")

    # Use a text stream so UTF-16/32 write the BOM once at the start
    with io.open(args.out, "w", encoding=args.encoding, newline="") as f:
        buf = []
        count = 0
        for ch in iter_codepoints(args.assigned_only):
            buf.append(ch)
            if sep:
                buf.append(sep)
            if len(buf) >= args.chunk:
                f.write("".join(buf))
                buf.clear()
            count += 1
        if buf:
            f.write("".join(buf))

    print(
        f"Done. Wrote {count} characters to {args.out} (encoding={args.encoding}, separator={args.separator}).")


if __name__ == "__main__":
    # Ensure consistent behavior if stdout is redirected
    try:
        main()
    except BrokenPipeError:
        # Allow piping to tools like head without stack traces
        try:
            sys.stderr.close()
        except Exception:
            pass
        sys.exit(1)
