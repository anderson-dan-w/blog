```python
MIGRATIONS_DIR = Path(__file__).parent / "migrations"

with get_engine().begin() as conn:
    applied = conn.execute("SELECT name FROM schema_migrations")
    for path in sorted(MIGRATIONS_DIR.glob("*.py")):
        if path in applied:
            continue
        module_load(path).upgrade(conn)  # each file defines upgrade(conn)
        conn.execute("INSERT {path} INTO schema_migrations")
```
