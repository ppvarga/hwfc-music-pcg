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
import { CollapseType } from "../../components/CollapseType"

interface ChordLevelNodeProps {
	higherValues: HigherValues
	noteCanvasProps: TileCanvasProps<OctavedNote>[]
	chordesqueCanvasProps: TileCanvasProps<Chordesque>
	random: Random
	parent: SectionLevelNode
	position: number
}

export class ChordLevelNode extends HWFCNode<Section, Chordesque> {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>[]
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
				actualNoteCanvasProps = this.noteCanvasProps.map((noteCanvasPropsItem) => unionOfTileCanvasProps (
					noteCanvasPropsItem, 
					chord.noteCanvasProps,
				))
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
					actualNoteCanvasProps[0],
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
					actualNoteCanvasProps[0],
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

	public generateSevInstruments(numInstruments: number, collapseType: CollapseType, k?: number): [NoteOutput[], number] {
		const chords = this.canvas.generate()

		let offset = 0
		const out: NoteOutput[] = []
		for (const [position,chord] of chords.entries()) {
			const chordValue = chord.getChord()
			let actualNoteCanvasProps = this.noteCanvasProps
			let actualMelodyLength = chord instanceof ChordPrototype ? chord.melodyLength : this.higherValues.melodyLength
			let rhythmPatternOptions = this.higherValues.rhythmPatternOptions
			
			if (chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.map((noteCanvasPropsItem) => unionOfTileCanvasProps (
					noteCanvasPropsItem, 
					chord.noteCanvasProps,
				))
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
				throw new Error("Disable rhythm, not yet compatible with several instruments")
				
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
						actualNoteCanvasProps[i],
						newHigherValues,
						this.random,
						this,
						position,
						i + 1
					)
	
					this.subNodes.push(noteLevelNode)
					chordChildren.push(noteLevelNode)
				}

				const abstractResultBases = collapseType == "Naive collapse" ?
					this.generateNaiveCollapse(chordChildren, chordValue) : collapseType == "Random collapse" ?
					this.generateRandomCollapse(chordChildren, chordValue) : collapseType == "Random k collapse" ?
					this.generateKCollapse(chordChildren, chordValue, k ? k : 1) : this.generateJamCollapse(chordChildren, chordValue, k ? k : 1)

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

	private generateKCollapse(nodes: NoteLevelNode[], chordValue: Chord, k: number, rhythmPattern?: RhythmPattern): ResultBase[] {
		if (rhythmPattern) {
			throw new Error("haha bozo")
		} else {
			let collapsedNodesSet = new Set()
			const random = new Random()
			while (collapsedNodesSet.size < nodes.length) {
				const nextNode = nodes[random.nextInt(nodes.length)]
				if (!nextNode.getCanvas().isCollapsed()) {
					for (let i = 0; i < k; i++) {
						//try {
						if (!nextNode.getCanvas().isCollapsed())
							nextNode.getCanvas().collapseNextOtherInstruments(nodes)
						//} catch (e) {
						//	break
						//}
						
					}
				} else {
					collapsedNodesSet.add(nextNode)
				}
				let numCollapsed = 0
				for (let i = 0; i < nodes.length; i++) {
					if (nodes[i].getCanvas().isCollapsed()) {
						numCollapsed++
					}
				}
				if (numCollapsed == nodes.length) break
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

	private generateJamCollapse(nodes: NoteLevelNode[], chordValue: Chord, k: number = 1, rhythmPattern?: RhythmPattern): ResultBase[] {
		if (rhythmPattern) {
			throw new Error("haha boze")
		} else {
			const abstractResultBases: ResultBase[] = []
			const curNode: NoteLevelNode = nodes.shift()!
			const abstractResultBase = {
				chord: chordValue,
				notes: curNode.generateOtherInstruments(nodes)
			}
			abstractResultBases.push(abstractResultBase)
			nodes.push(curNode)
			return [...abstractResultBases, ...this.generateKCollapse(nodes, chordValue, k)]
		}
	}
}

export type ResultBase = {
	chord: Chord,
	notes: OctavedNote[],
	rhythmPattern?: RhythmPattern,
}
