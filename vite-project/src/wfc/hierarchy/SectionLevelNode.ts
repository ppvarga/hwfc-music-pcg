import { OctavedNote } from "../../music_theory/Note"
import { RhythmPattern } from "../../music_theory/Rhythm"
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
  rhythmPatternCanvasProps: TileCanvasProps<RhythmPattern>;
  sectionCanvasProps: TileCanvasProps<Section>;
  random: Random;
}

export class SectionLevelNode {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvasProps: TileCanvasProps<Chordesque>
	private rhythmPatternCanvasProps: TileCanvasProps<RhythmPattern>
	private sectionCanvas: TileCanvas<Section>
	private random: Random

	constructor(props: SectionLevelNodeProps){
		this.higherValues = props.higherValues ?? new HigherValues()
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvasProps = props.chordesqueCanvasProps
		this.rhythmPatternCanvasProps = props.rhythmPatternCanvasProps
		this.sectionCanvas = new TileCanvas(props.sectionCanvasProps, this.higherValues, props.random)
		this.random = props.random
	}

	public generateWithoutRhythm() : SectionResult[] {
		const sections = this.sectionCanvas.generate()
		return sections.map(section => {
			const chordLevelNode = new ChordLevelNode({
				higherValues: this.higherValues.copyWithSection(section),
				noteCanvasProps: this.noteCanvasProps.union(section.getNoteCanvasProps()),
				chordesqueCanvasProps: this.chordesqueCanvasProps.union(section.getChordesqueCanvasProps()), 
				rhythmPatternCanvasProps: this.rhythmPatternCanvasProps.union(section.getRhythmPatternCanvasProps()), 
				random: this.random
			})
			return chordLevelNode.generateWithoutRhythm()
		})
	}

	public generateWithRhythm() : SectionResultWithRhythm[] {
		const sections = this.sectionCanvas.generate()
		return sections.map(section => {
			const chordLevelNode = new ChordLevelNode({
				higherValues: this.higherValues.copyWithSection(section), 
				noteCanvasProps: this.noteCanvasProps.union(section.getNoteCanvasProps()), 
				chordesqueCanvasProps: this.chordesqueCanvasProps.union(section.getChordesqueCanvasProps()), 
				rhythmPatternCanvasProps: this.rhythmPatternCanvasProps.union(section.getRhythmPatternCanvasProps()), 
				random: this.random
			})
			return chordLevelNode.generateWithRhythm()
		})
	}
}