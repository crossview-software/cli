class Flag {
	description: string
	flag: string
	shortFlag: string
	handler: Function
	args: string[]
	argsTaken: number

	constructor(
		flag: string,
		shortFlag: string,
		description: string,
		handler: Function
	) {
		this.flag = flag
		this.shortFlag = shortFlag
		this.description = description
		this.handler = handler
		this.args = []
	}

	addArg(arg: string): void {
		this.args.push(arg)
	}
}

export default Flag
