import { chordResultToOutput, chordResultWithRhythmToOutput } from "../../audio/midi"
import { NoteOutput } from "../../components/MidiPlayer"
import { OctavedNote } from "../../music_theory/Note"
import { RhythmPattern, getRandomRhythmPattern } from "../../music_theory/Rhythm"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas, unionOfTileCanvasProps } from "../TileCanvas"
import { NoteLevelNode } from "./NoteLevelNode"
import { ChordPrototype, Chordesque } from "./Chordesque"
import { SectionLevelNode } from "./SectionLevelNode"
import { HWFCNode } from "./HWFCNode"
import { Section } from "./Section"
import { Chord } from "../../music_theory/Chord"

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
					1
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
					1
				)
				out.push(...subResult)
				offset = newOffset
			}
		}

		return [out, offset]

	}

	public generateSevInstruments(numInstruments: number): [NoteOutput[], number] {
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
				// const rhythmPattern = getRandomRhythmPattern(
				// 	actualMelodyLength,
				// 	rhythmPatternOptions,
				// 	this.random,
				// )

				// const newHigherValues: HigherValues = {...{...this.higherValues, chord: chordValue, useRhythm, melodyLength: rhythmPattern.getUnits().filter(u => u.type == "note").length},
				// 	...(chord instanceof ChordPrototype ? {
				// 		bpm: chord.bpmStrategy === "Custom" ? chord.bpm : this.higherValues.bpm,
				// 	} : {})
				// }

				// const noteLevelNode = new NoteLevelNode(
				// 	actualNoteCanvasProps,
				// 	newHigherValues,
				// 	this.random,
				// 	this,
				// 	position
				// )

				// this.subNodes.push(noteLevelNode)

				// const abstractResultBase = {
				// 	chord: chordValue,
				// 	notes: noteLevelNode.generate()
				// }

				// const abstractResult = {
				// 	...abstractResultBase,
				// 	rhythmPattern
				// }

				// const [subResult, newOffset] = chordResultWithRhythmToOutput(
				// 	abstractResult,
				// 	this.higherValues.bpm,
				// 	offset,
				// 	1
				// )
				// out.push(...subResult)
				// offset = newOffset
				throw new Error("no rhythm yet ya bozo")
				
			} else {
				
				const newHigherValues: HigherValues = {...{...this.higherValues, chord: chordValue, useRhythm},
					...(chord instanceof ChordPrototype ? {
						rhythmPatternOptions: chord.rhythmPatternOptions,
						melodyLength: chord.melodyLength,
						bpm: chord.bpmStrategy === "Custom" ? chord.bpm : this.higherValues.bpm,
					} : {})
				}

				const chordChildren: NoteLevelNode[] = []

				for (let i = 0; i < numInstruments; i++) {
					const noteLevelNode = new NoteLevelNode(
						actualNoteCanvasProps,
						newHigherValues,
						this.random,
						this,
						position
					)
	
					this.subNodes.push(noteLevelNode)
					chordChildren.push(noteLevelNode)
				}
				const abstractResultBases = this.generateRandomCollapse(chordChildren, chordValue)

				let counter = 1
				let tempOffset = offset

				abstractResultBases.forEach((abstractResultBase) => {
					const [subResult, newOffset] = chordResultToOutput(
						abstractResultBase,
						this.higherValues.bpm,
						offset,
						counter
					)
					out.push(...subResult)
					tempOffset = newOffset
					counter = counter + 1
				})
				offset = tempOffset
			}
		}

		return [out, offset]
	}

	private generateNaiveCollapse(nodes: NoteLevelNode[], chordValue: Chord, rhythmPattern?: RhythmPattern): ResultBase[] {
		if (rhythmPattern) {
			throw new Error("haha bozo")
		} else {
			const abstractResultBases = []
			for (let i = 0; i < nodes.length; i++) {
				const curNode: NoteLevelNode = nodes.shift()!
				const abstractResultBase = {
					chord: chordValue,
					notes: curNode.generateOtherInstruments(nodes)
				}
				abstractResultBases.push(abstractResultBase)
				nodes.push(curNode)
			}
			return abstractResultBases
		}
	}

	private generateRandomCollapse(nodes: NoteLevelNode[], chordValue: Chord, rhythmPattern?: RhythmPattern): ResultBase[] {
		if (rhythmPattern) {
			throw new Error("haha bozo")
		} else {
			let collapsedNodesSet = new Set()
			const random = new Random()
			while (collapsedNodesSet.size < nodes.length) {
				const nextNode = nodes[random.nextInt(nodes.length)]
				if (!nextNode.getCanvas().isCollapsed()) {
					nextNode.getCanvas().collapseNextOtherInstruments(nodes)
				} else {
					collapsedNodesSet.add(nextNode)
				}
			}

			const abstractResultBases = []
			for (let i = 0; i < nodes.length; i++) {
				const curNode: NoteLevelNode = nodes.shift()!
				const abstractResultBase = {
					chord: chordValue,
					notes: curNode.generateOtherInstruments(nodes)
				}
				abstractResultBases.push(abstractResultBase)
				nodes.push(curNode)
			}
			return abstractResultBases
		}
	}

	// private generateKCollapse(nodes: NoteLevelNode[], chordValue: Chord, k: number, rhythmPattern?: RhythmPattern): ResultBase {

	// }

	// private generateJamCollapse(nodes: NoteLevelNode[], chordValue: Chord, k: number = 1, rhythmPattern?: RhythmPattern): ResultBase {

	// }
}

export type ResultBase = {
	chord: Chord,
	notes: OctavedNote[],
	rhythmPattern?: RhythmPattern,
}
