# SIJ Landing Page

Migracion de la landing page y portal HelpDesk de SIJ desde cPanel/PHP/MySQL hacia Azure Static Web Apps Free, Azure Functions managed API y Azure Cosmos DB Free Tier.

Este repositorio reemplaza el backend PHP por APIs serverless con validacion server-side de identidad, roles y permisos. El repo original `marvicqui/ITSAS_LandingPage` no se modifica.

## Estado

- Frontend: React + Vite
- Hosting: Azure Static Web Apps Free
- API: Azure Functions administradas por Static Web Apps
- Auth: autenticacion nativa de Azure Static Web Apps con Microsoft Entra ID (`/.auth/login/aad`)
- Datos: Azure Cosmos DB for NoSQL con Free Tier
- Email: Microsoft Graph / O365
- CI/CD: GitHub Actions con Azure OIDC

Consulta `docs/DEPLOYMENT.md`, `docs/SECURITY.md` y `docs/DATA_MIGRATION.md` antes de ejecutar el primer despliegue.
