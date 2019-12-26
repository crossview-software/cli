import Flag from "./Flag"

/**
 * Tests whether a command line argument is a flag on this command
 */
export function findFlag(arg: string, flags: Flag[]): Flag {
	if (arg.substring(0, 2) !== "--") {
		return findShortFlag(arg, flags)
	}

	if (arg.length < 3) {
		return null
	}

	return flags.find(flag => flag.flag === arg.substring(2))
}

/**
 * Tests whether a command line argument is a shorthand flag on this command
 */
export function findShortFlag(arg: string, flags: Flag[]): Flag {
	if (arg.substring(0, 1) !== "-") {
		return undefined
	}

	if (arg.length !== 2) {
		return undefined
	}

	return flags.find(flag => flag.shortFlag === arg[1])
}
