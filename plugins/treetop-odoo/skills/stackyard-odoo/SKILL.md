---
name: stackyard-odoo
description: Run Odoo in a StackYard environment of the TreeTop odoo-crm project - update modules, run module tests on a disposable database, list or drop databases, read logs, neutralize copied data. Use when you need to run, update or test Odoo code, or read Odoo's logs, in an odoo-crm checkout.
---

# Odoo in a StackYard environment

Each odoo-crm checkout under `~/Odoo/v19/projects/treetop/` is one StackYard environment: `odoo-crm` (dev), `odoo-crm-lab`, `odoo-crm-test`, and disposable case environments `odoo-crm-case-<n>`. Each has its own Odoo 19, PostgreSQL and Mailpit. The checkout's `.env` names its Compose project and its addresses: Odoo at `http://` + `ODOO_HOST`, Mailpit at `http://` + `MAILPIT_HOST`.

StackYard starts, stops, restores and snapshots environments: use its dashboard at http://stackyard.localhost. Never run `docker compose up`, `down`, `stop` or `rm` here: StackYard adds its own Compose file, which a plain `docker compose up` leaves out.

Run every command below from the checkout's own folder, so Compose picks the right project. `web` runs Odoo, `db` runs PostgreSQL as user `odoo`.

## Databases

- List: `docker compose exec -T db psql -U odoo -d postgres -Atc "SELECT datname FROM pg_database WHERE NOT datistemplate AND datname <> 'postgres'"`
- Drop, with its filestore: `docker compose exec -T web /mnt/odoo19/odoo-bin db -c /etc/odoo/odoo.conf drop <database>`

Only drop a database you created for a test.

## Update modules

```bash
docker compose exec -T web /mnt/odoo19/odoo-bin -c /etc/odoo/odoo.conf -d <database> -u <module1,module2> --stop-after-init
docker compose restart web
```

## Test a module

Always on a new, disposable database, never on a shared one or a copy of client data. The separate port keeps the test server clear of the running Odoo:

```bash
docker compose exec -T web /mnt/odoo19/odoo-bin -c /etc/odoo/odoo.conf -d test_<module>_<date> -i <module> --without-demo --test-tags=/<module> --stop-after-init --workers=0 --http-interface=127.0.0.1 --http-port=8070
```

Then drop `test_<module>_<date>` as shown above. Read the result from the output: `0 failed, 0 error(s)` means the tests passed. If two tests run at once in the same environment, give each its own port.

## Logs

`docker compose logs --tail 200 web`

## Copied client data

A database restored from a client environment must be neutralized before anything can send mail or call outside services:

```bash
docker compose exec -T web /mnt/odoo19/odoo-bin neutralize -c /etc/odoo/odoo.conf -d <database>
```

StackYard neutralizes the copies it makes for case environments. Mail goes to the environment's Mailpit either way.
