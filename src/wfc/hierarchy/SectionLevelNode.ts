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

interface SectionLevelNodeProps {
	higherValues: HigherValues
	noteCanvasProps: TileCanvasProps<OctavedNote>
	chordesqueCanvasProps: TileCanvasProps<Chordesque>
	sectionCanvasProps: TileCanvasProps<Section>
	random: Random
	position: number
	decisions: SharedDecision[]
}

export class SectionLevelNode extends HWFCNode<any, Section> {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	protected canvas: TileCanvas<never, Section>
	private random: Random
	protected position: number
	protected subNodes: HWFCNode<Section, Chordesque>[]
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
		let totalDuration = 0
		let noteOutputs: NoteOutput[] = []
		while(true){
			noteOutputs = []
			totalDuration = 0

			let prevSectionCanvas : TileCanvas<Section, Chordesque> | undefined = undefined
			for (const [position,section] of sections.entries()) {
				const chordLevelNode = this.createChordLevelNode(section, position)
				this.subNodes.push(chordLevelNode)
				let sectionNoteOutputs
				let sectionDuration
				try {
					[sectionNoteOutputs, sectionDuration] = chordLevelNode.generate()
				} catch (e) {
					if (e instanceof ConflictError){

						////////////// THIS NEEDS TO BE FIGURED OUT
						while(true){
							try {
								prevSectionCanvas!.tryAnother()
							} catch (e) {
								if (e instanceof ConflictError) {
									break
								}
							}
						}
						

						if (this.backtrackPrev(prevSectionCanvas!)) {
							
						} else {
							isValid = false
							break
						}
						////////////// IT REALLY DOES

						isValid = false
						break
					} else throw e
				}

				noteOutputs.push(...(sectionNoteOutputs.map((noteOutput) => {
					noteOutput.startTime += totalDuration
					return noteOutput
				})))

				totalDuration += sectionDuration

				prevSectionCanvas = chordLevelNode.getCanvas()
			}
			if (isValid) break
			sections = this.canvas.tryAnother()
		}
		return [noteOutputs, totalDuration]
	}

	backtrackPrev(prevSectionCanvas: TileCanvas<Section, Chordesque>): boolean {
		throw new Error("Method not implemented.")
	}
}
