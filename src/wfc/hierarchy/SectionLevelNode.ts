import { CollapseType } from "../../components/CollapseType"
import { NoteOutput } from "../../components/MidiPlayer"
import { OctavedNote } from "../../music_theory/Note"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas, unionOfTileCanvasProps } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { HWFCNode } from "./HWFCNode"
import { Section } from "./Section"

interface SectionLevelNodeProps {
	higherValues: HigherValues
	noteCanvasProps: TileCanvasProps<OctavedNote>[]
	chordesqueCanvasProps: TileCanvasProps<Chordesque>
	sectionCanvasProps: TileCanvasProps<Section>
	random: Random
	position: number
}

export class SectionLevelNode extends HWFCNode<any, Section> {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>[]
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	protected canvas: TileCanvas<never, Section>
	private random: Random
	protected position: number
	protected subNodes: HWFCNode<Section, Chordesque>[]

	constructor(props: SectionLevelNodeProps) {
		super()
		this.higherValues = props.higherValues
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvasProps = props.chordesqueCanvasProps
		this.random = props.random
		this.position = props.position
		this.subNodes = []
		this.canvas = new TileCanvas(
			this.higherValues.numSections,
			props.sectionCanvasProps,
			this.higherValues,
			props.random,
			this
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
			noteCanvasProps: this.noteCanvasProps.map((noteCanvasPropsItem) => unionOfTileCanvasProps( 
				noteCanvasPropsItem, 
				section.noteCanvasProps
			)),
			chordesqueCanvasProps: unionOfTileCanvasProps(
				this.chordesqueCanvasProps,
				section.chordesqueCanvasProps
			),
			random: this.random,
			parent: this,
			position
		})
	}

	public generate(): [NoteOutput[], number] {
		const sections = this.canvas.generate()
		const noteOutputs: NoteOutput[] = []
		let totalDuration = 0
		for (const [position,section] of sections.entries()) {
			const chordLevelNode = this.createChordLevelNode(section, position)
			this.subNodes.push(chordLevelNode)
			const [sectionNoteOutputs, sectionDuration] = chordLevelNode.generate()

			noteOutputs.push(...(sectionNoteOutputs.map((noteOutput) => {
				noteOutput.startTime += totalDuration
				return noteOutput
			})))

			totalDuration += sectionDuration
		}
		return [noteOutputs, totalDuration]
	}

	public generateOtherInstruments(numInstruments: number, collapseType: CollapseType, k?: number): [NoteOutput[], number] {
		const sections = this.canvas.generate()
		const noteOutputs: NoteOutput[] = []
		let totalDuration = 0
		for (const [position,section] of sections.entries()) {
			const chordLevelNode = this.createChordLevelNode(section, position)
			this.subNodes.push(chordLevelNode)
			const [sectionNoteOutputs, sectionDuration] = chordLevelNode.generateSevInstruments(numInstruments, collapseType, k)

			noteOutputs.push(...(sectionNoteOutputs.map((noteOutput) => {
				noteOutput.startTime += totalDuration
				return noteOutput
			})))

			totalDuration += sectionDuration
		}
		return [noteOutputs, totalDuration]
	}
}
