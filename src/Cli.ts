import Flag from "./Flag"
import Command from "./Command"
import { findFlag } from "./utils"

class Cli {
	flags: Flag[]
	commands: Command[]
	hasDefault: boolean
	options: Flag[]
	/**
	 * @param {boolean} hasDefault whether the generated CLI should have a default command
	 */
	constructor(hasDefault: boolean) {
		this.flags = []
		this.commands = []
		this.hasDefault = hasDefault || false
		this.options = []
	}

	/**
	 * Processes the CLI arguments
	 *
	 * @param {string[]} args - the CLI arguments
	 */
	processArgs(args: string[]) {
		let command: Command = this.findCommand(args[0])
		const index: number = command ? 1 : 0

		for (let i: number = index; i < args.length; i++) {
			const action: Flag = findFlag(args[i], this.flags)
			if (!action) {
				throw new Error(`Invalid flag: ${args[i]}`)
			}

			if (action.argsTaken > -1) {
				for (let j: number = 0; j < action.argsTaken; j++) {
					action.args.push(args[++i])
				}
			} else {
				while (args[i + 1][0] !== "-") {
					action.args.push(args[++i])
				}
			}

			this.options.push(action)
		}

		if (command) {
			command.execute(this.options)
		} else {
			this.options.forEach(actionSet => {
				actionSet.handler()
			})
		}
	}

	/**
	 * Registers a Command on the CLI
	 *
	 * Commands are registered in an array. The first command in the array is treated as the default if the hasDefault option is true. When registering a command, setting the isDefault argument to true will register this Command in the front of the array instead of the end. For this reason, registering several Commands as default will result in the last Command registered being used as default.
	 */
	registerCommand(command: Command, isDefault: boolean = false) {
		if (isDefault) {
			this.commands.unshift(command)
			this.hasDefault = true
		} else {
			this.commands.push(command)
		}
	}

	/**
	 * Registers a Flag on the CLI
	 */
	registerFlag(flag: Flag) {
		this.flags.push(flag)
	}

	/**
	 * Determines whether a string represents a valid command and returns the command if it does
	 *
	 * @returns {Command}
	 */
	findCommand(cmd: string) {
		return this.commands.find(c => c.name === cmd)
	}
}

export default Cli
