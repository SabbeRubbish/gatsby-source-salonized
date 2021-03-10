exports.onPreInit = () => console.log("Loaded gatsby-source-api-csv");

const axios = require("axios");

const baseUrl = "https://api.salonized.com";
const objectsToFetch = [
  "products",
  "services",
  "appointments",
  "orders",
  "customers",
  "messages",
  "feedbacks",
  "notes",
];

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

//
// Implements the Source Nodes API to get data from Salonized into Gatsby's GraphQL model
//
exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId, getNodesByType },
  pluginOptions
) => {
  const { createNode } = actions;

  const cookieRequestData = `${encodeURIComponent(
    "user[email]"
  )}=${encodeURIComponent(pluginOptions.salonizedEmail)}&${encodeURIComponent(
    "user[password]"
  )}=${encodeURIComponent(pluginOptions.salonizedPassword)}`;

  // First, get your cookie!
  try {
    var cookieResponse = await axios.post(
      "https://api.salonized.com/sessions",
      cookieRequestData,
      {
        headers: {
          Origin: "https://app.salonized.com",
          Referer: "https://app.salonized.com/",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );
  } catch (error) {
    console.error(`Error fetching cookie: ${error}`);
  }

  // Build the simultaneuous requests
  var arrayOfRequests = objectsToFetch.map((object) => {
    return axios.get(`https://api.salonized.com/${object}`, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        Cookie: cookieResponse.headers["set-cookie"].join("; "),
      },
    });
  });

  // Now get the data
  var results = await Promise.all(arrayOfRequests);

  objectsToFetch.forEach((object, index) => {
    var items = results[index].data[object];
    console.info(`Creating ${items.length} Salonized item type "${object}"`);
    items.map((objectData) => {
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
};
