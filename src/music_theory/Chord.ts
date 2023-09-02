import { arrayEquals } from "../util/utils"
import { Chordesque } from "../wfc/hierarchy/prototypes"
import { Note, relativeNote } from "./Note"
import { NoteSet } from "./NoteSet"

export type ConcreteChordQuality = "major" | "minor" | "diminished" | "augmented"
export type ChordQuality = ConcreteChordQuality | null

export class Chord extends NoteSet implements Chordesque{
	protected third: Note
	protected fifth: Note
	protected extensions?: Note[]

	constructor(root: Note, noteValues: number[]){
		super(root, noteValues)
		this.third = relativeNote(root, noteValues[1])
		this.fifth = relativeNote(root, noteValues[2])
		this.extensions = noteValues.slice(3).map((value) => relativeNote(root, value))
	}

	static fromRootAndQuality(root: Note, quality: ChordQuality): Chord {
		switch(quality){
			case "major":
				return new MajorChord(root)
			case "minor":
				return new MinorChord(root)
			case "diminished":
				return new DiminishedChord(root)
			case "augmented":
				return new AugmentedChord(root)
			default:
				throw new Error("Invalid chord quality")
		}
	}

	getChord(){
		return this
	}

	static allBasicChords(): Chord[] {
		const chords: Chord[] = []
		for(const note of Object.values(Note)){
			chords.push(new MajorChord(note))
			chords.push(new MinorChord(note))
		}
		return chords
	}

	equals(other: Chord): boolean {
		return this.root == other.root && arrayEquals(this.noteValues, other.noteValues)
	}

	getThird(){
		return this.third
	}

	getFifth(){
		return this.fifth
	}

	toString(){
		return `${this.root}${this.noteValues.map((value) => `+${value}`).join("")}`
	}

	static parseChordString(chordString: string): Chord {
		if(!(["A", "B", "C", "D", "E", "F", "G"].includes(chordString[0]))) throw new Error("Invalid chord string")

		const endOfRoot = chordString[1] == "#" ? 2 : 1
		const root = chordString.slice(0,endOfRoot) as Note
		const quality = chordString.slice(endOfRoot)

		if(quality == "") return new MajorChord(root)
		if(quality == "m") return new MinorChord(root)
		if(quality == "°") return new DiminishedChord(root)
		if(quality == "+") return new AugmentedChord(root)

		const noteValues = quality.split("+").map((value) => parseInt(value))
		return new Chord(root, noteValues)
	}

	static parseChordsString(chordsString: string): Chord[] {
		if(chordsString == "") return []
		return chordsString.split(" ").map((chordString) => Chord.parseChordString(chordString))
	}

}

export class MajorChord extends Chord{
	constructor(root: Note){
		super(root, [0, 4, 7])
	}
  
	toString(){
		return `${this.root}`
	}
}

export class MinorChord extends Chord{
	constructor(root: Note){
		super(root, [0, 3, 7])
	}

	toString(){
		return `${this.root}m`
	}
}

export class DiminishedChord extends Chord{
	constructor(root: Note){
		super(root, [0, 3, 6])
	}

	toString(){
		return `${this.root}°`
	}
}

export class AugmentedChord extends Chord{
	constructor(root: Note){
		super(root, [0, 4, 8])
	}

	toString(){
		return `${this.root}+`
	}
}