type RhythmUnit = {
  duration: number,
  type: "note" | "rest"
}

export type RhythmPattern = RhythmUnit[];

export function durationOfRhythmPattern(pattern: RhythmPattern){
	return pattern.reduce((sum, unit) => sum + unit.duration, 0)
}

function abstractPatternsForLength(length: number){
	if(length < 0) throw new Error("Pattern can't have negative length")

	const out: number[][] = []
	if(length == 0) out.push([])
  
	for(let i = 1; i <= length; i++){
		const subResults = abstractPatternsForLength(length - i)
		for(const subResult of subResults){
			subResult.push(i)
			out.push(subResult)
		}
	}
	return out
}

export function rhythmPatternsForLength(length: number, minimumNumberOfUnits: number = 1, onlyStartOnNote: boolean = false){
	const abstractPatterns = abstractPatternsForLength(length).filter(pattern => pattern.length >= minimumNumberOfUnits)
	const out: RhythmPattern[] = []
	for(const abstractPattern of abstractPatterns){
		out.push(...allRhythmicCombinations([], abstractPattern))
	}
	return out.filter(pattern => !onlyStartOnNote || pattern[0].type == "note")
}

function allRhythmicCombinations(prefix: RhythmPattern = [], abstractPattern: number[]){
	if(abstractPattern.length == 0) return [prefix]
	const out: RhythmPattern[] = []
	const unitLength = abstractPattern[0]
	const restOfPattern = abstractPattern.slice(1)

	const prefixPlusNote = [...prefix, {duration: unitLength, type: "note"} as RhythmUnit]
	out.push(...allRhythmicCombinations(prefixPlusNote, restOfPattern))

	if(prefix.length == 0 || prefix[prefix.length - 1].type == "note"){
		const prefixPlusRest = [...prefix, {duration: unitLength, type: "rest"} as RhythmUnit]
		out.push(...allRhythmicCombinations(prefixPlusRest, restOfPattern))
	}

	return out
}
