# gatsby-source-salonized

Source plugin for pulling several content types into Gatsby from a [Salonized](https://www.salonized.com) subscription. It creates nodes so the data can be queried using GraphQL.

You need a paid subscription at Salonized to be able to use this source plugin.

**DISCLAIMER:**
Officially, there is no API for Salonized to get this information from. Luckily, their platform uses a great front-end API that we can access using cookie authentication.
Use this API at your own discretion and don't count on it being available forever.

## Install

```shell
npm install gatsby-source-salonized
```

## Usage

1. You'll have to enter your admin username and password in the configuration of the plugin. I advise to use environment variable files `.env.development` and `env.production` for this:

```text
SALONIZED_EMAIL=<username>
SALONIZED_PASSWORD=<password>
```
and:
```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-salonized`,
      options: {
        salonizedEmail: process.env.SALONIZED_EMAIL,
        salonizedPassword: process.env.SALONIZED_PASSWORD,
      },
    },
  ],
};
```

Make sure that your `.env.*` files are listed in `.gitignore` so you're not sharing this with anyone. You'll also have to add them to your Gatsby Cloud, Netlify, ... host.

2. Next, you can just access the different nodes via GraphQL:

```json
allSalonizedCustomers {
  edges {
    node {
      first_name
      last_name
      email
      newsletter_enabled
      state
      birthday_wishes_enabled
    }
  }
}
```

All fields that are returned from the Salonized API are available.

## Supported entity types

Currently, the following entity types are available:
- products
- services
- appointments
- orders
- customers
- messages
- customer feedback

I'm still learning about useful API calls as there is no documentation from Salonized on this.

**TODO:** links between content types (customer -> )

## Authentication (internals)

As I mentioned before, there is no official OAuth-secured API available, as confirmed by Salonized customer support.

However, using cookie authentication, it is possible to query lots of information from your Salonized account.

The cookie authentication is executed with every build of Gatsby. This means that your username/password is sent (securly over HTTPS) to get a session cookie. They seem to be valid for 2 years, but I'd rather not store them. The cookie retrieval is not done using virtual form submission, but by posting to `https://api.salonized.com/sessions`.

After that, the received cookie is used to get the other information out.

## Updates / Subscription / Webhooks

There are no webhooks in Salonized (as far as I know) and the platform isn't really extensible for account owners. That means that content updates like orders, customers, products, .. are only updated on Gatsby build!

This means that you need to rebuild your (static) Gatsby site for each content update you make. This is normal behaviour for these static Gatsby sites, but is definitely more problematic if no webhooks are available. 

You were warned.

## License

[MIT](https://choosealicense.com/licenses/mit/)