const azure = require("azure-storage");
const table_service = azure.createTableService();
const table_name = process.env["AZURE_STORAGE_TABLE_NAME"];
const partition_key = process.env["AZURE_STORAGE_TABLE_PARTITION_KEY"];

function listDishes(callback) {
  // Lists the records in `table_name`

  const query = new azure.TableQuery().where(
    "PartitionKey eq ?",
    partition_key
  );

  table_service.queryEntities(
    table_name,
    query,
    null,
    (error, result, response) => {
      // Handle error, quit early.
      console.log(result);
      console.log(response);

      if (error) {
        return callback(error);
      }

      const mapped_response = {
        entries: result["entries"].map(entry => {
          return {
            id: entry["RowKey"]["_"],
            dish: entry["dish"]["_"],
            name: entry["name"]["_"]
          };
        })
      };

      callback(null, mapped_response);
    }
  );
}

module.exports = function(context, req) {
  listDishes((err, response) => {
    if (err) {
      context.res = {
        status: 500,
        body: JSON.stringify({ message: err })
      };
      context.done();
    }

    context.res = {
      status: 200,
      body: JSON.stringify(response)
    };
    context.done();
  });
};
