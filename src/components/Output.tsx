import { useState } from "react"
import { useAppContext } from "../AppState"
import { MidiPlayer, NoteOutput } from "./MidiPlayer"
import { sectionResultToOutput, sectionResultWithRhythmToOutput } from "../audio/midi"
import { Chord } from "../music_theory/Chord"
import { OctavedNote } from "../music_theory/Note"
import { rhythmPatternsForLength } from "../music_theory/Rhythm"
import { Random } from "../util/Random"
import { ConstraintSet } from "../wfc/ConstraintSet"
import { OptionsPerCell } from "../wfc/OptionsPerCell"
import { TileCanvasProps } from "../wfc/TileCanvas"
import { RestMaximumLengthHardConstraint } from "../wfc/constraints/RestMaximumLengthHardConstraint"
import { ChordLevelNode } from "../wfc/hierarchy/ChordLevelNode"
import { HigherValues } from "../wfc/HigherValues"
import { convertIRToChordConstraint, convertIRToNoteConstraint } from "../wfc/constraints/constraintUtils"
import { MinimumNumberOfNotesHardConstraint } from "../wfc/constraints/MinimumNumberOfNotesHardConstraint"

export function Output(){
	const [output, setOutput] = useState<[NoteOutput[], number]>([[], 0])
	const {inferKey, numChords, chordOptionsPerCell, chordConstraintSet, melodyLength, noteOptionsPerCell, noteConstraintSet, keyGrabber, minNumNotes, startOnNote, maxRestLength, useRhythm} = useAppContext()

	const chordesqueCanvasProps = new TileCanvasProps(
		numChords,
		new OptionsPerCell(Chord.allBasicChords(), chordOptionsPerCell),
		new ConstraintSet(chordConstraintSet.map(chordConstraint => convertIRToChordConstraint({ir: chordConstraint, keyGrabber}))),
	)

	const noteCanvasProps = new TileCanvasProps(
		melodyLength,
		new OptionsPerCell(OctavedNote.all(), noteOptionsPerCell),
		new ConstraintSet(noteConstraintSet.map(noteConstraint => convertIRToNoteConstraint({ir: noteConstraint, keyGrabber}))),
	)

	function updatePlayer() {
		const node = new ChordLevelNode({
			noteCanvasProps,
			chordesqueCanvasProps,
			rhythmPatternCanvasProps: new TileCanvasProps(
				numChords,
				new OptionsPerCell(rhythmPatternsForLength(melodyLength, minNumNotes, startOnNote)),
				new ConstraintSet([new RestMaximumLengthHardConstraint(maxRestLength), new MinimumNumberOfNotesHardConstraint(minNumNotes)])
			),
			random: new Random(),
			higherValues: new HigherValues({key: inferKey()})
		})

		if(useRhythm){
			setOutput(sectionResultWithRhythmToOutput(node.generateWithRhythm()))
		} else {
			setOutput(sectionResultToOutput(node.generateWithoutRhythm()))
		}
	}

	return <div className="main-column">
		<h2>Output</h2>
		<button onClick={updatePlayer}>
        Generate
		</button>
		<br />
		<MidiPlayer notes={output[0]} length={output[1]}/>
	</div>
}