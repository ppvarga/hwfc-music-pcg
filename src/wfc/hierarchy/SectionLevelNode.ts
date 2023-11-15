import { NoteOutput } from "../../components/MidiPlayer"
import { OctavedNote } from "../../music_theory/Note"
import { RhythmPatternOptions } from "../../music_theory/Rhythm"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas, unionOfTileCanvasProps } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque } from "./Chordesque"
import { Section } from "./Section"
import { SectionResult, SectionResultWithRhythm } from "./results"

interface SectionLevelNodeProps {
	higherValues?: HigherValues
	noteCanvasProps: TileCanvasProps<OctavedNote>
	chordesqueCanvasProps: TileCanvasProps<Chordesque>
	sectionCanvasProps: TileCanvasProps<Section>
	rhythmPatternOptions: RhythmPatternOptions
	melodyLength: number
	random: Random
}

export class SectionLevelNode {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	private sectionCanvas: TileCanvas<Section>
	private rhythmPatternOptions: RhythmPatternOptions
	private random: Random
	private melodyLength: number

	constructor(props: SectionLevelNodeProps) {
		this.higherValues = props.higherValues ?? new HigherValues()
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvasProps = props.chordesqueCanvasProps
		this.rhythmPatternOptions = props.rhythmPatternOptions
		this.sectionCanvas = new TileCanvas(
			props.sectionCanvasProps,
			this.higherValues,
			props.random,
		)
		this.random = props.random
		this.melodyLength = props.melodyLength
	}

	private createChordLevelNode(section: Section) {
		const chordesqueCanvasProps = unionOfTileCanvasProps(this.chordesqueCanvasProps, section.getChordesqueCanvasProps())
		if(section.getNumChordsStrategy() == "Custom") {chordesqueCanvasProps.size = section.getNumChords()}
		else {chordesqueCanvasProps.size = this.chordesqueCanvasProps.size}
		console.log(chordesqueCanvasProps)
		console.log(section)
		return new ChordLevelNode({
			higherValues: this.higherValues.copyWithSection(section),
			noteCanvasProps: unionOfTileCanvasProps( 
				this.noteCanvasProps, 
				section.getNoteCanvasProps()),
			chordesqueCanvasProps,
			rhythmPatternOptions: section.getRhythmStrategy() === "On" ? section.getRhythmPatternOptions() : this.rhythmPatternOptions,
			random: this.random,
			melodyLength: section.getMelodyLengthStrategy() === "Custom" ? section.getMelodyLength() : this.melodyLength,
		})
	}

	public generateWithoutRhythm(): SectionResult[] {
		const sections = this.sectionCanvas.generate()
		return sections.map((section) =>
			this.createChordLevelNode(section).generateWithoutRhythm(),
		)
	}

	public generateWithRhythm(): SectionResultWithRhythm[] {
		const sections = this.sectionCanvas.generate()
		return sections.map((section) =>
			this.createChordLevelNode(section).generateWithRhythm(),
		)
	}

	public generate(useRhythmByDefault: boolean): [NoteOutput[], number] {
		const sections = this.sectionCanvas.generate()
		const noteOutputs: NoteOutput[] = []
		let totalDuration = 0
		console.log(this.chordesqueCanvasProps)
		for (const section of sections) {
			const useRhythm = section.getRhythmStrategy() === "On" || (section.getRhythmStrategy() === "Inherit" && useRhythmByDefault)

			const chordLevelNode = this.createChordLevelNode(section)
			const [sectionNoteOutputs, sectionDuration] = chordLevelNode.generate(useRhythm)

			noteOutputs.push(...(sectionNoteOutputs.map((noteOutput) => {
				noteOutput.startTime += totalDuration
				return noteOutput
			})))

			totalDuration += sectionDuration
		}
		return [noteOutputs, totalDuration]
	}
}
