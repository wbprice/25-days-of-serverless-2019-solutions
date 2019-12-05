const azure = require("azure-storage");
const table_service = azure.createTableService();
const uuid = require("uuid/v4");
const table_name = process.env["AZURE_STORAGE_TABLE_NAME"];
const partition_key = process.env["AZURE_STORAGE_TABLE_PARTITION_KEY"];
const utils = require("./../utils");

function createDish(payload, callback) {
  // Makes a request to an Azure Table API table.
  // Creates a new record and returns the result.

  const id = uuid();
  const record = {
    PartitionKey: { _: partition_key },
    RowKey: { _: id },
    ...payload
  };

  table_service.insertEntity(table_name, record, (error, result, response) => {
    if (error) {
      // handle error
      return callback(error);
    }

    return callback(null, {
      id,
      ...payload
    });
  });
}

module.exports = function(context, req) {
  utils.validateInput(req.body, (err, payload) => {
    if (err) {
      // Handle errors, exit early.
      context.res = {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: err })
      };
      context.done();
    }

    createDish(payload, (err, payload) => {
      if (err) {
        // Handle errors, exit early
        context.res = {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: err })
        };
        context.done();
      }

      // Otherwise, respond with the created record.
      // Return the created record
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      };
      context.done();
    });
  });
};
