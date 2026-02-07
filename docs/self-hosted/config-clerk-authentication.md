# Configure Clerk Authentication

DistApp supports Clerk as an authentication provider, enabling users to sign in using their email addresses.

## Setting Up Clerk

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application in your Clerk dashboard
3. Navigate to the API keys section and copy your publishable and secret keys

## Configure Environment Variables

Add the following environment variables to your DistApp configuration to enable Clerk authentication:

```shell
NUXT_PUBLIC_CLERK_AUTH_ENABLED=true
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ # Your Clerk publishable key
NUXT_CLERK_SECRET_KEY=sk_test_ # Your Clerk secret key
```

After adding these variables, restart your deployment to apply the changes.
