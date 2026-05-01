Rather than writing raw SQL and _separately_ updating the `Python` model code, we can combine them for consistency.

`SQLAlchemy` can dump the raw SQL that would have gotten emitted, and even run it for us, if we're connected to a DB.

This lets us:
- more easily _record_ the migrations we ran
- keep `column names` and `data types` consistent from `Postgres` to `Python`

But:
- still requires manual execution
- now we need to _track_ which migrations already ran
