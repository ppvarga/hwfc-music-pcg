import { Random } from "../util/Random"

export type RhythmUnit = {
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
	upper: number
	lower: number
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
	{
		minimumNumberOfUnits = 1,
		onlyStartOnNote,
		minimumNumberOfNotes,
		maximumRestLength,
		upper = 4,
		lower = 4
	}: RhythmPatternOptions,
	length: number
): RhythmPattern {
	// let rhythm = new Array<RhythmUnit>
	// while (rhythm.length < length) {
	// 	let rh = getOneMeasureRhythm(5, 4)
	// 	rhythm.push(...rh)
	// }
	// rhythm.splice(length, (rhythm.length - length))
	// console.log(rhythm)
	//let rhythm = generateRhythmPattern(upper, lower, length)
	let rhythm = generateRhythmBetter(upper, lower)

	return rhythm
}

function pickStrong (upper: number): number[] {
	const mapping: { [key: number]: number[][] } = {
		1: [[0]],
		2: [[0]],
		3: [[0]],
		4: [[0, 2]],
		5: [[0, 2], [0, 3]],
		6: [[0, 3]],
		7: [[0, 2, 4], [0, 3, 5], [0, 2, 5]],
		8: [[0, 4]],
		9: [[0, 3, 6]],
		10: [[0, 5], [0, 3, 5, 8], [0, 2, 5, 7]],
		11: [[0, 5], [0, 6]],
		12: [[0, 3, 6, 9]],
	  };
	
	  const arr = mapping[upper] || [];
	  return arr[Math.floor(Math.random() * arr.length)] || [];
}

function generateRhythmBetter (
	upper: number,
	lower: number
) {
	let strongBeats = pickStrong(upper).map(x => x / lower)
	let notes = [ 2, 1, 1/2, 1/4]
	return durationToRhythm(getRandomNoteLengths(notes, 4*upper/lower, strongBeats))
}

function getRandomNoteLengths(noteLengths: number[], targetSum: number, strongBeats: number[]) {
    let result = [];
    let currentSum = 0

    while (currentSum < targetSum) {
        let remainingAmount = targetSum - currentSum
        let fittingNoteLengths = noteLengths.filter(noteLength => noteLength <= remainingAmount)

        // If no fitting note lengths are available, BACKtRACK
        if (fittingNoteLengths.length === 0) break

        let position = currentSum

        // probabilities of note lengths
        let probabilities = fittingNoteLengths.map(noteLength => probabilityFunction(noteLength, position in strongBeats))

        // select a note length based on weighted probability
        let selectedNoteLength = weightedRandomSelect(fittingNoteLengths, probabilities)

        // Add the selected note length to the result
        result.push(selectedNoteLength)
        // Update the current sum
        currentSum += selectedNoteLength
    }

    return result;
}

function weightedRandomSelect(items: number[], weights: number[]) {
    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (let i = 0; i < items.length; i++) {
        cumulativeWeight += weights[i];
        if (randomValue < cumulativeWeight) {
            return items[i];
        }
    }

    // Fallback in case of rounding errors
    return items[items.length - 1];
}

function probabilityFunction(noteLength: number, onStrongBeat: boolean) {
    if (onStrongBeat)
		if (noteLength >= 1)
			return 20
		else
			return 10
	else
		return 10
}	


export function generateRhythmPattern (
	upper: number,
	lower: number,
	maxNumberOfNotes: number
): RhythmPattern {
	// set what notes are allowed
	// 1 = quarter note
	let notes = [ 2, 1, 1/2, 1/4]
	// 3/2, 
	let time = 4 * upper / lower
	
	// notes = notes.map(function(x) { return x*signatureUpper })
	// generate all possible combinations
	let combinations = allCombinations(notes, time).filter(x => x.length <= maxNumberOfNotes)
	// pick a random combo
	let randomIndex = Math.floor(Math.random() * combinations.length)
	console.log("durs " + combinations)
	let durations = combinations[randomIndex] as number[]
	
	durations = durations.map(function(x) { return x })
	// shuffle it
	shuffleArray(durations)

	let rhythm = durationToRhythm(durations)
	return rhythm
}

function durationToRhythm (
	notes: number[]
): RhythmPattern {
	let res = new Array<RhythmUnit>
	for (let i = 0; i < notes.length; i++) {
		let pick = Math.random()
		let noteLength = notes[i]
		res.push({ duration: notes[i], type: "note" } as RhythmUnit)
		// if (noteLength === 1.5 || noteLength === 0.75 || (i > 0 && res[i-1].type == "rest")){
		// 	res.push({ duration: notes[i], type: "note" } as RhythmUnit)
		// }
		// else{
		// 	console.log("rest")
		// 	res.push({ duration: notes[i], type: pick <= 0.7 ? "note" : "rest" } as RhythmUnit)
		// }
	}
	return res
}

function shuffleArray (array: number[]) { 
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
	console.log("notes: " + notes)
	console.log("sum: " + sum)
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
