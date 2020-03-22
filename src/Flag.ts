class Flag {
	description: string
	flag: string
	shortFlag: string
	handler: Function
	args: string[]
	output: any

	constructor(
		flag: string,
		shortFlag: string,
		description: string,
		handler: Function
	) {
		if (!flag) {
			throw new TypeError("Argument 'flag' must be a valid string")
		}
		this.flag = flag
		this.shortFlag = shortFlag || flag[0]
		this.description = description || ""
		this.handler = handler
		this.args = []
	}

	addArg(arg: string): void {
		this.args.push(arg)
	}

	callHandler(): any {
		if (this.handler) return (this.output = this.handler())
	}
}

export default Flag
