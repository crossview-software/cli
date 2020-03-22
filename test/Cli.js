const {describe, it} = require("mocha")
const {expect} = require("chai")
const {Cli, Flag} = require("../lib/index")

describe("Cli.constructor", function() {

    it("should have the correct properties set", function () {

        const cli = getNewTestCli()
        expect(cli).to.have.property("name", "testCli")
        expect(cli).to.have.property("description", "Testing the CLI")
        expect(cli.flags).to.be.an("array").that.has.lengthOf(1)
        expect(cli.options).to.be.an("array").that.has.lengthOf(0)
        expect(cli.commands).to.be.an("object").to.be.deep.equal({})
        expect(cli.shouldReturnHandler).to.be.false
        expect(cli.shouldExecuteHandlers).to.be.true

        const cli2 = new Cli("testCli2", "test2", true, false)
        expect(cli2.shouldExecuteHandlers).to.be.false
        expect(cli2.shouldReturnHandler).to.be.true

    })

    it("should throw a TypeError if no Cli name is provided", function () {

        expect(() => new Cli()).to.throw(TypeError, "Argument 'name' must be a valid string")

    })

})

describe("Cli.processArgs", function() {

    it("should process arguments and call the correct handlers and flags", function () {

        const veryRatherGoodDayArgs = ["good", "-v", "-r"]
        const ratherGoodDayArgs = ["good", "-r"]
        const trulyQuiteBadDayArgs = ["bad", "-t", "-q"]
        const quiteBadDayArgs = ["bad", "-q"]
        const quiteTrulyAwfulBadDayArgs = ["bad", "-q", "truly", "awful"]

        expect(getNewProcessableCli(true).processArgs(veryRatherGoodDayArgs)).to.equal("have a very rather good day")
        expect(getNewProcessableCli(true).processArgs(ratherGoodDayArgs)).to.equal("have a rather good day")
        expect(getNewProcessableCli(true).processArgs(trulyQuiteBadDayArgs)).to.equal("have a truly quite bad day")
        expect(getNewProcessableCli(true).processArgs(quiteBadDayArgs)).to.equal("have a quite bad day")
        expect(getNewProcessableCli(true).processArgs(quiteTrulyAwfulBadDayArgs)).to.equal("have a quite truly awful bad day")

    })

    it("should set args equal to the third process.argv onward if args is null", function() {

        // For this test, we set up a new Cli object with shouldReturnHandler = true so that the handler result will be returned after processing. Then, we will register flags equal to each of the process.argv.slice(2) members so that when processArgs is called, an error is not thrown
        const cli = getNewTestCli(true)
            .registerHandler()
        const actualArgs = process.argv.slice(2)

        actualArgs.forEach(arg => {
            cli.registerFlag(arg, arg[0], "Some arg", null)
        })

        let result

        // If arg === null, it will throw an error
        expect(() => result = cli.processArgs()).to.not.throw(Error)

        actualArgs.forEach(o => {
            expect(result.options.find(f => f.flag === o)).to.exist
        })

    })

    it("should throw an error if an invalid flag is passed to processArgs", function() {

        const testArgs = ["bad", "-x"]
        expect(() => getNewProcessableCli(true).processArgs(testArgs)).to.throw(Error, "Invalid flag: -x")

    })

    it("should call the handler and return the Cli object if shouldExecuteHandlers is true but shouldReturnHandler is false", function() {

        const output = {
            handlerIsCalled: false
        }
        const cli = getNewTestCli()
            .registerHandler(opts => {output.handlerIsCalled = true})

        expect(output.handlerIsCalled).to.be.false

        const result = cli.processArgs([])

        expect(output.handlerIsCalled).to.be.true
        expect(cli).to.be.an.instanceOf(Cli)

    })

    it("should just return the Cli object if shouldExecuteHandlers is false and the help flag is not set", function() {

        const output = {
            handlerIsCalled: false
        }
        const cli = getNewTestCli(false, false)
            .registerHandler(opts => { output.handlerIsCalled = true })

        expect(output.handlerIsCalled).to.be.false

        const result = cli.processArgs([])

        expect(output.handlerIsCalled).to.be.false
        expect(cli).to.be.an.instanceOf(Cli)

    })

    it("should call the handler for each selected option if no command handler is set", function() {

        const output = {
            option1HandlerIsCalled: false,
            option2HandlerIsCalled: false,
            option3HandlerIsCalled: false
        }

        const cli = getNewTestCli()
            .registerFlag("scrantonicity", "s", "The best Police cover band in Scranton", () => output.option1HandlerIsCalled = true)
            .registerFlag("jokersandtokers", "j", "The best Steve Miller cover band in Scranton", () => output.option2HandlerIsCalled = true)
            .registerFlag("dundermifflinwarehouseband", "d", "This band didn't let Kevin play", () => true)

        expect(output.option1HandlerIsCalled).to.be.false
        expect(output.option2HandlerIsCalled).to.be.false
        expect(output.option3HandlerIsCalled).to.be.false

        const result = cli.processArgs(["-s", "-j"])

        expect(result).to.be.an.instanceOf(Cli)

        expect(output.option1HandlerIsCalled).to.be.true
        expect(output.option2HandlerIsCalled).to.be.true
        expect(output.option3HandlerIsCalled).to.be.false

    })

})

describe("Cli.registerCommand", function() {

    it("should create a nested Cli object when calling registerCommand", function () {

        const cli = new Cli("external")
        const cli2 = new Cli("internal")

        cli.registerCommand(cli2)

        expect(cli.commands).to.have.property("internal", cli2)

    })

    it("should throw an error when registerCommand is called with falsy arguments", function () {

        const cli = getNewTestCli()
        const msg = "Argument 'command' must be a Cli object"
        expect(() => cli.registerCommand()).to.throw(TypeError, msg)
        expect(() => cli.registerCommand(null)).to.throw(TypeError, msg)
        expect(() => cli.registerCommand(false)).to.throw(TypeError, msg)
        expect(() => cli.registerCommand("")).to.throw(TypeError, msg)
        expect(() => cli.registerCommand(0)).to.throw(TypeError, msg)

    })

    it("should throw an error when registerCommand is called with two commands with the same Cli.name", function () {

        const cli = getNewTestCli()
            .registerCommand(getNewTestCli())

        expect(() => cli.registerCommand(getNewTestCli())).to.throw(Error, "Command testCli has already been defined")

    })

})

describe("Cli.registerFlag", function() {

    it("should register a flag on the Cli object when registerFlag is called", function () {

        const cli = getNewTestCli()
            .registerFlag("boss", "b", "Test Flag", () => console.log("Welcome to Scranton"))
            .registerFlag("jim", "j", "Farewell Flag", () => console.log("Goodbye Scranton"))

        expect(cli.flags).to.have.lengthOf(3)

    })

})

describe("Cli.registerHandler", function() {

    it("should register a function handler when registerHandler is called", function () {

        const cli = getNewTestCli()
            .registerHandler(() => 42)

        expect(cli.handler).to.be.a("function")
        expect(cli.handler()).to.equal(42)

    })

})

describe("Cli.findCommand", function() {

    it("should return a Cli from Cli.commands when findCommand is called", function () {
        const cli = getNewTestCli()
            .registerCommand(new Cli("testing2"))

        expect(cli.findCommand("testing2")).to.be.an("object").that.has.property("name", "testing2")

    })

})

describe("Cli.findFlag", function() {

    it("should return the correct flag when findFlag is called", function () {

        const cli = getNewTestCli()
            .registerFlag("test1", "1", "Test Flag 1", null)
            .registerFlag("test2", "2", "Test Flag 2", null)

        expect(cli.findFlag("--test1")).to.be.an("object").that.has.property("flag", "test1")
        expect(cli.findFlag("--test2")).to.be.an("object").that.has.property("flag", "test2")

    })

    it("should return null if the findFlag arg length is less than 3, but is also not a short flag", function () {

        const cli = getNewTestCli()
            .registerFlag("test1", "1", "Test Flag 1", null)

        expect(cli.findFlag("--")).to.be.null

    })

    it("should call findShortFlag if a short flag is supplied to findFlag", function () {

        const cli = getNewTestCli()
            .registerFlag("test1", "1", "Test Flag 1", null)
            .registerFlag("test2", "2", "Test Flag 2", null)

        expect(cli.findFlag("-1")).to.be.an("object").that.has.property("flag", "test1")
        expect(cli.findFlag("-2")).to.be.an("object").that.has.property("flag", "test2")

    })

})

describe("Cli.findShortFlag", function() {

    it("should return the correct flag when findShortFlag is called", function () {

        const cli = getNewTestCli()
            .registerFlag("test1", "1", "Test Flag 1", null)
            .registerFlag("test2", "2", "Test Flag 2", null)

        expect(cli.findShortFlag("-1")).to.be.an("object").that.has.property("flag", "test1")
        expect(cli.findShortFlag("-2")).to.be.an("object").that.has.property("flag", "test2")

    })

    it("should return undefined when findShortFlag is called with an argument that is not a short flag", function () {

        const cli = getNewTestCli()
            .registerFlag("test1", "1", "Test Flag 1", null)

        expect(cli.findShortFlag("ab")).to.be.undefined

    })

    it("should return undefined when findShortFlag is called with an argument that is not exactly two characters long", function () {

        const cli = getNewTestCli()
            .registerFlag("test1", "1", "Test Flag 1", null)

        expect(cli.findShortFlag("-")).to.be.undefined
        expect(cli.findShortFlag("--t")).to.be.undefined

    })

})

describe("Cli.help", function() {

    it("should print help data for each flag on the Cli object", function() {

        const cli = getGoodDayWisher(true, false).processArgs(["-h"])

        expect(cli).to.have.string("good")
        expect(cli).to.have.string("Wishes you a good day")
        expect(cli).to.have.string("Options")

        expect(cli).to.have.string("-v")
        expect(cli).to.have.string("--very")
        expect(cli).to.have.string("Wishes you a very good day")

        expect(cli).to.have.string("-r")
        expect(cli).to.have.string("--rather")
        expect(cli).to.have.string("Wishes you a rather good day")

        const cli2 = getGoodDayWisher(false, false).processArgs(["-h"])

        expect(cli2).to.be.instanceOf(Cli)

    })

    it("should print help data for each nested command on the Cli object", function() {

        const cli = getNewProcessableCli(true, false).processArgs(["-h"])

        expect(cli).to.have.string("good")
        expect(cli).to.have.string("Wishes you a good day")
        expect(cli).to.have.string("Options")

        expect(cli).to.have.string("-v")
        expect(cli).to.have.string("--very")
        expect(cli).to.have.string("Wishes you a very good day")

        expect(cli).to.have.string("-r")
        expect(cli).to.have.string("--rather")
        expect(cli).to.have.string("Wishes you a rather good day")

        expect(cli).to.have.string("bad")
        expect(cli).to.have.string("Wishes you a bad day")

        expect(cli).to.have.string("-t")
        expect(cli).to.have.string("--truly")
        expect(cli).to.have.string("Wishes you a truly bad day")

        expect(cli).to.have.string("-q")
        expect(cli).to.have.string("--quite")
        expect(cli).to.have.string("Wishes you a quite bad day")

        expect(cli).to.have.string("Subcommand on testCli")

    })

})

/**
 * Gets a new empty testable Cli object
 *
 * @returns {Cli}
 */
function getNewTestCli(shouldReturnHandler = false, shouldExecuteHandlers = true) {
    return new Cli("testCli", "Testing the CLI", shouldReturnHandler, shouldExecuteHandlers)
}

/**
 * @returns {Cli}
 */
function getGoodDayWisher(shouldReturnHandler = false, shouldExecuteHandlers = true) {
    return new Cli("good", "Wishes you a good day", shouldReturnHandler, shouldExecuteHandlers)
        .registerFlag("very", "v", "Wishes you a very good day", msg => `very ${msg}`)
        .registerFlag("rather", "r", "Wishes you a rather good day", msg => `rather ${msg}`)
        .registerHandler(options => {
            let output = "good day"
            options.forEach(o => {
                output = o.handler(output)
            })
            return "have a " + output
        })
}

/**
 * @returns {Cli}
 */
function getBadDayWisher(shouldReturnHandler = false, shouldExecuteHandlers = true) {
    return new Cli("bad", "Wishes you a bad day", shouldReturnHandler, shouldExecuteHandlers)
        .registerFlag("quite", "q", "Wishes you a quite bad day", function(msg) {
            let prepended = ""
            this.args.forEach(arg => prepended += arg + " ")

            return prepended ? `quite ${prepended}${msg}` : `quite ${msg}`
        })
        .registerFlag("truly", "t", "Wishes you a truly bad day", msg => `truly ${msg}`)
        .registerHandler(options => {
            let output = "bad day"
            options.forEach(o => {
                output = o.handler(output)
            })
            return "have a " + output
        })
}

/**
 * Gets a Cli with multiple commands and flags registered
 *
 * @returns {Cli}
 */
function getNewProcessableCli(shouldReturnHandler = false, shouldExecuteHandlers = true) {
    return getNewTestCli(shouldReturnHandler, shouldExecuteHandlers)
        .registerCommand(getGoodDayWisher())
        .registerCommand(getBadDayWisher())
}