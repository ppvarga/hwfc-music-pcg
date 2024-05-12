import { NoteOutput } from "../../components/MidiPlayer"
import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { ConflictError } from "../Tile"
import { TileCanvasProps, TileCanvas, unionOfTileCanvasProps } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { HWFCNode } from "./HWFCNode"
import { Section } from "./Section"
import { SharedDecision } from "./backtracking"
import { Result } from "./results"

interface SectionLevelNodeProps {
	higherValues: HigherValues
	noteCanvasProps: TileCanvasProps<OctavedNote>
	chordesqueCanvasProps: TileCanvasProps<Chordesque>
	sectionCanvasProps: TileCanvasProps<Section>
	random: Random
	position: number
	decisions: SharedDecision[]
}

export class SectionLevelNode extends HWFCNode<any, Section, Chordesque> {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	protected canvas: TileCanvas<never, Section>
	private random: Random
	protected position: number
	protected subNodes: HWFCNode<Section, Chordesque, OctavedNote>[]
	protected decisions: SharedDecision[]

	constructor(props: SectionLevelNodeProps) {
		super()
		this.higherValues = props.higherValues
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvasProps = props.chordesqueCanvasProps
		this.random = props.random
		this.position = props.position
		this.subNodes = []
		this.decisions = props.decisions
		this.canvas = new TileCanvas(
			this.higherValues.numSections,
			props.sectionCanvasProps,
			this.higherValues,
			props.random,
			this,
			props.decisions,
			"section"
		)
	}

	private createChordLevelNode(sectionc: Section, position: number) {
		const section = sectionc.getObj()
		return new ChordLevelNode({
			higherValues: {
				...this.higherValues, 
				section: sectionc, 
				bpm: section.bpmStrategy === "Custom" ? section.bpm : this.higherValues.bpm,
				numChords: section.numChordsStrategy === "Custom" ? section.numChords : this.higherValues.numChords,
				useRhythm: section.rhythmStrategy === "On" || (section.rhythmStrategy === "Inherit" && this.higherValues.useRhythm),
				rhythmPatternOptions: section.rhythmStrategy === "On" ? section.rhythmPatternOptions : this.higherValues.rhythmPatternOptions,
				melodyLength: section.melodyLengthStrategy === "Custom" ? section.melodyLength : this.higherValues.melodyLength,
			},
			noteCanvasProps: unionOfTileCanvasProps( 
				this.noteCanvasProps, 
				section.noteCanvasProps
			),
			chordesqueCanvasProps: unionOfTileCanvasProps(
				this.chordesqueCanvasProps,
				section.chordesqueCanvasProps
			),
			random: this.random,
			parent: this,
			position,
			decisions: this.decisions
		})
	}

	public generate(): [NoteOutput[], number] {
		let sections = this.canvas.generate()
		let isValid = true
		const durations: number[] = []
		const noteOutputss: NoteOutput[][] = []
		const setResultAtPosition = (position: number, newDuration : number, newNoteOutputs : NoteOutput[]) => {
			if(position < 0 || position >= durations.length) return false
			durations[position] = newDuration
			noteOutputss[position] = newNoteOutputs
			return true
		}

		while(true){
			let prevNode : ChordLevelNode | undefined = undefined

			for (let i = 0; i < sections.length; i++) {
				const subSolution = this.solveAtPosition(i, sections, prevNode, setResultAtPosition)
				if(subSolution === "Fail") {
					isValid = false
					break
				}
				const {noteOutputs, duration, prevNode: newprevNode} = subSolution
				noteOutputss.push(noteOutputs)
				durations.push(duration)
				prevNode = newprevNode
			}
			if (isValid) break
			sections = this.canvas.tryAnother()
		}
		const allNoteOutputs : NoteOutput[] = []
		let totalDuration = 0
		for (let i = 0; i < sections.length; i++) {
			totalDuration += durations[i]
			for(const subNoteOutput of noteOutputss[i]){
				allNoteOutputs.push(subNoteOutput)
			}
		}
		return [allNoteOutputs, totalDuration]
	}

	backtrackPrev(
		prevNode: ChordLevelNode | undefined,
		setResultAtPosition : (position: number, newDuration : number, newNoteOutputs : NoteOutput[]) => boolean,
		prevPosition : number
	): boolean {
		if(prevNode === undefined) return false
		try {
			const [prevNotes, prevDuration] = prevNode.tryAnother()
			if(!setResultAtPosition(prevPosition, prevDuration, prevNotes)) throw new Error("Looking into the future")
			return true
		} catch (e) {
			if(e instanceof ConflictError) {
				return false
			}
			throw e
		}

	}

	solveAtPosition(
			position : number, 
			sections : Section[], 
			prevNode: ChordLevelNode | undefined, 
			setResultAtPosition : (position: number, newDuration : number, newNoteOutputs : NoteOutput[]) => boolean
		): SubSolution {
		const section = sections[position]
		const chordLevelNode = this.createChordLevelNode(section, position)
		this.subNodes.push(chordLevelNode)
		try {
			const [sectionNoteOutputs, sectionDuration] = chordLevelNode.generate()
			let duration = 0
			let noteOutputs: NoteOutput[] = []

			noteOutputs.push(...(sectionNoteOutputs.map((noteOutput) => {
				noteOutput.startTime += duration
				return noteOutput
			})))

			duration += sectionDuration

			return {noteOutputs, duration, prevNode:chordLevelNode}
		} catch (e) {
			if (e instanceof ConflictError){		
				if (this.backtrackPrev(prevNode, setResultAtPosition, position - 1)) {
					this.subNodes.pop()
					return this.solveAtPosition(position, sections, prevNode, setResultAtPosition)
				} else {
					return "Fail"
				}
			} else throw e
		}
	}
}

interface SubSolutionSuccess {
	noteOutputs : NoteOutput[]
	duration : number
	prevNode : ChordLevelNode
} 

type SubSolution = SubSolutionSuccess | "Fail"