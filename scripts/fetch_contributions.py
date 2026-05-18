#!/usr/bin/env python3
"""Fetch GitHub contribution counts across one or more accounts and merge them
into a single day-by-day series for the /blog/contributions page.

Stdlib-only on purpose: this runs occasionally on a laptop, not in CI.

Env vars:
  GITHUB_TOKEN  A classic or fine-grained PAT. Default-scope is enough — we
                only read public profile data via the GraphQL API. One token
                from any account is fine; contributionsCollection works on
                any public user.
  GITHUB_USERS  Comma-separated logins to merge, e.g. "handle1,handle2".
  START_YEAR    Earliest year to query (default 2014).
  END_YEAR      Latest year to query (default = current UTC year).

Writes ../public/contributions.json relative to this file.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

GRAPHQL_URL = "https://api.github.com/graphql"

QUERY = """
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
"""


def gql(token: str, login: str, from_: str, to: str) -> dict:
    payload = json.dumps(
        {
            "query": QUERY,
            "variables": {"login": login, "from": from_, "to": to},
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        GRAPHQL_URL,
        data=payload,
        headers={
            "Authorization": f"bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "contributions-heatmap-script",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def fetch_user(login: str, token: str, start_year: int, end_year: int) -> dict[str, int]:
    """Return {YYYY-MM-DD: count} for one user across [start_year, end_year]."""
    out: dict[str, int] = {}
    for year in range(start_year, end_year + 1):
        body = gql(
            token,
            login,
            f"{year}-01-01T00:00:00Z",
            f"{year}-12-31T23:59:59Z",
        )
        if "errors" in body:
            raise RuntimeError(f"GraphQL error for {login} {year}: {body['errors']}")
        user = body["data"]["user"]
        if user is None:
            raise RuntimeError(f"user not found: {login}")
        weeks = user["contributionsCollection"]["contributionCalendar"]["weeks"]
        for w in weeks:
            for day in w["contributionDays"]:
                out[day["date"]] = out.get(day["date"], 0) + day["contributionCount"]
    return out


def to_level(count: int) -> int:
    # Coarse buckets matched to a multi-account merge (any given day can clear
    # 10+ contributions easily). Mirrors GitHub's 5-level scale.
    if count == 0:
        return 0
    if count < 4:
        return 1
    if count < 10:
        return 2
    if count < 20:
        return 3
    return 4


def main() -> int:
    token = os.environ.get("GITHUB_TOKEN")
    users_raw = os.environ.get("GITHUB_USERS", "")
    start_year = int(os.environ.get("START_YEAR", "2014"))
    end_year = int(os.environ.get("END_YEAR", str(datetime.now(timezone.utc).year)))

    if not token:
        print("error: set GITHUB_TOKEN env var", file=sys.stderr)
        return 1
    users = [u.strip() for u in users_raw.split(",") if u.strip()]
    if not users:
        print("error: set GITHUB_USERS env var (comma-separated)", file=sys.stderr)
        return 1

    merged: dict[str, int] = {}
    for u in users:
        print(f"fetching {u} ({start_year}-{end_year})...", file=sys.stderr)
        for date, n in fetch_user(u, token, start_year, end_year).items():
            merged[date] = merged.get(date, 0) + n

    data = [
        {"date": d, "count": c, "level": to_level(c)}
        for d, c in sorted(merged.items())
    ]
    out = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "accounts": users,
        "startYear": start_year,
        "endYear": end_year,
        "totalContributions": sum(merged.values()),
        "data": data,
    }
    out_path = Path(__file__).resolve().parent.parent / "public" / "contributions.json"
    out_path.write_text(json.dumps(out, indent=2) + "\n")
    print(
        f"wrote {out_path} ({len(data)} days, {out['totalContributions']} contributions)",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
