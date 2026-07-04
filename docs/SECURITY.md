# Security Review

## Key risks found in the cPanel/PHP version

- PHP APIs accepted unauthenticated requests and trusted `email`, `actor`, role and status values sent by the browser.
- `Access-Control-Allow-Origin: *` was enabled on sensitive endpoints.
- Clients fetched all tickets and the frontend filtered locally.
- Admin endpoints for whitelist, engineers, services, KB and macros had no server-side authorization.
- Ticket approval links used deterministic `md5(ticket_id + secreto_itsas)` tokens.
- Secrets were injected into built output with `sed` during FTP deploy.
- Uploads were stored publicly without strong validation.
- Database error details could be returned to clients.
- The public repository contained historical zip/doc artifacts that are not needed for runtime.

## Controls in this repository

- Microsoft Entra sign-in through Static Web Apps built-in auth.
- Every protected API reads identity from `x-ms-client-principal`; client-supplied identity is ignored.
- Ticket reads are scoped server-side: clients see only their own tickets; engineers see all.
- Admin config mutations require `ADMIN_EMAILS`.
- Approval links use random 256-bit tokens hashed in Cosmos DB with a seven-day expiry.
- Secrets live in Azure Static Web Apps app settings and GitHub secrets, not in build output.
- Static security headers are configured in `staticwebapp.config.json`.
- GitHub auth provider is blocked so portal access uses Microsoft Entra.

## Remaining recommendations

- Add Azure Storage for ticket attachments if attachments are still required; validate MIME type, size and malware scanning before public access.
- Enable Application Insights and alert on 401/403 spikes, OpenAI failures and Graph mail failures.
- Use a dedicated Entra group for engineers/admins and sync it into Cosmos or app settings.
- Rotate `GRAPH_CLIENT_SECRET`, `OPENAI_API_KEY` and Cosmos keys periodically.
- Protect `main` with required checks and signed commits if possible.
