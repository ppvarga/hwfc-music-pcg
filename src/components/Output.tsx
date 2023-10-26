import { useState } from "react"
import { errorsInAppState, useAppContext } from "../AppState"
import { MidiPlayer } from "./MidiPlayer"
import { Chord } from "../music_theory/Chord"
import { OctavedNote } from "../music_theory/Note"
import { Random } from "../util/Random"
import { ConstraintSet } from "../wfc/ConstraintSet"
import { OptionsPerCell } from "../wfc/OptionsPerCell"
import { TileCanvasProps } from "../wfc/TileCanvas"
import { HigherValues } from "../wfc/HigherValues"
import { convertIRToChordConstraint, convertIRToNoteConstraint } from "../wfc/constraints/constraintUtils"
import { ChordPrototype, Chordesque, chordPrototypeIRToChordPrototype, chordesqueIRMapToChordesqueMap } from "../wfc/hierarchy/Chordesque"
import { ChordPrototypeOnlyFollowedByConstraint } from "../wfc/constraints/ChordPrototypeOnlyFollowedByConstraint"
import { constantGrabber } from "../wfc/grabbers/constantGrabbers"
import { ChordPrototypeOnlyPrecededByConstraint } from "../wfc/constraints/ChordPrototypeOnlyPrecededByConstraint"
import { Constraint } from "../wfc/constraints/concepts/Constraint"
import { Section, sectionIRMapToSectionMap, sectionIRToSection } from "../wfc/hierarchy/Section"
import { SectionOnlyPrecededByHardConstraint } from "../wfc/constraints/SectionOnlyPrecededByHardConstraint"
import { SectionOnlyFollowedByHardConstraint } from "../wfc/constraints/SectionOnlyFollowedByHardConstraint"
import { SectionLevelNode } from "../wfc/hierarchy/SectionLevelNode"

export function Output() {
	const [isPlaying, setIsPlaying] = useState(false)
	const appState = useAppContext()
	const { output, setOutput, onlyUseChordPrototypes, chordPrototypes, inferKey, inferMelodyKey, differentMelodyKey, numChords, chordOptionsPerCell, chordConstraintSet, melodyLength, noteOptionsPerCell, noteConstraintSet, minNumNotes, startOnNote, maxRestLength, useRhythm, sections, sectionOptionsPerCell, numSections} = appState

	const noteCanvasProps = new TileCanvasProps(
		melodyLength,
		new OptionsPerCell(OctavedNote.all(), noteOptionsPerCell.transform(OctavedNote.multipleFromIRs)),
		new ConstraintSet(noteConstraintSet.map(noteConstraint => convertIRToNoteConstraint(noteConstraint))),
	)

	function parseChordPrototypes(): [ChordPrototype[], Constraint<Chordesque>[]] {
		const parsedChordPrototypes = []
		const chordPrototypeConstraints = []

		const properlyNamedChordPrototypes = chordPrototypes.map(proto => {
			if (proto.name !== "") return proto
			const protoName = `ChordPrototype${proto.id}`
			return { ...proto, name: protoName }
		})

		for (const protoIR of properlyNamedChordPrototypes) {
			parsedChordPrototypes.push(chordPrototypeIRToChordPrototype(protoIR))

			if (protoIR.restrictPrecedingChords) {
				if (protoIR.allowedPrecedingChords.every(chordName => {
					if (properlyNamedChordPrototypes.some(proto => proto.name === chordName)) return true
					return (Chord.parseChordString(chordName) !== undefined)
				})) {
					chordPrototypeConstraints.push(new ChordPrototypeOnlyPrecededByConstraint(protoIR.name, constantGrabber(protoIR.allowedPrecedingChords)))
				}
			}

			if (protoIR.restrictFollowingChords) {
				if (protoIR.allowedFollowingChords.every(chordName => {
					if (properlyNamedChordPrototypes.some(proto => proto.name === chordName)) return true
					return (Chord.parseChordString(chordName) !== undefined)
				})) {
					chordPrototypeConstraints.push(new ChordPrototypeOnlyFollowedByConstraint(protoIR.name, constantGrabber(protoIR.allowedFollowingChords)))
				}
			}
		}

		return [parsedChordPrototypes, chordPrototypeConstraints]
	}

	function parseSections(): [Section[], Constraint<Section>[]] {
		const parsedSections = []
		const sectionConstraints = []

		const properlyNamedSections = sections.map(section => {
			if (section.name !== "") return section
			const sectionName = `Section${section.id}`
			return { ...section, name: sectionName }
		})

		for (const sectionIR of properlyNamedSections) {
			parsedSections.push(sectionIRToSection(sectionIR, chordPrototypes))

			if (sectionIR.restrictPrecedingSections) {
				if (sectionIR.allowedPrecedingSections.every(sectionName => {
					if (properlyNamedSections.some(section => section.name === sectionName)) return true
					return (Chord.parseChordString(sectionName) !== undefined)
				})) {
					sectionConstraints.push(new SectionOnlyPrecededByHardConstraint(sectionIR.name, constantGrabber(sectionIR.allowedPrecedingSections)))
				}
			}

			if (sectionIR.restrictFollowingSections) {
				if (sectionIR.allowedFollowingSections.every(sectionName => {
					if (properlyNamedSections.some(section => section.name === sectionName)) return true
					return (Chord.parseChordString(sectionName) !== undefined)
				})) {
					sectionConstraints.push(new SectionOnlyFollowedByHardConstraint(sectionIR.name, constantGrabber(sectionIR.allowedFollowingSections)))
				}
			}
		}

		return [parsedSections, sectionConstraints]
	}

	function updatePlayer() {
		const errors = errorsInAppState(appState)
		if (errors.length > 0) {
			alert(errors.join("\n"))
			return
		}
		
		try {
			const [parsedChordPrototypes, chordPrototypeConstraints] = parseChordPrototypes()
			const [parsedSections, sectionConstraints] = parseSections()

			const chordesqueCanvasProps = new TileCanvasProps(
				numChords,
				new OptionsPerCell([
					...parsedChordPrototypes,
					...(onlyUseChordPrototypes ? [] : Chord.allBasicChords()),
				], chordesqueIRMapToChordesqueMap(chordOptionsPerCell, chordPrototypes)),
				new ConstraintSet([...chordConstraintSet.map(chordConstraint => convertIRToChordConstraint(chordConstraint)), ...chordPrototypeConstraints]),
			)

			const sectionCanvasProps = new TileCanvasProps(
				numSections,
				new OptionsPerCell(parsedSections, sectionIRMapToSectionMap(sectionOptionsPerCell, sections, chordPrototypes)),
				new ConstraintSet(sectionConstraints),
			)

			const node = new SectionLevelNode({
				noteCanvasProps,
				chordesqueCanvasProps,
				sectionCanvasProps,
				melodyLength,
				rhythmPatternOptions: {
					minimumNumberOfNotes: minNumNotes,
					onlyStartOnNote: startOnNote,
					maximumRestLength: maxRestLength,
				},
				random: new Random(),
				higherValues: new HigherValues({ key: inferKey(), melodyKey: differentMelodyKey ? inferMelodyKey() : undefined }),
			})

			setOutput(node.generate(useRhythm))
		} catch (e) {
			console.error(e)
			alert(e)
		}
	}

	return <div style={{
			display: "flex",
			flexDirection:"row", 
			justifyContent:"center", 
			position: "fixed", 
			bottom:0,
			left:"50%",
			transform: "translateX(-50%)",
			height:"20vh", 
			border:"white 1px solid", 
			borderRadius:5, 
			padding:10, 
			backgroundColor: "rgba(0,0,0,0.75)",
			maxWidth:"90vw",
		}}>
		<MidiPlayer notes={output[0]} length={output[1]} isPlaying={isPlaying} setIsPlaying={setIsPlaying} updatePlayer={updatePlayer}/>
	</div>
}