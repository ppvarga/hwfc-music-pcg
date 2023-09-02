import { zip } from "../util/utils"
import { Chord, ChordQuality } from "./Chord"
import { Note } from "./Note"
import { NoteSet } from "./NoteSet"

export abstract class MusicalKey extends NoteSet {
	private basicChords: Chord[]

	constructor(root: Note, noteValues: number[], basicChordQualities: Array<ChordQuality>){
		super(root, noteValues)
		this.basicChords = 
			zip(this.notes, basicChordQualities)
				.map(([note, quality]) => Chord.fromRootAndQuality(note, quality))
	}

	getBasicChords(): Chord[] {
		return this.basicChords
	}

	containsChord(chord: Chord): boolean {
		return this.basicChords.some((basicChord) => basicChord.equals(chord))
	}
}

export class MajorKey extends MusicalKey {
	constructor(root: Note){
		super(root, [0, 2, 4, 5, 7, 9, 11], ["major", "minor", "minor", "major", "major", "minor", "diminished"])
	}

	toString(){
		return `${this.root} major`
	}
}

export class MinorKey extends MusicalKey {
	constructor(root: Note){
		super(root, [0, 2, 3, 5, 7, 8, 10], ["minor", "diminished", "major", "minor", "minor", "major", "major"])
	}

	toString(){
		return `${this.root} minor`
	}
}