import { useState } from "react"
import { useAppContext } from "../AppState"
import { MidiPlayer, MidiVisualizer } from "../MidiPlayer"
import { chordResultsWithRhythmToMidi, sectionResultToMidi } from "../audio/midi"
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
	const [src, setSrc] = useState("")
	const {inferKey, numChords, chordOptionsPerCell, chordConstraintSet, melodyLength, noteOptionsPerCell, noteConstraintSet, keyGrabber, useRhythm, minNumNotes, startOnNote, maxRestLength} = useAppContext()

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
			chordResultsWithRhythmToMidi(node.generateWithRhythm(), setSrc)
		} else {
			sectionResultToMidi(node.generateWithoutRhythm(), setSrc)
		}
	}

	return <div className="main-column">
		<h2>Output</h2>
		<button onClick={updatePlayer}>
        Generate
		</button>
		<br />
		{src && <><MidiPlayer
			id="myPlayer" visualizer="#myVisualizer" src={src} />
		<MidiVisualizer type="piano-roll" id="myVisualizer" /></>}
	</div>
}