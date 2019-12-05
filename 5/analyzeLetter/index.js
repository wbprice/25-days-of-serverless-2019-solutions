const os = require("os");
const CognitiveServicesCredentials = require("@azure/ms-rest-js");
const TextAnalyticsAPIClient = require("@azure/cognitiveservices-textanalytics");



function validateInput(input, callback) {
  // Valid input should include a name and message field.
  // Confirm that those exist and are strings.
  // If there are any extra fields, omit them.
  const { name, message } = input;
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

function detectLanguage() {

}

function detectNiceness() {

}


module.exports = function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  validateInput(req.body, (err, {name, message}) => {
    if (err) {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
        context.done();
    }



  });
};
