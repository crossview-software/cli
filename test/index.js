const { describe, it } = require("mocha")
const { assert } = require("chai")

describe("Initial test", function() {
	it("should pass", function() {
		assert.equal(1, 1, "That's really weird...")
	})
})
