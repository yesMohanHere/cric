"""Cricket commentary classification script.

This version is platform-independent (uses relative paths by default) and correctly
handles multi-word labels such as "RUN OUT" or "NO BALL".

Usage (example):
    python ollama_test.py transcript_clean.json output_labels.json

If no arguments are supplied the script falls back to `data/transcript_clean.json`
and writes results to `data/transcript_labeled.json` relative to the repo root.
"""

from pathlib import Path
import json
import requests
import time
import sys

# Predefined labels (strict filter)

VALID_LABELS = [
    'SIX',              # Six runs
    'FOUR',             # Four runs
    'WICKET',           # Generic dismissal
    'LBW',              # Leg Before Wicket
    'RUN OUT',          # Run out dismissal
    'WIDE',             # Wide delivery
    'NO BALL',          # No ball delivery
    'FREE HIT',         # Free hit after no ball
    'EXTRA',            # Byes, Leg Byes, Wides, etc. (excluding NO BALL now)
    'DOT BALL',         # No run scored
    'SINGLE',           # 1 run
    'DOUBLE',           # 2 runs
    'THREE',            # 3 runs
    'BREAK',            # Non-strategy pause (injury, drinks, etc.)
    'STRATEGY BREAK',   # Timeouts like Strategic Timeout or Innings Break
    'COMMENTARY',       # General chatter (e.g., insights, trivia, mood)
    'SCORE UPDATE',     # Commentary with current score info
    'UNKNOWN',          # For ambiguous or unclear commentary

    # Event-related
    'APPEAL',           # Player appeal but not clearly a dismissal yet
    'MISS',             # Batter missed the ball completely
    'EDGE',             # Bat-edge mentioned (nick, edge)
    'REVIEW',           # Mentions or request for review/DRS
    'FIELDING EFFORT',  # Fielding actions that don't cause dismissal
    'DROPPED CATCH',    # Catch opportunity missed
    'BALL CONTACT',     # Ball hits bat/pad/body/ground but no clear outcome

    # Informational
    'MILESTONE',             # 50/100 runs by player or team
    'BOWLING CHANGE',        # Change in bowler
    'CAPTAINCY DECISION',    # Field change, bowling choice, etc.
    'INJURY',                # Player injury
    'PLAYER INTRO',          # New batsman or bowler intro
    'WEATHER INTERRUPTION'   # Rain, light, etc.
]

# ---------------------------------------------------------------------------
# Resolve paths (use CLI args or sensible defaults)
# ---------------------------------------------------------------------------

DATA_DIR = Path(__file__).resolve().parent / "data"
DEFAULT_INPUT = DATA_DIR / "transcript_clean.json"
DEFAULT_OUTPUT_JSON = DATA_DIR / "transcript_labeled.json"
DEFAULT_OUTPUT_CSV = DATA_DIR / "transcript_labeled.csv"

input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
output_json_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT_JSON
output_csv_path = Path(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_OUTPUT_CSV

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

# Load cleaned transcript
with input_path.open("r", encoding="utf-8") as f:
    transcript = json.load(f)

labeled_transcript = []

# Loop through each line and send to Ollama
for i, item in enumerate(transcript):
    text = item["text"]
    prompt = (
        f"You are a cricket commentary classification assistant.\n\n"
        f"Label the following cricket commentary into one word from this list:\n"
        f"{list(VALID_LABELS)}.\n"
        f"Only reply with one of the labels exactly as it appears in the list.\n\n"
        f"- Focus on the 'Target Commentary' line. Use context only to disambiguate meaning if necessary apply some sentiment analysis to predict the labels.\n"
        f"Commentary: \"{text}\""
    )

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.3:latest",
                "prompt": prompt,
                "stream": False
            }
        )
        raw_label = response.json()["response"].strip().upper()

        # Use exact match to accommodate multi-word labels
        label = raw_label if raw_label in VALID_LABELS else "UNKNOWN"

        # Append labeled entry
        labeled_transcript.append({
            "start": item["start"],
            "end": item["end"],
            "text": text,
            "label": label
        })

        print(f"[{i+1}/{len(transcript)}] {label} <- {text}")

        time.sleep(1)  # Delay to avoid overloading
    except Exception as e:
        print(f"Error labeling: {text}\n{e}")
        continue

# Save to JSON
with output_json_path.open("w", encoding="utf-8") as f:
    json.dump(labeled_transcript, f, indent=4, ensure_ascii=False)

print("\n✅ Labeled transcript saved as transcript_promptsenti_llama3_labels_p8209.json")

import csv

# Write to CSV
with output_csv_path.open("w", newline="", encoding="utf-8") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=["start", "end", "text", "label"])
    writer.writeheader()
    for item in labeled_transcript:
        writer.writerow(item)

print("✅ CSV saved to:", output_csv_path)
