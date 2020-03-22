const { describe, it } = require("mocha")
const { assert, expect } = require("chai")
const { Flag } = require("../lib/index")

describe("@crossview/cli Flag class", function() {
	it("should have the correct properties set", function() {
		const flag = new Flag("hello", "h", "Just a test", () => 42)

		expect(flag.flag).to.have.string("hello")
		expect(flag.shortFlag).to.have.string("h")
		expect(flag.description).to.have.string("Just a test")
		expect(flag.callHandler()).to.equal(42)
		expect(flag.args)
			.to.be.an("array")
			.that.has.lengthOf(0)
	})

	it("should throw a TypeError if the flag name is not specified", function() {
		expect(() => new Flag()).to.throw(
			TypeError,
			"Argument 'flag' must be a valid string"
		)
	})

	it("should add the correct short flag if not defined", function() {
		const flag = new Flag("hello")
		assert.equal(flag.shortFlag, "h", "shortname is incorrect")
	})

	it("should include a default empty description if the description is undefined", function() {
		const flag = new Flag("hello")
		expect(flag.description).to.have.string("")
	})

	it("should add strings to the args array when addArg is called", function() {
		const flag = new Flag("hello")
		flag.addArg("People")
		flag.addArg("say")
		flag.addArg("that")
		flag.addArg("I'm")
		flag.addArg("the")
		flag.addArg("best")
		flag.addArg("boss")

		expect(flag.args)
			.to.include("People")
			.to.include("say")
			.to.include("that")
			.to.include("I'm")
			.to.include("the")
			.to.include("best")
			.to.include("boss")
	})

	it("should only call the supplied handler if it exists", function() {
		const flag = new Flag("hello", "h", "Something here", null)

		expect(flag.callHandler()).to.not.exist
	})
})
