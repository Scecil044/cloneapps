# API Key Authentication

## Overview

This document explains how to use API key authentication to expose routes from the PEO Central API to external applications.

## How It Works

The API key authentication system allows external applications to access specific routes without requiring a JWT token. Instead, they can use an API key provided in the request headers.

## Generating an API Key

To generate an API key, make a POST request to the following endpoint:

```
POST /v1/apikeys/generate
```

Request body:
```json
{
  "appName": "Your Application Name"
}
```

This endpoint requires authentication with a JWT token. The generated API key will be returned in the response.

## Using an API Key

To use an API key, include it in the `X-API-Key` header of your request:

```
X-API-Key: your-api-key-here
```

## Available External Routes

The following routes are available for external applications using API key authentication:

```
GET /v1/external/industries
GET /v1/external/industries/:industryId
```

## Creating New External Routes

To create new routes that use API key authentication:

1. Add your route to the `external.routes.js` file
2. Use the `verifyApiKey` middleware to protect the route

Example:

```javascript
router.route('/your-route')
  .all(verifyApiKey)
  .get(yourController.yourMethod);
```

## Security Considerations

- Keep your API keys secure and do not share them publicly
- API keys should be rotated periodically for security
- Consider implementing rate limiting for API key authenticated routes
- Monitor API key usage for suspicious activity
