```python
$ alembic revision --autogenerate -m "add color to widgets"

def upgrade() -> None:
    op.add_column("widgets", sa.Column("color")

def downgrade() -> None:
    op.drop_column("widgets", "color")
```

```shellsession
$ alembic check
FAILED: New upgrade operations detected: [('add_column', ...)]

$ alembic upgrade head
INFO  [alembic] Running upgrade 'add_color_to_widget'
```
