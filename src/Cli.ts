import Flag from "./Flag"
import { EOL } from "os"

class Cli {
	name: string
	description: string
	flags: Flag[]
	commands: Record<string, Cli>
	options: Flag[]
	handler: Function
	shouldReturnHandler: boolean
	shouldExecuteHandlers: boolean

	/**
	 * @param {string} name - the name of the CLI object
	 * @param {string} description - the description of the CLI program
	 * @param {boolean} shouldReturnHandler - whether the CLI should return the return value of the handler or only call the hanlder
	 * @param {boolean} shouldExecuteHandlers - whether the CLI should execute registered handlers during processing
	 */
	constructor(
		name: string,
		description: string,
		shouldReturnHandler = false,
		shouldExecuteHandlers: boolean = true
	) {
		if (!name) {
			throw new TypeError("Argument 'name' must be a valid string")
		}
		this.name = name
		this.description = description
		this.flags = [
			new Flag(
				"help",
				"h",
				"Prints helpful information about this command",
				null
			)
		]
		this.commands = {}
		this.options = []
		this.shouldReturnHandler = shouldReturnHandler
		this.shouldExecuteHandlers = shouldExecuteHandlers
	}

	/**
	 * Processes the CLI arguments
	 */
	processArgs(args: string[] = null, shouldReturnHandler = false): Cli | any {
		if (!args) {
			args = process.argv.slice(2)
		}

		if (shouldReturnHandler) {
			this.shouldReturnHandler = shouldReturnHandler
		}

		let command: Cli = this.findCommand(args[0])
		if (command) {
			return command.processArgs(args.slice(1), this.shouldReturnHandler)
		}

		for (let i: number = 0; i < args.length; i++) {
			const action: Flag = this.findFlag(args[i])
			if (!action) {
				throw new Error(`Invalid flag: ${args[i]}`)
			}

			while (args[i + 1] && args[i + 1][0] !== "-") {
				action.addArg(args[++i])
			}

			this.options.unshift(action)
		}

		if (this.shouldExecuteHandlers) {
			if (this.handler) {
				if (this.shouldReturnHandler) return this.handler(this.options)
				this.handler(this.options)
			} else {
				this.options.forEach(actionSet => {
					actionSet.callHandler()
				})
			}
		} else if (this.options.find(f => f.flag === "help")) {
			if (this.shouldReturnHandler) return this.help()
			console.log(this.help())
		}
		return this
	}

	/**
	 * Registers a sub-command on the CLI
	 */
	registerCommand(command: Cli): Cli {
		if (!command) {
			throw new TypeError("Argument 'command' must be a Cli object")
		}
		if (this.commands.hasOwnProperty(command.name)) {
			throw new Error(`Command ${command.name} has already been defined`)
		}

		this.commands[command.name] = command
		return this
	}

	/**
	 * Registers a Flag on the CLI
	 */
	registerFlag(
		flag: string,
		shortFlag: string,
		description: string,
		handler: Function
	) {
		this.flags.push(new Flag(flag, shortFlag, description, handler))
		return this
	}

	registerHandler(handler: Function) {
		this.handler = handler
		return this
	}

	/**
	 * Determines whether a string represents a valid command and returns the command if it does
	 *
	 * @returns {Cli}
	 */
	findCommand(cmd: string): Cli {
		return this.commands[cmd]
	}

	/**
	 * Tests whether a command line argument is a flag on this command
	 */
	findFlag(arg: string): Flag {
		if (arg.substring(0, 2) !== "--") {
			return this.findShortFlag(arg)
		}

		if (arg.length < 3) {
			return null
		}

		return this.flags.find(flag => flag.flag === arg.substring(2))
	}

	/**
	 * Tests whether a command line argument is a shorthand flag on this command
	 */
	findShortFlag(arg: string): Flag {
		if (arg.substring(0, 1) !== "-") {
			return undefined
		}

		if (arg.length !== 2) {
			return undefined
		}

		return this.flags.find(flag => flag.shortFlag === arg[1])
	}

	help(): string {
		let output: string[] = []
		let longestOutputLength: number = 0

		output.push(this.name)
		output.push(this.description)
		output.push("")
		output.push("Options")

		this.flags.forEach(f => {
			const length = `-${f.shortFlag} --${f.flag}`.length + 5
			if (length > longestOutputLength) longestOutputLength = length
		})

		this.flags.forEach(f => {
			let line = `-${f.shortFlag} --${f.flag}`
			while (line.length < longestOutputLength) line += " "
			line += f.description
			output.push(line)
		})

		if (Object.keys(this.commands).length > 0) {
			Object.keys(this.commands).forEach(command => {
				output.push("")
				output.push(`Subcommand on ${this.name}`)
				output.push(this.commands[command].help())
			})
		}

		return output.reduce((acc, val) => acc + EOL + val) + EOL
	}
}

export default Cli
