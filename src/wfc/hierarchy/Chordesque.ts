import { MelodyLengthStrategy, MusicalKeyType } from "../../components/GlobalSettings"
import { RhythmStrategy } from "../../components/RhythmSettings"
import {
	Chord,
	ChordIR,
	ChordQuality,
	chordIRToString,
	isChordIR,
} from "../../music_theory/Chord"
import { MusicalKey } from "../../music_theory/MusicalKey"
import { Note, OctavedNote } from "../../music_theory/Note"
import { RhythmPatternOptions } from "../../music_theory/Rhythm"
import { ConstraintSet } from "../ConstraintSet"
import { OptionsPerCell } from "../OptionsPerCell"
import { TileCanvasProps } from "../TileCanvas"
import {
	NoteConstraintIR,
	convertIRToNoteConstraint,
} from "../constraints/constraintUtils"

export interface Chordesque {
	getName(): string
	getChord: () => Chord
}

export type ChordesqueIR = ChordIR | string

interface ChordPrototypeProps {
	name: string
	noteCanvasProps: TileCanvasProps<OctavedNote>
	value: Chord
	rhythmStrategy: RhythmStrategy
	rhythmPatternOptions: RhythmPatternOptions
	melodyLength: number
	useDifferentMelodyKey: boolean
	melodyKey: MusicalKey
}

export class ChordPrototype implements Chordesque {
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chord: Chord
	private name: string
	private rhythmStrategy: RhythmStrategy
	private rhythmPatternOptions: RhythmPatternOptions
	private melodyLength: number
	private useDifferentMelodyKey: boolean
	private melodyKey: MusicalKey

	constructor({
		name,
		noteCanvasProps,
		value,
		rhythmStrategy,
		rhythmPatternOptions,
		melodyLength,
		useDifferentMelodyKey,
		melodyKey,
	}: ChordPrototypeProps) {
		this.name = name
		this.noteCanvasProps = noteCanvasProps
		this.chord = value
		this.rhythmStrategy = rhythmStrategy
		this.rhythmPatternOptions = rhythmPatternOptions
		this.melodyLength = melodyLength
		this.useDifferentMelodyKey = useDifferentMelodyKey
		this.melodyKey = melodyKey
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

	getUseDifferentMelodyKey() {
		return this.useDifferentMelodyKey
	}

	getMelodyKey() {
		return this.melodyKey
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
		melodyLengthStrategy: "Inherit" as MelodyLengthStrategy,
		melodyLength: 4,
		rhythmPatternOptions: {
			onlyStartOnNote: true,
			minimumNumberOfNotes: 3,
			maximumRestLength: 1,
		} as RhythmPatternOptions,
		useDifferentMelodyKey: false,
		melodyKeyRoot: Note.C,
		melodyKeyType: "major" as MusicalKeyType,
	}
}

export type ChordPrototypeIR = ReturnType<typeof ChordPrototypeInit>

export function chordPrototypeIRToChordPrototype(
	protoIR: ChordPrototypeIR,
): ChordPrototype {
	const noteCanvasProps = new TileCanvasProps(
		protoIR.noteCanvasProps.size,
		new OptionsPerCell(
			OctavedNote.all(),
			protoIR.noteCanvasProps.optionsPerCell,
		),
		new ConstraintSet(
			protoIR.noteCanvasProps.constraints.map((noteConstraint) =>
				convertIRToNoteConstraint(noteConstraint),
			),
		),
	)
	return new ChordPrototype({
		...protoIR,
		value: Chord.fromIR(protoIR.chord),
		noteCanvasProps,
		melodyKey: MusicalKey.fromRootAndType(
			protoIR.melodyKeyRoot,
			protoIR.melodyKeyType,
		),
	})
}

export function chordesqueIRMapToChordesqueMap(
	chordesqueIRMap: Map<number, ChordesqueIR[]>,
	chordPrototypes: ChordPrototypeIR[],
): Map<number, Chordesque[]> {
	const chordesqueMap = new Map<number, Chordesque[]>()

	for (const [position, chordesqueIRs] of chordesqueIRMap.entries()) {
		const chordesqueList: Chordesque[] = chordesqueIRs.map(
			(chordesqueIR) => {
				if (isChordIR(chordesqueIR)) {
					return Chord.fromIR(chordesqueIR)
				} else {
					const proto = chordPrototypes.find(
						(proto) => proto.name === chordesqueIR,
					)
					if (proto === undefined)
						throw new Error(
							`Chord prototype ${chordesqueIR} not found`,
						)
					return chordPrototypeIRToChordPrototype(proto)
				}
			},
		)
		chordesqueMap.set(position, chordesqueList)
	}
	return chordesqueMap
}

export function chordesqueIRToString(chordesqueIR: ChordesqueIR): string {
	if (typeof chordesqueIR === "string") {
		return chordesqueIR
	} else {
		return chordIRToString(chordesqueIR)
	}
}
