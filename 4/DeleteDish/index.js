const azure = require("azure-storage");
const table_service = azure.createTableService();
const table_name = process.env["AZURE_STORAGE_TABLE_NAME"];
const partition_key = process.env["AZURE_STORAGE_TABLE_PARTITION_KEY"];

function deleteDish(id, callback) {
  const key = {
    PartitionKey: partition_key,
    RowKey: id
  };

  table_service.deleteEntity(table_name, key, (err, result, response) => {
    if (err) {
      return callback(err);
    }

    callback(null, result);
  });
}

module.exports = function(context, req) {
  const id = req.params.id;
  if (!id) {
    context.res = {
      status: 404,
      body: JSON.stringify({ message: "'id' is a required parameter" })
    };
    context.done();
  }

  deleteDish(id, (err, _) => {
    if (err) {
      context.res = {
        status: 500,
        body: JSON.stringify({ message: err.message })
      };
      context.done();
    }

    context.res = {
      status: 200,
      body: "{}"
    };
    context.done();
  });
};
