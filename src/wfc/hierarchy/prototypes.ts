import { Chord, ChordQuality } from "../../music_theory/Chord"
import { Note, OctavedNote } from "../../music_theory/Note"
import { RhythmPattern } from "../../music_theory/Rhythm"
import { TileCanvasProps } from "../TileCanvas"
import { NoteConstraintIR } from "../constraints/constraintUtils"

export interface Chordesque {
  getChord: () => Chord
}

export class ChordPrototype implements Chordesque {
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chord: Chord
	private name: string

	constructor(name: string, noteCanvasProps: TileCanvasProps<OctavedNote>, value: Chord) {
		this.name = name
		this.noteCanvasProps = noteCanvasProps
		this.chord = value
	}

	getChord() {
		return this.chord
	}

	getName() {
		return this.name
	}

	getNoteCanvasProps() {
		return this.noteCanvasProps
	}
}

export const ChordPrototypeInit = (id: number) => {
	return {
		name: "",
		id: id,
		noteCanvasProps: {
			size: 4,
			optionsPerCell: new Map<number, OctavedNote[]>(),
			constraints: [] as NoteConstraintIR[],
		},
		chord: {
			root: Note.C,
			quality: "major" as ChordQuality,
		}
	}
}

export type ChordPrototypeIR = ReturnType<typeof ChordPrototypeInit>

export class Section {
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	private rhythmPatternCanvasProps: TileCanvasProps<RhythmPattern>
	private name: string

	constructor(noteCanvasProps: TileCanvasProps<OctavedNote>, chordesqueCanvasProps: TileCanvasProps<Chordesque>, rhythmPatternCanvasProps: TileCanvasProps<RhythmPattern>, name: string) {
		this.noteCanvasProps = noteCanvasProps
		this.chordesqueCanvasProps = chordesqueCanvasProps
		this.rhythmPatternCanvasProps = rhythmPatternCanvasProps
		this.name = name
	}

	getNoteCanvasProps() {
		return this.noteCanvasProps
	}

	getChordesqueCanvasProps() {
		return this.chordesqueCanvasProps
	}

	getRhythmPatternCanvasProps() {
		return this.rhythmPatternCanvasProps
	}

	getName() {
		return this.name
	}
  
}