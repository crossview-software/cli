const { describe, it } = require("mocha")
const { assert } = require("chai")
const { Cli, Flag } = require("../lib/index")

describe("@crossview/cli module", function() {
	it("should expose the correct objects", function() {
		assert.exists(Cli, "Cli object is exported")
		assert.exists(Flag, "Flag object is exported")
	})
})
