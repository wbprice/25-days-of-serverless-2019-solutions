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

function validateInput(input, callback) {
  // Valid input should include a name and message field.
  // Confirm that those exist and are strings.
  // If there are any extra fields, omit them.

  const name = input["name"];
  const message = input["message"];

  if (!name) {
    callback("'name' is a required field.");
  } else if (!message) {
    callback("'message' is a required field.");
  } else if (typeof name != "string") {
    callback("'name' should be a string'");
  } else if (typeof message != "string") {
    callback("'message' should be a string");
  }

  callback(null, {
    name,
    message
  });
}

function detectLanguage(message, callback) {
  // Passes message to the text analytics api, determines what language is being used.
  textAnalyticsClient
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
        callback(result.errors);
      }

      const sortedDetectedLanguages = detectedLanguages.sort((a, b) =>
        a.score > b.score ? 1 : -1
      );

      callback(null, sortedDetectedLanguages[0]);
    });
}

function detectNiceness(language, message, callback) {
  // Passes message to the text analytics api, determines how nice the person is
  textAnalyticsClient
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
        return callback(result.errors);
      }
      const response = result.documents[0];
      callback(null, response["score"]);
    });
}

function determineNaughtyOrNice(message, callback) {
  detectLanguage(message, (err, language) => {
    if (err) {
      return callback(err);
    }
    detectNiceness(language, message, (err, niceness) => {
      if (err) {
        return callback(err);
      }
      return callback(null, {
        message,
        language: language["iso6391Name"],
        niceness
      });
    });
  });
}

module.exports = function(context, req) {
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

  validateInput(req.body, (err, body) => {
    if (err) {
      context.res = {
        status: 400,
        body: JSON.stringify({ message: err })
      };
      context.done();
    }

    const { message, name } = body;

    determineNaughtyOrNice(message, (err, nicenessReport) => {
      if (err) {
        context.res = {
          status: 500,
          body: JSON.stringify({ message: err })
        };
        context.done();
      }

      context.res = {
        status: 200,
        body: JSON.stringify({
          name,
          ...nicenessReport
        })
      };
      context.done();
    });
  });
};
