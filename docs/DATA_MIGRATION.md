# Data Migration

The old app stores tickets in MySQL tables such as `tickets`, `ticket_updates`, `allowed_clients`, `engineers_list`, `services_list`, `kb_articles` and `macros_list`.

## Export from cPanel/MySQL

Export each table as JSON if phpMyAdmin supports it, or export CSV and convert to JSON with matching file names:

- `tickets.json`
- `ticket_updates.json`
- `allowed_clients.json`
- `engineers_list.json`
- `services_list.json`
- `kb_articles.json`
- `macros_list.json`

Put the files in a local folder named `export/`.

If you export from MySQL CLI, use a read-only user and avoid dumping secrets:

```bash
mysqldump --single-transaction --skip-lock-tables --no-create-info --complete-insert DB_NAME tickets ticket_updates allowed_clients engineers_list services_list kb_articles macros_list > sij_helpdesk_data.sql
```

## Import to Cosmos DB

After the Azure resources exist, set these environment variables locally or in a temporary secure runner:

```bash
export COSMOS_ENDPOINT="https://<account>.documents.azure.com:443/"
export COSMOS_KEY="<primary-key>"
export COSMOS_DATABASE="sij-helpdesk"
export COSMOS_CONTAINER="helpdesk"
node scripts/import-mysql-json.mjs export
```

## Attachments

The PHP version stores uploaded files under `/uploads`. This migration does not import attachments into Cosmos DB. If historical attachments are required, provision Azure Storage Blob and migrate files separately, then update `attachmentUrl` in ticket updates.
