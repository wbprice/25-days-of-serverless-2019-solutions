
function validateInput(payload, callback) {
    // Accepts a payload and callback function.
    // Payload must include dish and name keys.
    // If an error occurred, the callback is invoked with 
    // an error message as the first argument
    // If the payload is OK, the callback is invoked with
    // no error message and a sanitized payload.

    const dish = payload["dish"];
    const name = payload["name"]

    if (!name) {
        callback("'name' is a required field'");
    } else if (!dish) {
        callback("'dish' is a required field'");
    } else if (typeof dish != String) {
        callback("'dish should be a string'");
    } else if (typeof name != String) {
        callback("'dish should be a string'");
    } else {
        callback(null, {
            dish,
            name
        });
    }
}

function createDish(payload, callback) {
    // Noop
    return callback(null, payload);
}

module.exports = async function (context, req) {

    validateInput(req.body, (err, payload) => {

        if (err) {
            // Handle errors, exit early.
            context.res = {
                status: 400,
                body: JSON.stringify({ "message": err })
            };
            return;
        }


    });

    try {
        // Check that payload is good. If so, persist it to storage.
        const payload = validateInput(req.body);
        context.res = {
            status: 200,
            body: JSON.stringify(payload)
        };

    } catch (e) {
    }
};