```python
from sqlalchemy import Column, Text
from sqlalchemy.schema import AddColumn
from my_app.db import get_engine  # reads $DATABASE_URL

stmt = AddColumn("widgets", Column("color", Text))

print(str(stmt.compile(dialect=postgresql.dialect())))
# ALTER TABLE widgets ADD COLUMN color TEXT

with get_engine().begin() as conn:
    conn.execute(stmt)
```
