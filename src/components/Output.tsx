import { useState } from "react"
import { useAppContext } from "../AppState"
import { MidiPlayer } from "./MidiPlayer"
import { Chord } from "../music_theory/Chord"
import { OctavedNote } from "../music_theory/Note"
import { Random } from "../util/Random"
import { ConstraintSet } from "../wfc/ConstraintSet"
import { OptionsPerCell } from "../wfc/OptionsPerCell"
import { TileCanvasProps } from "../wfc/TileCanvas"
import { ChordLevelNode } from "../wfc/hierarchy/ChordLevelNode"
import { HigherValues } from "../wfc/HigherValues"
import { convertIRToChordConstraint, convertIRToNoteConstraint } from "../wfc/constraints/constraintUtils"
import { chordPrototypeIRToChordPrototype, chordesqueIRMapToChordesqueMap } from "../wfc/hierarchy/prototypes"
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
		try{
			const parsedChordPrototypes = []
			const chordPrototypeConstraints = []

			const properlyNamedChordPrototypes = chordPrototypes.map(proto => {
				if(proto.name !== "") return proto
				const protoName = `ChordPrototype${proto.id}`
				return {...proto, name: protoName}
			})

			for(const protoIR of properlyNamedChordPrototypes){
				parsedChordPrototypes.push(chordPrototypeIRToChordPrototype(protoIR, keyGrabber))

				if(protoIR.restrictPrecedingChords){
					if(protoIR.allowedPrecedingChords.every(chordName => {
						if(properlyNamedChordPrototypes.some(proto => proto.name === chordName)) return true
						return (Chord.parseChordString(chordName) !== undefined)
					})){
						chordPrototypeConstraints.push(new ChordPrototypeOnlyPrecededByConstraint(protoIR.name, constantGrabber(protoIR.allowedPrecedingChords)))
					}
				}

				if(protoIR.restrictFollowingChords){
					if(protoIR.allowedFollowingChords.every(chordName => {
						if(properlyNamedChordPrototypes.some(proto => proto.name === chordName)) return true
						return (Chord.parseChordString(chordName) !== undefined)
					})){
						chordPrototypeConstraints.push(new ChordPrototypeOnlyFollowedByConstraint(protoIR.name, constantGrabber(protoIR.allowedFollowingChords)))
					}
				}
			}
			
			const chordesqueCanvasProps = new TileCanvasProps(
				numChords,
				new OptionsPerCell([
					...parsedChordPrototypes,
					...(onlyUseChordPrototypes ? [] : Chord.allBasicChords()),
				], chordesqueIRMapToChordesqueMap(chordOptionsPerCell, chordPrototypes, keyGrabber)),
				new ConstraintSet([...chordConstraintSet.map(chordConstraint => convertIRToChordConstraint({ir: chordConstraint, keyGrabber})), ...chordPrototypeConstraints]),
			)

			const node = new ChordLevelNode({
				noteCanvasProps,
				chordesqueCanvasProps,
				melodyLength,
				rhythmPatternOptions: {
					minimumNumberOfNotes: minNumNotes,
					onlyStartOnNote: startOnNote,
					maximumRestLength: maxRestLength,
				},
				random: new Random(),
				higherValues: new HigherValues({key: inferKey()})
			})

			setOutput(node.generate(useRhythm))
		} catch(e){
			console.error(e)
			alert(e)
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