const azure = require("azure-storage");
const table_service = azure.createTableService();
const table_name = process.env["AZURE_STORAGE_TABLE_NAME"];
const partition_key = process.env["AZURE_STORAGE_TABLE_PARTITION_KEY"];

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

function updateDish(id, payload, callback) {
  const record = {
    PartitionKey: { _: partition_key },
    RowKey: { _: id },
    ...payload
  };

  table_service.replaceEntity(table_name, record, (err, result, response) => {
    if (err) {
      return callback(err);
    }
    return callback(null, response);
  });
}

module.exports = async function(context, req) {
  const id = req.params.id;
  if (!id) {
    context.res = {
      status: 404,
      body: JSON.stringify({ message: "'id' is a required parameter" })
    };
    context.done();
  }

  validatePayload(req.body, (err, payload) => {
    if (err) {
      context.res = {
        status: 400,
        body: JSON.stringify({ message: err.message })
      };
      context.done();
    }

    updateDish(id, payload, (err, response) => {
      if (err) {
        context.res = {
          status: 500,
          body: JSON.stringify({ message: err.message })
        };
        context.done();
      }

      context.res = {
        status: 200,
        body: JSON.stringify(response)
      };
      context.done();
    });
  });
};
