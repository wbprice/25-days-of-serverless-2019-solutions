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

      callback(null, result);
    }
  );
}

module.exports = async function(context, req) {
  listDishes((err, response) => {
    if (err) {
      context.res = {
        status: 500,
        body: JSON.stringify({"message": err})
      };
      return;
    }

    context.res = {
      status: 200,
      body: JSON.stringify(response)
    };
  });
};
