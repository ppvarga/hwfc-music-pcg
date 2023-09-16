import { useState } from "react"
import { useAppContext } from "../AppState"
import { MidiPlayer } from "./MidiPlayer"
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
import { ChordPrototype } from "../wfc/hierarchy/prototypes"
import { ChordPrototypeOnlyFollowedByConstraint } from "../wfc/constraints/ChordPrototypeOnlyFollowedByConstraint"
import { constantGrabber } from "../wfc/grabbers/constantGrabbers"
import { ChordPrototypeOnlyPrecededByConstraint } from "../wfc/constraints/ChordPrototypeOnlyPrecededByConstraint"

export function Output(){
	const [isPlaying, setIsPlaying] = useState(false)
	const {output, setOutput, onlyUseChordPrototypes, chordPrototypes, inferKey, numChords, chordOptionsPerCell, chordConstraintSet, melodyLength, noteOptionsPerCell, noteConstraintSet, keyGrabber, minNumNotes, startOnNote, maxRestLength, useRhythm, } = useAppContext()

	const noteCanvasProps = new TileCanvasProps(
		melodyLength,
		new OptionsPerCell(OctavedNote.all(), noteOptionsPerCell),
		new ConstraintSet(noteConstraintSet.map(noteConstraint => convertIRToNoteConstraint({ir: noteConstraint, keyGrabber}))),
	)

	function updatePlayer() {
		const parsedChordPrototypes = []
		const chordPrototypeConstraints = []

		const properlyNamedChordPrototypes = chordPrototypes.map(proto => {
			if(proto.name !== "") return proto
			const protoName = `ChordPrototype${proto.id}`
			return {...proto, name: protoName}
		})
		
		for(const protoIR of properlyNamedChordPrototypes){
			const noteCanvasProps = new TileCanvasProps(
				protoIR.noteCanvasProps.size,
				new OptionsPerCell(OctavedNote.all(), protoIR.noteCanvasProps.optionsPerCell),
				new ConstraintSet(protoIR.noteCanvasProps.constraints.map(noteConstraint => convertIRToNoteConstraint({ir: noteConstraint, keyGrabber}))),
			)
			const proto = new ChordPrototype(protoIR.name, noteCanvasProps, Chord.fromIR(protoIR.chord))
			parsedChordPrototypes.push(proto)

			if(protoIR.restrictPrecedingChords){
				if(protoIR.allowedPrecedingChords.every(chordName => {
					if(properlyNamedChordPrototypes.some(proto => proto.name === chordName)) return true
					return (Chord.parseChordString(chordName) !== undefined)
				})){
					chordPrototypeConstraints.push(new ChordPrototypeOnlyPrecededByConstraint(proto.getName(), constantGrabber(protoIR.allowedPrecedingChords)))
				}
			}

			if(protoIR.restrictFollowingChords){
				if(protoIR.allowedFollowingChords.every(chordName => {
					if(properlyNamedChordPrototypes.some(proto => proto.name === chordName)) return true
					return (Chord.parseChordString(chordName) !== undefined)
				})){
					chordPrototypeConstraints.push(new ChordPrototypeOnlyFollowedByConstraint(proto.getName(), constantGrabber(protoIR.allowedFollowingChords)))
				}
			}
		}
		
		const chordesqueCanvasProps = new TileCanvasProps(
			numChords,
			new OptionsPerCell([
				...parsedChordPrototypes,
				...(onlyUseChordPrototypes ? [] : Chord.allBasicChords()),
			], chordOptionsPerCell),
			new ConstraintSet([...chordConstraintSet.map(chordConstraint => convertIRToChordConstraint({ir: chordConstraint, keyGrabber})), ...chordPrototypeConstraints]),
		)

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
		<button onClick={updatePlayer} disabled={isPlaying}>
        Generate
		</button>
		<br />
		<MidiPlayer notes={output[0]} length={output[1]} isPlaying={isPlaying} setIsPlaying={setIsPlaying}/>
	</div>
}