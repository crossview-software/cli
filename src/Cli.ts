import Flag from "./Flag"
import { findFlag } from "./utils"

class Cli {
	name: string
	flags: Flag[]
	commands: Record<string, Cli>
	options: Flag[]
	handler: Function
	shouldExecuteHandlers: boolean

	/**
	 * @param {string} name - the name of the CLI object
	 * @param {boolean} shouldExecuteHandlers - whether the CLI should execute registered handlers during processing
	 */
	constructor(name: string, shouldExecuteHandlers: boolean = true) {
		if (!name) {
			throw new TypeError("Argument 'name' must be a valid string")
		}
		this.name = name
		this.flags = []
		this.commands = {}
		this.options = []
		this.shouldExecuteHandlers = shouldExecuteHandlers
	}

	/**
	 * Processes the CLI arguments
	 */
	processArgs(args: string[]): Cli {
		if (!args) {
			args = process.argv.slice(2)
		}

		let command: Cli = this.findCommand(args[0])
		if (command) {
			return command.processArgs(args.slice(1))
		}

		for (let i: number = 0; i < args.length; i++) {
			const action: Flag = findFlag(args[i], this.flags)
			if (!action) {
				throw new Error(`Invalid flag: ${args[i]}`)
			}

			while (args[i + 1] && args[i + 1][0] !== "-") {
				action.args.push(args[++i])
			}

			this.options.push(action)
		}

		if (this.shouldExecuteHandlers) {
			if (this.handler) {
				this.handler(this.options)
			} else {
				this.options.forEach(actionSet => {
					if (actionSet.handler) {
						actionSet.handler()
					}
				})
			}
		} else if (this.options.findIndex(f => f.flag === "help") > -1) {
			this.help()
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

	/**
	 * Determines whether a string represents a valid command and returns the command if it does
	 *
	 * @returns {Command}
	 */
	findCommand(cmd: string): Cli {
		return this.commands[cmd]
	}

	help(): void {}
}

export default Cli
