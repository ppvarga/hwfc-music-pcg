import { Grabber } from "../Grabber"

export function constantGrabber<T extends object>(result: T): Grabber<T> {
	return {
		grab: () => result,
		configText: () => {
			if(result instanceof Set){
				return Array.from(result).join(", ")
			}
			return result.toString()
		}
	}
}