/* global describe, it */

(function () {
    'use strict';

    describe('Give it some context', function () {
        describe('maybe a bit more context here', function () {
            it('should run here few assertions', function () {
                var q = 1;
                q.should.equal(1);
            });
        });
    });
})();
