---
name: cj-dropshipping-auth
display_name: "CJ Dropshipping Auth"
description: "Get, refresh, or revoke a CJ Dropshipping API 2.0 access token (CJ-Access-Token)"
category: ecommerce
icon: key
skill_type: sandbox
catalog_type: addon
tool_schema:
  name: cj_dropshipping_auth
  description: "Authenticate with the CJ Dropshipping API 2.0 and return an access token to send as the CJ-Access-Token header"
  parameters:
    type: object
    properties:
      action:
        type: "string"
        description: "get_token (default; uses cached token if still valid), refresh_token, or logout"
        enum: ["get_token", "refresh_token", "logout"]
        default: "get_token"
      api_key:
        type: "string"
        description: "CJ API key (CJ dashboard > Authorization > API). Optional if CJ_API_KEY env var is set."
      refresh_token:
        type: "string"
        description: "Refresh token (for refresh_token; defaults to the cached one)"
      access_token:
        type: "string"
        description: "Access token (for logout; defaults to the cached one)"
      force:
        type: "boolean"
        description: "Ignore the cache and request a new token (CJ rate-limits getAccessToken)"
        default: false
    required: []
---
# CJ Dropshipping Auth

Authenticates against the CJ Dropshipping API 2.0
(`https://developers.cjdropshipping.com/api2.0/v1`).

| action | endpoint | body / header |
|---|---|---|
| `get_token` | `POST /authentication/getAccessToken` | `{"apiKey": "..."}` |
| `refresh_token` | `POST /authentication/refreshAccessToken` | `{"refreshToken": "..."}` |
| `logout` | `POST /authentication/logout` | header `CJ-Access-Token` |

Returns `accessToken`, `accessTokenExpiryDate`, `refreshToken`,
`refreshTokenExpiryDate` and `openId`. Send the access token on every
later CJ call as the header `CJ-Access-Token: <accessToken>` (for example
via the `rest_api_call` tool).

Tokens are cached in `/tmp/cj_token.json` and reused until close to
expiry, because CJ rate-limits `getAccessToken` (roughly once per 5
minutes). Access tokens last about 15 days; refresh tokens about 180 days.

The API key is read from the `api_key` input or the `CJ_API_KEY`
environment variable. Never echo the key back to the user.
