# Deployment

## Azure target

- Tenant ID: `e776ec58-7a3a-41b9-8ef0-09b7e9deaeb3`
- Subscription ID: `249b0fb1-5fe0-4d20-87d8-3dc4117716bc`
- Resource group: `mxc-sij-landing`
- Hosting: Azure Static Web Apps Free
- Database: Azure Cosmos DB for NoSQL Free Tier

## GitHub variables

Create these repository variables:

- `AZURE_TENANT_ID`: `e776ec58-7a3a-41b9-8ef0-09b7e9deaeb3`
- `AZURE_SUBSCRIPTION_ID`: `249b0fb1-5fe0-4d20-87d8-3dc4117716bc`
- `AZURE_RESOURCE_GROUP`: `mxc-sij-landing`
- `STATIC_WEB_APP_NAME`: `swa-sij-landing`
- `OPENAI_MODEL`: `gpt-4o-mini`

## GitHub secrets

Create these repository secrets:

- `AZURE_CLIENT_ID`: client ID of the Entra app registration used by GitHub OIDC.
- `GRAPH_CLIENT_ID`: Entra app registration with Microsoft Graph `Mail.Send` application permission.
- `GRAPH_CLIENT_SECRET`: secret for the Graph app registration.
- `OPENAI_API_KEY`: existing OpenAI API key for the chatbot.

## One-time Azure identity setup

Create an Entra app registration for GitHub Actions and add a federated credential:

- Issuer: `https://token.actions.githubusercontent.com`
- Subject: `repo:marvicqui/sij_landingpage:ref:refs/heads/main`
- Audience: `api://AzureADTokenExchange`

Grant this app contributor access on resource group `mxc-sij-landing`.

## Workflows

1. Run `Provision Azure resources` manually. It creates Static Web Apps and Cosmos DB, then writes app settings to the SWA managed API.
2. Run `Deploy Static Web App` manually or push to `main`.

## Domains and DNS

Use Azure Static Web Apps custom domains for `sij.mx` or the chosen subdomain. In GoDaddy, add the TXT/CNAME records Azure provides during domain validation. Ongoing app deployments are CI/CD zero-touch after the one-time DNS validation.

## O365 mail

The Graph app must have application permission `Mail.Send` and admin consent. The mailboxes used by the app are:

- `soporte@sij.mx`
- `ventas@sij.mx`
