const CognitiveServicesCredentials = require("@azure/ms-rest-js");
const TextAnalyticsAPIClient = require("@azure/cognitiveservices-textanalytics");
const uuid = require("uuid/v4");
const subscription_key = process.env["TEXT_ANALYTICS_SUBSCRIPTION_KEY"];
const endpoint = process.env["TEXT_ANALYTICS_ENDPOINT"];

const creds = new CognitiveServicesCredentials.ApiKeyCredentials({
  inHeader: { "Ocp-Apim-Subscription-Key": subscription_key }
});
const textAnalyticsClient = new TextAnalyticsAPIClient.TextAnalyticsClient(
  creds,
  endpoint
);

async function validateInput(input) {
  // Valid input should include a name and message field.
  // Confirm that those exist and are strings.
  // If there are any extra fields, omit them.

  const name = input["name"];
  const message = input["message"];

  if (!name) {
    throw new Error("'name' is a required field.");
  } else if (!message) {
    throw new Error("'message' is a required field.");
  } else if (typeof name !== "string") {
    throw new Error("'name' should be a string'");
  } else if (typeof message !== "string") {
    throw new Error("'message' should be a string");
  }

  return {
    name,
    message
  };
}

function detectLanguage(message) {
  // Passes message to the text analytics api, determines what language is being used.
  return textAnalyticsClient
    .detectLanguage({
      languageBatchInput: {
        documents: [
          {
            id: uuid(),
            text: message
          }
        ]
      }
    })
    .then(result => {
      const document = result.documents[0];
      const detectedLanguages = document.detectedLanguages;

      if (result.errors.length) {
        return Promise.reject(result.errors);
      }

      const sortedDetectedLanguages = detectedLanguages.sort((a, b) =>
        a.score > b.score ? 1 : -1
      );

      return sortedDetectedLanguages[0];
    });
}

function detectNiceness(language, message) {
  // Passes message to the text analytics api, determines how nice the person is
  return textAnalyticsClient
    .sentiment({
      multiLanguageBatchInput: {
        documents: [
          {
            id: uuid(),
            language: language["iso6391Name"],
            text: message
          }
        ]
      }
    })
    .then(result => {
      if (result.errors.length) {
        return Promise.reject(result.errors);
      }
      const response = result.documents[0];
      return response["score"];
    });
}

async function determineNaughtyOrNice(message) {
  const language = await detectLanguage(message);
  const niceness = await detectNiceness(language, message);

  return {
    message,
    language: language["iso6391Name"],
    niceness
  };
}

module.exports = async function(context, req) {
  /*
    Accepts a payload like:

    {
        "name": "Blaine",
        "message": "mina föräldrar är verkligen inte bra på tekniska saker"
    }

    and returns a response:

    {
        "name": "Blaine",
        "message": "mina föräldrar är verkligen inte bra på tekniska saker",
        "language": "sv",
        "niceness": 0
    }
  */

  let body;

  try {
    body = await validateInput(req.body);
  } catch (err) {
    return {
      status: 400,
      body: JSON.stringify({ message: err })
    };
  }

  const { message, name } = body;
  let nicenessReport;

  try {
    nicenessReport = await determineNaughtyOrNice(message);
  } catch (err) {
    return {
      status: 500,
      body: JSON.stringify({ message: err })
    };
    throw err;
  }

  return {
    status: 200,
    body: JSON.stringify({
      name,
      ...nicenessReport
    })
  };
};
