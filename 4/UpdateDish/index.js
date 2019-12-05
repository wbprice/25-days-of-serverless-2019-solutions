const azure = require("azure-storage");
const table_service = azure.createTableService();
const table_name = process.env["AZURE_STORAGE_TABLE_NAME"];
const partition_key = process.env["AZURE_STORAGE_TABLE_PARTITION_KEY"];
const utils = require('./../utils');

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
    return callback(null, {
      id,
      ...payload
    });
  });
}

module.exports = function(context, req) {
  const id = req.params.id;

  console.log("potato: " + id);

  if (!id) {
    context.res = {
      status: 404,
      body: JSON.stringify({ message: "'id' is a required parameter" })
    };
    context.done();
  }

  utils.validateInput(req.body, (err, payload) => {
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
