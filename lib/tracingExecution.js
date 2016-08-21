// These modules are intended to trace the execution of the server.

// Is intended to be used to trace the request of an endpoint.
function logStart(URL) {
    console.log("++++++++++++++ START -> " + URL + " +++++++++++++++++");
}

// Is intended to be used to indicate if the execution of an endpoint ends.
function logEnd(URL) {
    console.log("++++++++++++++++ END -> " + URL + " +++++++++++++++++");
}

module.exports = {
    logStart: logStart,
    logEnd: logEnd
}
