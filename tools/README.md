# Google Fonts Tools

Utility scripts for working with the Google Fonts repository.

## Scripts

### assert_style.py

Validates font metadata - ensures all fonts have `METADATA.pb` files with only "normal" or "italic" styles.

```bash
# Validate all fonts
python assert_style.py

# Validate specific directory
python assert_style.py --fonts-dir ./vendor/google/ofl

# Verbose output
python assert_style.py --verbose

# Save issues to CSV
python assert_style.py --output issues.csv
```

### assert_max_vf_2.py

Asserts that there can only be up to 2 variable fonts per family.

```bash
# Validate all fonts
python assert_max_vf_2.py

# Validate specific directory
python assert_max_vf_2.py --fonts-dir ./vendor/google/ofl

# Verbose output with detailed breakdown
python assert_max_vf_2.py --verbose

# Save violations to CSV
python assert_max_vf_2.py --output violations.csv
```

## Options

Both scripts support:
- `--fonts-dir`: Font directory (default: `./vendor/google`)
- `--verbose, -v`: Verbose output
- `--output`: Save results to CSV file

`assert_max_vf_2.py` also supports:
- `--format`: Output format (`table`, `list`, `csv`)

## Dependencies

```bash
pip install gftools protobuf click
```
