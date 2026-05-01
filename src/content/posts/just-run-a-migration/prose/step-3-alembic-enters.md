Of course, this isn't the first time people have needed to generate and track DB migrations, so there's a package for that already. `Alembic` is the official tool for improving `SQLAlchemy` migrations.

`Alembic`:
- handles the `migrations/` folder and tracking for us
- provides simplified commands for applying migrations
- and for _checking_ if everything is up to date and in order

But it really shines because it can _autogenerate the migration code_ so we don't have to.

We bring our updated `SQLAlchemy` model, connect to one of our `Postgres` DBs, and `Alembic`:
- makes a _diff_ of the DB schemas
- writes the `upgrade()` function
- even writes the `downgrade()` function if we need to roll back
