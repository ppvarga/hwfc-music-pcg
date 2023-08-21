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

export function Output(){
	const [src, setSrc] = useState("")
	const [useRhythm, setUseRhythm] = useState(false)

	const switchUseRhythm = () => setUseRhythm(!useRhythm)

	const {inferKey, numChords, chordOptionsPerCell, chordConstraintSet, numNotesPerChord, noteOptionsPerCell, noteConstraintSet} = useAppContext()

	const chordesqueCanvasProps = new TileCanvasProps(
		numChords,
		new OptionsPerCell(Chord.allBasicChords(), chordOptionsPerCell),
		chordConstraintSet,
	)

	const noteCanvasProps = new TileCanvasProps(
		numNotesPerChord,
		new OptionsPerCell(OctavedNote.all(), noteOptionsPerCell),
		noteConstraintSet
	)

	function updatePlayer() {
		const node = new ChordLevelNode({
			noteCanvasProps,
			chordesqueCanvasProps,
			rhythmPatternCanvasProps: new TileCanvasProps(
				4,
				new OptionsPerCell(rhythmPatternsForLength(4, 3, true)),
				new ConstraintSet([new RestMaximumLengthHardConstraint(2)])
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



	return <>
		<h2>Output</h2>
		<label>
        Use rhythm
			<input type="checkbox" checked={useRhythm} onChange={switchUseRhythm}/>
		</label>
		<br />
		<button onClick={updatePlayer}>
        Generate
		</button>
		<br />
		{src && <><MidiPlayer
			id="myPlayer" visualizer="#myVisualizer" src={src} />
		<MidiVisualizer type="piano-roll" id="myVisualizer" /></>}
	</>
}