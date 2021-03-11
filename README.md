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

```text:title=process.env.*
SALONIZED_EMAIL=<username>
SALONIZED_PASSWORD=<password>
```

and in your gatsby-config.js:

```javascript:title=gatsby-config.js
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

```javascript
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
  - product categories
- services
  - service categories
- appointments
- orders
- customers
- messages
- customer feedback
- notes
- locations
- resources (i.e. employees)
- prepaid cards
- timeline items (audit logs if you wish)
- form submissions (like for COVID registration)
- companies
- suppliers
- VAT rates

Some items are not available through obvious APIs, like rosters and requirements.

I'm still learning about useful API calls as there is no documentation from Salonized on this.
In my demo setup I didn't always have form submissions, notes, .. That means I didn't know what dependencies they might have. If you need more dependencies resolved from these entities either fork this module or contact me [@SabbeRubbish](https://github.com/SabbeRubbish).

**From v 1.1.0**: you can now also query entity links. So if an entity has a property `customer_id` there will be a field `customer` with all data available to use in your query.

## Dependencies

- [axios](https://www.npmjs.com/package/axios) for smart (parallel) HTTPS querying (and much simpler and async code)

## Authentication (internals)

As I mentioned before, there is no official OAuth-secured API available, as confirmed by Salonized customer support.

However, using cookie authentication, it is possible to query lots of information from your Salonized account.

The cookie authentication is executed with every build of Gatsby. This means that your username/password is sent (securly over HTTPS) to get a session cookie. They seem to be valid for 2 years, but I'd rather not store them. The cookie retrieval is not done using virtual form submission, but by posting to `https://api.salonized.com/sessions`.

After that, the received cookie is used to get the other information out.

## Updates / Subscription / Webhooks

There are no webhooks in Salonized (as far as I know) and the platform isn't really extensible for account owners. That means that content updates like orders, customers, products, .. are only updated on Gatsby build!

This means that you need to rebuild your (static) Gatsby site for each content update you make. This is normal behaviour for these static Gatsby sites, but is definitely more problematic if no webhooks are available.

You were warned.

## Version history

| Version | Date       | Notes                                                                                                    |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2021-03-11 | Includes links in GraphQL schema - <br/>**Breaking change**: entities are now singular instead of plural |
| 1.0.2   | 2021-03-09 | Basic working module                                                                                     |

## License

[MIT](https://choosealicense.com/licenses/mit/)
