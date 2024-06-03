import { Random } from "../util/Random"

type RhythmUnit = {
	duration: number
	type: "note" | "rest"
}

export type RhythmPattern = RhythmUnit[]

export function durationOfRhythmPattern(pattern: RhythmPattern) {
	return pattern.reduce((sum, unit) => sum + unit.duration, 0)
}

export function numberOfNotesInRhythmPattern(pattern: RhythmPattern) {
	return pattern.filter((unit) => unit.type == "note").length
}

function abstractPatternsForLength(length: number) {
	if (length < 0) throw new Error("Pattern can't have negative length")

	const out: number[][] = []
	if (length == 0) out.push([])

	for (let i = 1; i <= length; i++) {
		const subResults = abstractPatternsForLength(length - i)
		for (const subResult of subResults) {
			subResult.push(i)
			out.push(subResult)
		}
	}
	return out
}

export interface RhythmPatternOptions {
	minimumNumberOfUnits?: number
	onlyStartOnNote: boolean
	minimumNumberOfNotes: number
	maximumRestLength: number
}

export function generateRhythmPatterns(
	length: number,
	{
		minimumNumberOfUnits = 1,
		onlyStartOnNote,
		minimumNumberOfNotes,
		maximumRestLength,
	}: RhythmPatternOptions,
) {
	const abstractPatterns = abstractPatternsForLength(length).filter(
		(pattern) => pattern.length >= minimumNumberOfUnits,
	)
	return abstractPatterns.flatMap((abstractPattern) =>
		allRhythmicCombinations({
			prefix: [],
			abstractPattern,
			onlyStartOnNote,
			minimumNumberOfNotes,
			maximumRestLength,
		}),
	)
}

export function getRandomRhythmPattern(
	length: number,
	options: RhythmPatternOptions,
	random: Random,
) {
	const patterns = generateRhythmPatterns(length, options)
	if (patterns.length == 0) throw new Error("No possible patterns")
	return patterns[random.nextInt(patterns.length)]
}

interface RhytmicCombinationOptions {
	prefix: RhythmPattern
	abstractPattern: number[]
	onlyStartOnNote: boolean
	minimumNumberOfNotes: number
	maximumRestLength: number
}

function allRhythmicCombinations({
	prefix,
	abstractPattern,
	onlyStartOnNote,
	minimumNumberOfNotes,
	maximumRestLength,
}: RhytmicCombinationOptions) {
	if (minimumNumberOfNotes > abstractPattern.length) return []
	if (abstractPattern.length == 0) return [prefix]
	const out: RhythmPattern[] = []
	const unitLength = abstractPattern[0]
	const restOfPattern = abstractPattern.slice(1)

	const prefixPlusNote = [
		...prefix,
		{ duration: unitLength, type: "note" } as RhythmUnit,
	]
	out.push(
		...allRhythmicCombinations({
			prefix: prefixPlusNote,
			abstractPattern: restOfPattern,
			onlyStartOnNote: false,
			minimumNumberOfNotes: minimumNumberOfNotes - 1,
			maximumRestLength,
		}),
	)

	if (!onlyStartOnNote && unitLength <= maximumRestLength) {
		const prefixPlusRest = [
			...prefix,
			{ duration: unitLength, type: "rest" } as RhythmUnit,
		]
		out.push(
			...allRhythmicCombinations({
				prefix: prefixPlusRest,
				abstractPattern: restOfPattern,
				onlyStartOnNote: true,
				minimumNumberOfNotes,
				maximumRestLength,
			}),
		)
	}

	return out
}


// you can choose range of note lengths?

export class Measure {
	constructor (
		public signatureUpper: number,
		public signatureLower: number,
		public notes: RhythmPattern
	) {}
}

export const MeasureTypeInit = (id: number) => {
	return {
		id: id,
		signatureUpper: 4,
		signatureLower:4,
		name: "",
		notes: [{duration:1, type:"note"},
			{duration:1, type:"note"},
			{duration:1, type:"note"},
			{duration:1, type:"note"}] as RhythmPattern
	}
}

export type MeasureIR = ReturnType<typeof MeasureTypeInit>

export function nameOfMeasure (measure: MeasureIR): string {
	return measure.name == "" ? `measure${measure.id}` : measure.name
}

export function generateRhythm (
	length: number
): RhythmPattern {
	// let rhythm = new Array<RhythmUnit>
	// while (rhythm.length < length) {
	// 	let rh = getOneMeasureRhythm(5, 4)
	// 	rhythm.push(...rh)
	// }
	// rhythm.splice(length, (rhythm.length - length))
	// console.log(rhythm)
	let measure = generateMeasure(4, 4, length)
	let rhythm = measure.notes

	return rhythm
}

// i gotta make it so that the time signature counts not only the melody length
// number of notes after rhythm is generato

export function generateMeasure (
	signatureUpper: number,
	signatureLower: number,
	maxNumberOfNotes: number
): Measure {
	// set what notes are allowed
	let notes = [ 1/2, 1/4, 1/8, 3/4, 3/16, 3/8, 3/32]
	// 1,   1/16,
	let time = signatureUpper * signatureUpper / signatureLower
	console.log("length is:" + signatureUpper)
	notes = notes.map(function(x) { return x*signatureUpper })
	// generate all possible combinations
	let combinations = allCombinations(notes, time).filter(x => x.length <= maxNumberOfNotes)
	// pick a random combo
	let randomIndex = Math.floor(Math.random() * combinations.length)
	let durations = combinations[randomIndex]
	// shuffle it
	shuffleArray(durations)

	// overlay with note on / continuuu / rest
	// where its continuuuus add lengths together
	let rhythm = durationToRhythm(durations)
	return {
		signatureUpper : signatureUpper,
		signatureLower : signatureLower,
		notes : rhythm
	}
}

function durationToRhythm (
	notes: number[]
): Array<RhythmUnit> {
	let res = new Array<RhythmUnit>
	for (let i = 0; i < notes.length; i++) {
		let pick = Math.random()
		
		res.push({ duration: notes[i], type: "note" } as RhythmUnit)
		// if (i > 0 && res[i-1].type == "rest")
		// 	res.push({ duration: notes[i], type: "note" } as RhythmUnit)
		// else
		// 	res.push({ duration: notes[i], type: pick <= 0.9 ? "rest" : "note" } as RhythmUnit)
	}
	return res
}

function shuffleArray (array: string[]) { 
	for (let i = array.length - 1; i > 0; i--) {
	  let j = Math.floor(Math.random() * (i + 1))
	  let temp = array[i]
	  array[i] = array[j]
	  array[j] = temp
	}
}

function allCombinations(
	notes: number[],
	sum: number) {
    let combinations = new Array()
    let temp = new Array()
    findCombinations(combinations, notes, sum, 0, temp)
    return combinations
}
 
function findCombinations(
	combinations: Array<Array<number>>,
	notes: number[],
	sum: number,
	index: number,
	temp: Array<number>) {
 
    if (sum == 0) {
        combinations.push([...temp])
        return
    }
 
    for (let i = index; i < notes.length; i++) {
 
        if ((sum - notes[i]) >= 0) { // if note's length can fit
            temp.push(notes[i]) // add current note
            findCombinations(combinations, notes, sum - notes[i], i, temp) // find rest of the combination
            temp.splice(temp.indexOf(notes[i]), 1) // remove note and try next one
        }
    }
}
