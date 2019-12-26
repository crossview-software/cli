class Flag {
	name: string
	description: string
	flag: string
	shortFlag: string
	handler: Function
	args: string[]
	argsTaken: number

	constructor(
		name: string,
		description: string,
		flag: string,
		shortFlag: string,
		handler: Function,
		argsTaken: number = 0
	) {
		this.name = name
		this.description = description
		this.flag = flag
		this.shortFlag = shortFlag
		this.handler = handler
		this.argsTaken = argsTaken
		this.args = []
	}
}

export default Flag
