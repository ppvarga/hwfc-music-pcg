import { OctavedNote } from "../../music_theory/Note"
import { RhythmPatternOptions } from "../../music_theory/Rhythm"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas } from "../TileCanvas"
import { ChordLevelNode } from "./ChordLevelNode"
import { Chordesque, Section } from "./prototypes"
import { SectionResult, SectionResultWithRhythm } from "./results"

interface SectionLevelNodeProps {
  higherValues?: HigherValues;
  noteCanvasProps: TileCanvasProps<OctavedNote>;
  chordesqueCanvasProps: TileCanvasProps<Chordesque>;
  sectionCanvasProps: TileCanvasProps<Section>;
	rhythmPatternOptions: RhythmPatternOptions
  random: Random;
}

export class SectionLevelNode {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	private sectionCanvas: TileCanvas<Section>
	private rhythmPatternOptions: RhythmPatternOptions
	private random: Random

	constructor(props: SectionLevelNodeProps){
		this.higherValues = props.higherValues ?? new HigherValues()
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvasProps = props.chordesqueCanvasProps
		this.rhythmPatternOptions = props.rhythmPatternOptions
		this.sectionCanvas = new TileCanvas(props.sectionCanvasProps, this.higherValues, props.random)
		this.random = props.random
	}

	private createChordLevelNode(section: Section) {
		return new ChordLevelNode({
			higherValues: this.higherValues.copyWithSection(section),
			noteCanvasProps: this.noteCanvasProps.union(section.getNoteCanvasProps()),
			chordesqueCanvasProps: this.chordesqueCanvasProps.union(section.getChordesqueCanvasProps()), 
			rhythmPatternOptions: {...this.rhythmPatternOptions, ...section.getRhythmPatternOptions()},
			random: this.random
		})
	}

	public generateWithoutRhythm() : SectionResult[] {
		const sections = this.sectionCanvas.generate()
		return sections.map(section => this.createChordLevelNode(section).generateWithoutRhythm())
	}

	public generateWithRhythm() : SectionResultWithRhythm[] {
		const sections = this.sectionCanvas.generate()
		return sections.map(section => this.createChordLevelNode(section).generateWithRhythm())
	}
}