# Operations

## Normal release

Push to `main`. The deploy workflow builds React, installs the Functions API, fetches the Static Web Apps deployment token through Azure OIDC, and uploads the app.

## Rollback

Use the Azure Static Web Apps deployment history or revert the Git commit and push to `main`.

## Health checks

- Landing page: `/`
- Auth status: `/.auth/me`
- API session: `/api/me` after sign-in
- Services list: `/api/services`

## Common failures

- `403 Resource not accessible by integration`: GitHub App does not have access to the repo.
- `401` on dashboard: user is not signed in through `/.auth/login/aad`.
- `403` after sign-in: user email/domain is not allowed or is missing from admin/engineer lists.
- Contact mail not sent: check Graph app permissions and `GRAPH_CLIENT_SECRET`.
- Chatbot unavailable: check `OPENAI_API_KEY` and `OPENAI_MODEL` Static Web App settings.
