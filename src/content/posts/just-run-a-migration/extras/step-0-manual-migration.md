```bash
$ kubectl exec -it deploy/api -n dev -- bash
$ psql "$DATABASE_URL"
dev=# ALTER TABLE widgets ADD COLUMN color TEXT;
ALTER TABLE
dev=# \q
$ exit
# ...now do it again for prod. don't forget! don't mess up!
```

```python
class Widgets(Base):
  # ...
  color: Mapped[str]
```
