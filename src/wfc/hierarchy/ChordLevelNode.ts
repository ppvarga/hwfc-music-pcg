import { chordResultToOutput, chordResultWithRhythmToOutput } from "../../audio/midi"
import { NoteOutput } from "../../components/MidiPlayer"
import { OctavedNote } from "../../music_theory/Note"
import { getRandomRhythmPattern } from "../../music_theory/Rhythm"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas, unionOfTileCanvasProps } from "../TileCanvas"
import { NoteLevelNode } from "./NoteLevelNode"
import { ChordPrototype, Chordesque } from "./Chordesque"
import { SectionLevelNode } from "./SectionLevelNode"
import { HWFCNode } from "./HWFCNode"
import { Section } from "./Section"

interface ChordLevelNodeProps {
	higherValues: HigherValues
	noteCanvasProps: TileCanvasProps<OctavedNote>
	chordesqueCanvasProps: TileCanvasProps<Chordesque>
	random: Random
	parent: SectionLevelNode
	position: number
}

export class ChordLevelNode extends HWFCNode<Section, Chordesque> {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	protected canvas: TileCanvas<Section, Chordesque>
	private random: Random
	protected position: number
	protected subNodes: HWFCNode<Chordesque, any>[]

	constructor(props: ChordLevelNodeProps) {
		super()
		this.higherValues = props.higherValues 
		this.noteCanvasProps = props.noteCanvasProps
		this.random = props.random
		this.parent = props.parent
		this.position = props.position
		this.subNodes = []
		this.canvas = new TileCanvas(
			this.higherValues.numChords,
			props.chordesqueCanvasProps,
			this.higherValues,
			props.random,
			this
		)
	}

	public generate(): [NoteOutput[], number] {
		const chords = this.canvas.generate()

		let offset = 0
		const out: NoteOutput[] = []
		for (const [position,chord] of chords.entries()) {
			const chordValue = chord.getChord()
			let actualNoteCanvasProps = this.noteCanvasProps
			let actualMelodyLength = chord instanceof ChordPrototype ? chord.melodyLength : this.higherValues.melodyLength
			let rhythmPatternOptions = this.higherValues.rhythmPatternOptions
			
			if (chord instanceof ChordPrototype) {
				actualNoteCanvasProps = unionOfTileCanvasProps (
					this.noteCanvasProps, 
					chord.noteCanvasProps,
				)
				if (chord.melodyLengthStrategy === "Custom") actualMelodyLength = chord.melodyLength
				if (chord.rhythmStrategy === "On") rhythmPatternOptions = chord.rhythmPatternOptions
			}

			const chordHasPreference =
				chord instanceof ChordPrototype &&
				(chord.rhythmStrategy === "On" ||
					chord.rhythmStrategy === "Off")

			const useRhythm = chordHasPreference
				? chord.rhythmStrategy === "On"
				: this.higherValues.useRhythm


			if(useRhythm) {
				const rhythmPattern = getRandomRhythmPattern(
					actualMelodyLength,
					rhythmPatternOptions,
					this.random,
				)

				const newHigherValues: HigherValues = {...{...this.higherValues, chord: chordValue, useRhythm, melodyLength: rhythmPattern.getUnits().filter(u => u.type == "note").length},
					...(chord instanceof ChordPrototype ? {
						bpm: chord.bpmStrategy === "Custom" ? chord.bpm : this.higherValues.bpm,
					} : {})
				}

				const noteLevelNode = new NoteLevelNode(
					actualNoteCanvasProps,
					newHigherValues,
					this.random,
					this,
					position
				)

				this.subNodes.push(noteLevelNode)

				const abstractResultBase = {
					chord: chordValue,
					notes: noteLevelNode.generate()
				}

				const abstractResult = {
					...abstractResultBase,
					rhythmPattern
				}

				const [subResult, newOffset] = chordResultWithRhythmToOutput(
					abstractResult,
					this.higherValues.bpm,
					offset,
				)
				out.push(...subResult)
				offset = newOffset
				
			} else {
				
				const newHigherValues: HigherValues = {...{...this.higherValues, chord: chordValue, useRhythm},
					...(chord instanceof ChordPrototype ? {
						rhythmPatternOptions: chord.rhythmPatternOptions,
						melodyLength: chord.melodyLength,
						bpm: chord.bpmStrategy === "Custom" ? chord.bpm : this.higherValues.bpm,
					} : {})
				}

				const noteLevelNode = new NoteLevelNode(
					actualNoteCanvasProps,
					newHigherValues,
					this.random,
					this,
					position
				)

				this.subNodes.push(noteLevelNode)

				const abstractResultBase = {
					chord: chordValue,
					notes: noteLevelNode.generate()
				}

				const [subResult, newOffset] = chordResultToOutput(
					abstractResultBase,
					this.higherValues.bpm,
					offset,
				)
				out.push(...subResult)
				offset = newOffset
			}
		}

		return [out, offset]
	}
}
