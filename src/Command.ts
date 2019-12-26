import Flag from "./Flag"

class Command {
	name: string
	description: string
	flags: Flag[]
	handler: Function
	/**
	 *
	 * @param {string} name - the name of the command
	 * @param {string} description - a short description of the command
	 * @param {import("./Flag").Flag[]} flags - an array of Flags to modify the command behavior
	 * @param {Function} handler - the function to execute when the command is invoked
	 */
	constructor(
		name: string,
		description: string,
		flags: Flag[],
		handler: Function
	) {
		this.handler = handler
		this.flags = flags || []
		this.name = name
		this.description = description
	}

	/**
	 * Execute the handler associated with this command
	 */
	execute(flags: Flag[]) {
		this.handler(flags)
	}
}

export default Command
