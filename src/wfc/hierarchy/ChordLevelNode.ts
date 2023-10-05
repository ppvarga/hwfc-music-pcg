import {
	chordResultToOutput,
	chordResultWithRhythmToOutput,
} from "../../audio/midi"
import { NoteOutput } from "../../components/MidiPlayer"
import { OctavedNote } from "../../music_theory/Note"
import {
	RhythmPatternOptions,
	numberOfNotesInRhythmPattern,
	getRandomRhythmPattern,
} from "../../music_theory/Rhythm"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas } from "../TileCanvas"
import { NoteLevelNode } from "./NoteLevelNode"
import { ChordPrototype, Chordesque } from "./prototypes"
import { ChordResult, ChordResultWithRhythm } from "./results"

interface ChordLevelNodeProps {
	higherValues?: HigherValues
	noteCanvasProps: TileCanvasProps<OctavedNote>
	chordesqueCanvasProps: TileCanvasProps<Chordesque>
	random: Random
	rhythmPatternOptions: RhythmPatternOptions
	melodyLength: number
}

export class ChordLevelNode {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvas: TileCanvas<Chordesque>
	private rhythmPatternOptions: RhythmPatternOptions
	private random: Random
	private melodyLength: number

	constructor(props: ChordLevelNodeProps) {
		this.higherValues = props.higherValues ?? new HigherValues()
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvas = new TileCanvas(
			props.chordesqueCanvasProps,
			this.higherValues,
			props.random,
		)
		this.rhythmPatternOptions = props.rhythmPatternOptions
		this.random = props.random
		this.melodyLength = props.melodyLength
	}

	public generateWithoutRhythm(): ChordResult[] {
		const chords = this.chordesqueCanvas.generate()

		return chords.map((chord) => {
			const chordValue = chord.getChord()
			let actualNoteCanvasProps = this.noteCanvasProps
			if (chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.union(
					chord.getNoteCanvasProps(),
				)
			}
			const noteLevelNode = new NoteLevelNode(
				actualNoteCanvasProps,
				this.higherValues.copyWithChord(chordValue),
				this.random,
			)
			return {
				chord: chordValue,
				notes: noteLevelNode.generate(),
			}
		})
	}

	public generateWithRhythm(): ChordResultWithRhythm[] {
		const chords = this.chordesqueCanvas.generate()

		return chords.map((chord) => {
			const chordValue = chord.getChord()
			const rhythmPattern = getRandomRhythmPattern(
				this.melodyLength,
				this.rhythmPatternOptions,
				this.random,
			)
			let actualNoteCanvasProps = this.noteCanvasProps
			if (chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.union(
					chord.getNoteCanvasProps(),
				)
			}
			actualNoteCanvasProps.setSize(
				numberOfNotesInRhythmPattern(rhythmPattern),
			)
			const noteLevelNode = new NoteLevelNode(
				actualNoteCanvasProps,
				this.higherValues.copyWithChord(chordValue),
				this.random,
			)
			return {
				chord: chordValue,
				notes: noteLevelNode.generate(),
				rhythmPattern,
			}
		})
	}

	public generate(useRhythmByDefault: boolean): [NoteOutput[], number] {
		const chords = this.chordesqueCanvas.generate()

		let offset = 0
		const out: NoteOutput[] = []
		for (const chord of chords) {
			const chordValue = chord.getChord()
			let actualNoteCanvasProps = this.noteCanvasProps
			let actualMelodyLength = this.melodyLength
			let rhythmPatternOptions = this.rhythmPatternOptions
			
			if (chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.union(chord.getNoteCanvasProps())
				if (chord.getMelodyLengthStrategy() === "Custom") actualMelodyLength = chord.getMelodyLength()
				if (chord.getRhythmStrategy() === "On") rhythmPatternOptions = chord.getRhythmPatternOptions()
			}

			const chordHasPreference =
				chord instanceof ChordPrototype &&
				(chord.getRhythmStrategy() === "On" ||
					chord.getRhythmStrategy() === "Off")
			const useRhythm = chordHasPreference
				? chord.getRhythmStrategy() === "On"
				: useRhythmByDefault

			const noteHigherValues = this.higherValues.copyWithChord(chordValue)
			const noteHigherValuesWithKey =
				chord instanceof ChordPrototype &&
				chord.getUseDifferentMelodyKey()
					? noteHigherValues.copyWithKey(chord.getMelodyKey())
					: noteHigherValues

			if (useRhythm) {
				const rhythmPattern = getRandomRhythmPattern(
					actualMelodyLength,
					rhythmPatternOptions,
					this.random,
				)
				actualNoteCanvasProps.setSize(
					numberOfNotesInRhythmPattern(rhythmPattern),
				)
				const noteLevelNode = new NoteLevelNode(
					actualNoteCanvasProps,
					noteHigherValuesWithKey,
					this.random,
				)
				const abstractResult = {
					chord: chordValue,
					notes: noteLevelNode.generate(),
					rhythmPattern,
				}
				const [subResult, newOffset] = chordResultWithRhythmToOutput(
					abstractResult,
					offset,
				)
				out.push(...subResult)
				offset = newOffset
			} else {
				actualNoteCanvasProps.setSize(actualMelodyLength)
				const noteLevelNode = new NoteLevelNode(
					actualNoteCanvasProps,
					noteHigherValuesWithKey,
					this.random,
				)
				const abstractResult = {
					chord: chordValue,
					notes: noteLevelNode.generate(),
				}
				const [subResult, newOffset] = chordResultToOutput(
					abstractResult,
					offset,
				)
				out.push(...subResult)
				offset = newOffset
			}
		}

		return [out, offset]
	}
}
