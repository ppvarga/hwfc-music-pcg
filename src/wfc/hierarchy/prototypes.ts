import { RhythmStrategy } from "../../components/RhythmSettings"
import { Chord, ChordIR, ChordQuality, chordIRToString, isChordIR } from "../../music_theory/Chord"
import { MusicalKey } from "../../music_theory/MusicalKey"
import { Note, OctavedNote } from "../../music_theory/Note"
import { RhythmPatternOptions } from "../../music_theory/Rhythm"
import { ConstraintSet } from "../ConstraintSet"
import { Grabber } from "../Grabber"
import { OptionsPerCell } from "../OptionsPerCell"
import { TileCanvasProps } from "../TileCanvas"
import { NoteConstraintIR, convertIRToNoteConstraint } from "../constraints/constraintUtils"

export interface Chordesque {
	getName(): string
	getChord: () => Chord
}

export type ChordesqueIR = ChordIR | string

export class ChordPrototype implements Chordesque {
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chord: Chord
	private name: string
	private rhythmStrategy: RhythmStrategy
	private rhythmPatternOptions: RhythmPatternOptions
	private melodyLength: number

	constructor(name: string, noteCanvasProps: TileCanvasProps<OctavedNote>, value: Chord, rhythmStrategy: RhythmStrategy, rhythmPatternOptions: RhythmPatternOptions, melodyLength: number) {
		this.name = name
		this.noteCanvasProps = noteCanvasProps
		this.chord = value
		this.rhythmStrategy = rhythmStrategy
		this.rhythmPatternOptions = rhythmPatternOptions
		this.melodyLength = melodyLength
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

	getRhythmStrategy() {
		return this.rhythmStrategy
	}

	getRhythmPatternOptions() {
		return this.rhythmPatternOptions
	}

	getMelodyLength() {
		return this.melodyLength
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
		},
		allowedPrecedingChords: [] as string[],
		allowedFollowingChords: [] as string[],
		restrictPrecedingChords: false,
		restrictFollowingChords: false,
		rhythmStrategy: "Inherit" as RhythmStrategy,
		melodyLength: 4,
		rhythmPatternOptions: {
			onlyStartOnNote: true,
			minimumNumberOfNotes: 3,
			maximumRestLength: 1,
		} as RhythmPatternOptions
	}
}

export type ChordPrototypeIR = ReturnType<typeof ChordPrototypeInit>

export class Section {
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	private rhythmPatternOptions: RhythmPatternOptions
	private name: string

	constructor(noteCanvasProps: TileCanvasProps<OctavedNote>, chordesqueCanvasProps: TileCanvasProps<Chordesque>, rhythmPatternOptions: RhythmPatternOptions, name: string) {
		this.noteCanvasProps = noteCanvasProps
		this.chordesqueCanvasProps = chordesqueCanvasProps
		this.rhythmPatternOptions = rhythmPatternOptions
		this.name = name
	}

	getNoteCanvasProps() {
		return this.noteCanvasProps
	}

	getChordesqueCanvasProps() {
		return this.chordesqueCanvasProps
	}

	getRhythmPatternOptions() {
		return this.rhythmPatternOptions
	}

	getName() {
		return this.name
	}
  
}

export function chordPrototypeIRToChordPrototype(protoIR: ChordPrototypeIR, keyGrabber: Grabber<MusicalKey>): ChordPrototype {
	const noteCanvasProps = new TileCanvasProps(
		protoIR.noteCanvasProps.size,
		new OptionsPerCell(OctavedNote.all(), protoIR.noteCanvasProps.optionsPerCell),
		new ConstraintSet(protoIR.noteCanvasProps.constraints.map(noteConstraint => convertIRToNoteConstraint({ir: noteConstraint, keyGrabber}))),
	)
	return new ChordPrototype(protoIR.name, noteCanvasProps, Chord.fromIR(protoIR.chord), protoIR.rhythmStrategy, protoIR.rhythmPatternOptions, protoIR.melodyLength)
}

export function chordesqueIRMapToChordesqueMap(chordesqueIRMap: Map<number, ChordesqueIR[]>, chordPrototypes: ChordPrototypeIR[], keyGrabber: Grabber<MusicalKey>): Map<number, Chordesque[]> {
	const chordesqueMap = new Map<number, Chordesque[]>()

	for(const [position, chordesqueIRs] of chordesqueIRMap.entries()) {
		const chordesqueList: Chordesque[] = chordesqueIRs.map((chordesqueIR) => {
			if(isChordIR(chordesqueIR)) {
				return Chord.fromIR(chordesqueIR)
			} else {
				const proto = chordPrototypes.find(proto => proto.name === chordesqueIR)
				if(proto === undefined) throw new Error(`Chord prototype ${chordesqueIR} not found`)
				return chordPrototypeIRToChordPrototype(proto, keyGrabber)
			}
		})
		chordesqueMap.set(position, chordesqueList)
	}
	return chordesqueMap
}

export function chordesqueIRToString(chordesqueIR: ChordesqueIR): string {
	if(typeof chordesqueIR === "string") {
		return chordesqueIR
	} else {
		return chordIRToString(chordesqueIR)
	}
}