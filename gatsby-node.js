/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
// You can delete this file if you're not using it

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.com/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */
exports.onPreInit = () => console.log("Loaded gatsby-source-api-csv");

const https = require("https");
const baseUrl = "https://api.salonized.com";
const objectsToFetch = [
  "products",
  "services",
  "appointments",
  "orders",
  "customers",
  "messages",
  "feedbacks",
];

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

// Now we can use the cookie in the next request for data
exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId, getNodesByType },
  pluginOptions
) => {
  const { createNode } = actions;

  var getCookieOptions = {
    path: "/sessions",
    agent: false, // false = Create a new agent just for this one request
    method: "POST",
    headers: {
      Origin: "https://app.salonized.com",
      Referer: "https://app.salonized.com/",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  };

  // First, get your cookie!
  var getCookieRequest = https.request(
    "https://api.salonized.com/sessions",
    getCookieOptions,
    (res) => {
      var cookies = res.headers["set-cookie"];

      // Now get the data
      var getDataOptions = {
        hostname: "api.salonized.com",
        port: 443,
        agent: false, // Create a new agent just for this one request
        method: "GET",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          Cookie: cookies.join("; "),
        },
      };

      objectsToFetch.map((object) => {
        var getDataRequest = https.request(
          `https://api.salonized.com/${object}.json`,
          getDataOptions,
          (res) => {
            var data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              // TODO: the following "products" must be generalized based on "object" string
              JSON.parse(data)[object].map((objectData) => {
                createNode({
                  ...objectData,
                  id: "" + objectData.id,
                  parent: null,
                  children: [],
                  internal: {
                    type: `salonized${object.capitalize()}`,
                    content: "",
                    contentDigest: createContentDigest(objectData),
                  },
                });
              });
            });
          }
        );

        getDataRequest.end();
      });
    }
  );

  getCookieRequest.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  const data = `${encodeURIComponent("user[email]")}=${encodeURIComponent(
    pluginOptions.salonizedEmail
  )}&${encodeURIComponent("user[password]")}=${encodeURIComponent(
    pluginOptions.salonizedPassword
  )}`;
  getCookieRequest.write(data);
  getCookieRequest.end();
};
