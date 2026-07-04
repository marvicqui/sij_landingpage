# SIJ Landing Page

Migracion de la landing page y portal HelpDesk de SIJ desde cPanel/PHP/MySQL hacia Azure Static Web Apps Free, Azure Functions managed API y Azure Cosmos DB Free Tier.

Este repositorio reemplaza el backend PHP por APIs serverless con validacion server-side de identidad, roles y permisos. El repo original `marvicqui/ITSAS_LandingPage` no se modifica.

## Arquitectura

- Frontend: React + Vite
- Hosting: Azure Static Web Apps Free
- API: Azure Functions administradas por Static Web Apps
- Auth: autenticacion nativa de Azure Static Web Apps con Microsoft Entra ID (`/.auth/login/aad`)
- Datos: Azure Cosmos DB for NoSQL con Free Tier
- Email: Microsoft Graph / O365
- CI/CD: GitHub Actions con Azure OIDC

## Primer despliegue

1. Configura OIDC entre GitHub Actions y Azure.
2. Agrega variables/secrets descritos en `docs/DEPLOYMENT.md`.
3. Ejecuta el workflow `Provision Azure resources`.
4. Ejecuta el workflow `Deploy Static Web App` o haz push a `main`.
5. Configura dominio custom y DNS en GoDaddy.
6. Importa los datos actuales con `scripts/import-mysql-json.mjs`.

## Documentacion

- `docs/DEPLOYMENT.md`: despliegue zero-touch y variables requeridas.
- `docs/SECURITY.md`: hallazgos de seguridad y controles nuevos.
- `docs/DATA_MIGRATION.md`: export/import desde MySQL hacia Cosmos DB.
- `docs/OPERATIONS.md`: operacion, monitoreo y runbooks breves.
