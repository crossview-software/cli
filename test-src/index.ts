import { describe, it } from "mocha"
import { assert } from "chai"
import { Cli, Command, Flag } from "../src/index"

describe("@crossview/cli module", function() {
	it("should expose the correct objects", function() {
		assert.exists(Cli, "Cli object is exported")
		assert.exists(Command, "Command object is exported")
		assert.exists(Flag, "Flag object is exported")
	})
})
