const azure = require("azure-storage");
const table_service = azure.createTableService();
const uuid = require("uuid/v4");
const table_name = "holidaydishrsvptable";

function validateInput(payload, callback) {
  // Accepts a payload and callback function.
  // Payload must include dish and name keys.
  // If an error occurred, the callback is invoked with
  // an error message as the first argument
  // If the payload is OK, the callback is invoked with
  // no error message and a sanitized payload.

  const dish = payload["dish"];
  const name = payload["name"];

  if (!name) {
    callback("'name' is a required field");
  } else if (!dish) {
    callback("'dish' is a required field");
  } else if (typeof dish != "string") {
    callback("'dish' should be a string");
  } else if (typeof name != "string") {
    callback("'name' should be a string");
  } else {
    callback(null, {
      dish,
      name
    });
  }
}

function createDish(payload, callback) {
  // Makes a request to an Azure Table API table.
  // Creates a new record and returns the result.

  const record = {
    PartitionKey: { _: "holiday-dish-rsvp" },
    RowKey: { _: uuid() },
    ...payload
  };

  table_service.insertEntity(table_name, record, (error, result, response) => {
    if (error) {
      // handle error
      return callback(error);
    }

    callback(null, response);
  });
}

module.exports = async function(context, req) {
  validateInput(req.body, (err, payload) => {
    if (err) {
      // Handle errors, exit early.
      context.res = {
        status: 400,
        body: JSON.stringify({ message: err })
      };
      return;
    }

    createDish(payload, (err, payload) => {
      if (err) {
        // Handle errors, exit early
        context.res = {
          status: 500,
          body: JSON.stringify({ message: err })
        };
        return;
      }

      // Otherwise, respond with the created record.
      // Return the created record
      context.res = {
        status: 200,
        body: JSON.stringify(payload)
      };
    });
  });
};
