/**
 * Handles asynchrone requests based on generators
 * @param  {Generator} generator Generator with the urls to request
 */
function async(generator) {
        "use strict";
        const iterator = generator();

        function handle(iteratorResult) {
                if (iteratorResult.done) {
                        return;
                }

                let iteratorValue = iteratorResult.value;
                if (iteratorValue instanceof Promise) {
                        iteratorValue.then(res => handle(iterator.next(res)))
                                .catch(error => {
                                        throw (error)
                                })
                };
        }

        try {
                handle(iterator.next());
        } catch (error) {
                iterator.throw(error);
        }
}

module.exports = {
        async: async
}
