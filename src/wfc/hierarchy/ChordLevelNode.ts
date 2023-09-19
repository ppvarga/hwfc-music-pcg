import { OctavedNote } from "../../music_theory/Note"
import { RhythmPatternOptions, numberOfNotesInRhythmPattern, getRandomRhythmPattern } from "../../music_theory/Rhythm"
import { Random } from "../../util/Random"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas } from "../TileCanvas"
import { NoteLevelNode } from "./NoteLevelNode"
import { ChordPrototype, Chordesque } from "./prototypes"
import { ChordResult, ChordResultWithRhythm } from "./results"

interface ChordLevelNodeProps {
  higherValues?: HigherValues;
  noteCanvasProps: TileCanvasProps<OctavedNote>;
  chordesqueCanvasProps: TileCanvasProps<Chordesque>;
  random: Random;
	rhythmPatternOptions: RhythmPatternOptions
}

export class ChordLevelNode {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvas: TileCanvas<Chordesque>
	private rhythmPatternOptions: RhythmPatternOptions
	private random: Random

	constructor(props: ChordLevelNodeProps){
		this.higherValues = props.higherValues ?? new HigherValues()
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvas = new TileCanvas(props.chordesqueCanvasProps, this.higherValues, props.random)
		this.rhythmPatternOptions = props.rhythmPatternOptions
		this.random = props.random
	}

	public generateWithoutRhythm() : ChordResult[] {
		const chords = this.chordesqueCanvas.generate()
    
		return chords.map((chord) => {
			const chordValue = chord.getChord()
			let actualNoteCanvasProps = this.noteCanvasProps
			if(chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.union(chord.getNoteCanvasProps())
			}
			const noteLevelNode = new NoteLevelNode(actualNoteCanvasProps, this.higherValues.copyWithChord(chordValue), this.random)
			return {
				chord: chordValue,
				notes: noteLevelNode.generate(),
			}
		})
	}

	public generateWithRhythm() : ChordResultWithRhythm[] {
		const chords = this.chordesqueCanvas.generate()

		return chords.map(chord => {
			const chordValue = chord.getChord()
			const rhythmPattern = getRandomRhythmPattern(this.rhythmPatternOptions, this.random)
			let actualNoteCanvasProps = this.noteCanvasProps
			if(chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.union(chord.getNoteCanvasProps())
			}
			actualNoteCanvasProps.setSize(numberOfNotesInRhythmPattern(rhythmPattern))
			const noteLevelNode = new NoteLevelNode(actualNoteCanvasProps, this.higherValues.copyWithChord(chordValue), this.random)
			return {
				chord: chordValue,
				notes: noteLevelNode.generate(),
				rhythmPattern
			}
		})
	}
}