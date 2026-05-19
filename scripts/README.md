# scripts

Occasional helpers for the blog. Stdlib-only Python so there's no environment to manage.

## `fetch_contributions.py`

Pulls GitHub contribution counts across one or more accounts, merges them by date, and writes `public/contributions.json` for the `/contributions` page to render.

```sh
export GITHUB_TOKEN=ghp_xxx            # any default-scope PAT works
export GITHUB_USERS=handle1,handle2    # accounts to merge
# optional: START_YEAR, END_YEAR (defaults: 2014..now)
python3 scripts/fetch_contributions.py
```

Re-run whenever you want a refresh, then commit the updated JSON.

Notes:

- `contributionsCollection` reads any public user — one token from any account is enough.
- Private contributions only appear if the owning account has **Settings → Profile → Include private contributions on my profile** enabled.
- Rate limit: ~1 point per yearly query out of 5000/hour — trivial.
