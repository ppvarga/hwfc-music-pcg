import { OctavedNote } from "../../music_theory/Note"
import { RhythmPattern } from "../../music_theory/Rhythm"
import { Random } from "../../util/Random"
import { zip } from "../../util/utils"
import { HigherValues } from "../HigherValues"
import { TileCanvasProps, TileCanvas } from "../TileCanvas"
import { NoteLevelNode } from "./NoteLevelNode"
import { ChordPrototype, Chordesque } from "./prototypes"
import { ChordResult, ChordResultWithRhythm } from "./results"

interface ChordLevelNodeProps {
  higherValues?: HigherValues;
  noteCanvasProps: TileCanvasProps<OctavedNote>;
  chordesqueCanvasProps: TileCanvasProps<Chordesque>;
  rhythmPatternCanvasProps: TileCanvasProps<RhythmPattern>;
  random: Random;
}

export class ChordLevelNode {
	private higherValues: HigherValues
	private noteCanvasProps: TileCanvasProps<OctavedNote>
	private chordesqueCanvas: TileCanvas<Chordesque>
	private rhythmPatternCanvas: TileCanvas<RhythmPattern>

	constructor(props: ChordLevelNodeProps){
		this.higherValues = props.higherValues ?? new HigherValues()
		this.noteCanvasProps = props.noteCanvasProps
		this.chordesqueCanvas = new TileCanvas(props.chordesqueCanvasProps, this.higherValues, props.random)
		this.rhythmPatternCanvas = new TileCanvas(props.rhythmPatternCanvasProps, this.higherValues, props.random)
	}

	public generateWithoutRhythm() : ChordResult[] {
		const chords = this.chordesqueCanvas.generate()
    
		return chords.map((chord) => {
			const chordValue = chord.getChord()
			let actualNoteCanvasProps = this.noteCanvasProps
			if(chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.union(chord.getNoteCanvasProps())
			}
			const noteLevelNode = new NoteLevelNode(actualNoteCanvasProps, this.higherValues.copyWithChord(chordValue), this.rhythmPatternCanvas.getRandom())
			return {
				chord: chordValue,
				notes: noteLevelNode.generate(),
			}
		})
	}

	public generateWithRhythm() : ChordResultWithRhythm[] {
		const chords = this.chordesqueCanvas.generate()
		const rhythmPatterns = this.rhythmPatternCanvas.generate()

		return zip(chords, rhythmPatterns).map(([chord, rhythmPattern]) => {
			const chordValue = chord.getChord()
			let actualNoteCanvasProps = this.noteCanvasProps
			if(chord instanceof ChordPrototype) {
				actualNoteCanvasProps = this.noteCanvasProps.union(chord.getNoteCanvasProps())
			}
			actualNoteCanvasProps.setSize(rhythmPattern.length)
			const noteLevelNode = new NoteLevelNode(actualNoteCanvasProps, this.higherValues.copyWithChord(chordValue), this.rhythmPatternCanvas.getRandom())
			return {
				chord: chordValue,
				notes: noteLevelNode.generate(),
				rhythmPattern: rhythmPattern
			}
		})
	}
}