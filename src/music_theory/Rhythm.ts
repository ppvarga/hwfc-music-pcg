import { Random } from "../util/Random"

export type RhythmUnit = {
	duration: number
	type: "note" | "rest" | undefined
}

export type RhythmPattern = RhythmUnit[]

export function durationOfRhythmPattern(pattern: RhythmPattern) {
	return pattern.reduce((sum, unit) => sum + unit.duration, 0)
}

export function numberOfNotesInRhythmPattern(pattern: RhythmPattern) {
	return pattern.filter((unit) => unit.type == "note").length
}

export interface RhythmPatternOptions {
	minimumNumberOfUnits?: number
	onlyStartOnNote: boolean
	minimumNumberOfNotes: number
	maximumRestLength: number
	upper: number
	lower: number
	baseRhythm: RhythmPattern
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
		lower = 4,
		baseRhythm
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
	let rhythm = generateRhythmBetter(upper, lower, length, baseRhythm)

	return rhythm
}

function pickStrongBeats (upper: number): number[] {
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
	lower: number,
	melodyLength: number,
	baseRhythm: RhythmPattern
): RhythmPattern {
	let strongBeats = pickStrongBeats(upper).map(x => x / lower)
	// 1 = quarter note
	let notes = [ 2, 1.5, 1, 3/4, 1/2, 1/4]

	let noteLenghts = getRandomNoteLengths(notes, strongBeats, baseRhythm)
	while (noteLenghts.length < melodyLength)
		noteLenghts = getRandomNoteLengths(notes, strongBeats, baseRhythm) // generate new ones if it's not long enough
	//let result = addRests(noteLenghts, noteLenghts.length - melodyLength) // add rests where it's needed

	return noteLenghts
}

function getRandomNoteLengths(possibleNotes: number[], strongBeats: number[], baseRhythm: RhythmPattern) {
    let result = new Array<RhythmUnit>
    let currentSum = 0

	baseRhythm.forEach((unit, index) => {
		if (unit.type == undefined) {
			// fill out
			result = [...result, ...fillGap(currentSum, currentSum + unit.duration, possibleNotes, strongBeats)]
		} else {
			// just copy whatever is already there
			result.push(unit)
		}
		currentSum += unit.duration
	})

    return result;
}

function fillGap(currentSum: number, targetSum: number, possibleNoteLenghts: number[], strongBeats: number[]) {
	let result = []

	while (currentSum < targetSum) {
        let remainingAmount = targetSum - currentSum
        let fittingNoteLengths = possibleNoteLenghts.filter(noteLength => noteLength <= remainingAmount)

        // if no fitting note lengths are available, BACKtRACK???
        if (fittingNoteLengths.length === 0) break

        let position = currentSum

        // note length likelihood weights
        let weights = fittingNoteLengths.map(noteLength => probabilityOfNoteOnBeat(noteLength, position in strongBeats))

        // select a note length based on weight
        let selectedNoteLength = weightedRandomSelect(fittingNoteLengths, weights)[0]

        // add the selected note length to the result
        result.push({type: "note", duration: selectedNoteLength} as RhythmUnit)
        currentSum += selectedNoteLength
    }
	return result
}

function weightedRandomSelect(items: number[], weights: number[]): number[] {
    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (let i = 0; i < items.length; i++) {
        cumulativeWeight += weights[i];
        if (randomValue < cumulativeWeight) {
            return [items[i], i]
        }
    }

    // Fallback in case of rounding errors
    return [items[items.length - 1], items.length - 1]
}

function probabilityOfNoteOnBeat(noteLength: number, onStrongBeat: boolean) {
    if (onStrongBeat)
		if (noteLength >= 1)
			return 20
		else
			return 10
	else
		return 10
}	

function probabilityOfRest(condition: boolean) {
    if (condition)
		return 10
	else
		return 30
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

	let durations = combinations[randomIndex] as number[]
	
	durations = durations.map(function(x) { return x })
	// shuffle it
	shuffleArray(durations)

	let rhythm = durationToRhythm(durations)
	return rhythm
}

function addRests (
	notes: number[],
	numOfRests: number
): RhythmPattern {
	let result = new Array<RhythmUnit>
	let restIndices = []
	let pool = notes.map((_, i) => i)

    while (restIndices.length < numOfRests) {
        let pick = Math.floor(Math.random() * pool.length)
		
		restIndices.push(pick)
		pool.splice(pool.indexOf(pick), 1)
    }
	
	for (let i = 0; i < notes.length; i++) {
		if (i in restIndices)
			result.push({ duration: notes[i], type: "rest" } as RhythmUnit)
		else
			result.push({ duration: notes[i], type: "note" } as RhythmUnit)
	}
	return result
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
