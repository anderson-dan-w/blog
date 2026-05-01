To keep track, we can add a `migrations/` folder to the codebase. Each schema change lands there as a numbered `.py` file: `001_create_widgets.py`, `002_add_color_column.py`.

A separate DB table tracks which migrations have been applied, which isolates `dev` and `prod` record-keeping.

Execution is a _bit_ more automated, since we don't need to remember which migration we're on.

But we still need to remember to run them in each environment. And there's no verification: if the folder and the database disagree, nothing catches it.
