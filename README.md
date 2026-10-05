# Forge SPM Casting Plan Optimizer

A Django and SQLite application for converting BTR demand workbooks into
material campaigns, casting heat sequences, and downloadable rolling plans.

## Stack

- Python 3.13 and Django 5
- SQLite
- Pandas, OpenPyXL, and xlrd
- Server-rendered Django templates

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8080
```

The demo command creates superuser `ADMIN` with password `ADMIN@1234` and `planner` with password `ChangeMe123!`. Change these passwords immediately outside local development.

## BTR workbook format

The parser accepts `.xlsx`, `.xls`, and `.xlsm` files. Column names are matched
case-insensitively:

| Required | Accepted examples |
| --- | --- |
| Section | Section, Profile, Material |
| Grade | Grade, Steel Grade, Quality |
| Quantity | Quantity, Qty, Demand, Order Qty, Tonnage, Weight |

`Order Number` and `Due Date` are optional. Section/grade rules are maintained
in Django Admin under **Rule Masters**.

## Production configuration

Set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`,
`DJANGO_CSRF_TRUSTED_ORIGINS`, `DJANGO_TIME_ZONE`, and
`DJANGO_DEBUG=false`. Run `collectstatic`, serve uploaded media from protected
storage, and place Gunicorn behind an HTTPS reverse proxy.
