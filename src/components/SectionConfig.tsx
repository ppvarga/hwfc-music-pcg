import { useState } from "react"
import { Note, OctavedNote } from "../music_theory/Note"
import { ChordConstraintIR, NoteConstraintIR } from "../wfc/constraints/constraintUtils"
import { SectionProvider } from "../AppState"
import { NoteTiles } from "./NoteTiles"
import { NoteConstraints } from "./NoteConstraints"
import { buttonStyles,} from "../styles"
import { InheritedMelodyLengthSelector, MelodyKeySelector, melodyKeyTypeToOption } from "./GlobalSettings"
import { SelectKeyTypeOption,} from "./utils"
import { InheritedRhythmSettings } from "./RhythmSettings"
import { SectionIR } from "../wfc/hierarchy/Section"
import { ChordesqueIR } from "../wfc/hierarchy/Chordesque"
import { NeighborRules } from "./NeighborRules"
import { ChordTiles } from "./ChordTiles"
import { Chord } from "../music_theory/Chord"
import { ChordConstraints } from "./ChordConstraints"

interface SectionConfigProps {
	section: SectionIR,
	removeSection: () => void
	onUpdate: (changes: Partial<SectionIR>) => void
}

export function SectionConfig({ section, removeSection, onUpdate }: SectionConfigProps) {
	const updateNoteCanvasProps = (changes: Partial<SectionIR["noteCanvasProps"]>) => {
		onUpdate({ noteCanvasProps: { ...section.noteCanvasProps, ...changes } })
	}
	const updateChordCanvasProps = (changes: Partial<SectionIR["chordesqueCanvasProps"]>) => {
		onUpdate({ chordesqueCanvasProps: { ...section.chordesqueCanvasProps, ...changes } })
	}

	const updateRhythmPatternOptions = (changes: Partial<SectionIR["rhythmPatternOptions"]>) => {
		onUpdate({ rhythmPatternOptions: { ...section.rhythmPatternOptions, ...changes } })
	}

	const [noteOptionsPerCell, setNoteOptionsPerCell] = useState(section.noteCanvasProps.optionsPerCell)
	const handleNoteOptionsPerCellChange = (index: number, newNoteOptions: OctavedNote[]) => {
		const newNoteOptionsPerCell = new Map([...noteOptionsPerCell.entries()])
		newNoteOptionsPerCell.set(index, newNoteOptions)
		setNoteOptionsPerCell(newNoteOptionsPerCell)
		updateNoteCanvasProps({ optionsPerCell: newNoteOptionsPerCell })
	}

	const [chordOptionsPerCell, setChordOptionsPerCell] = useState(section.chordesqueCanvasProps.optionsPerCell)
	const handleChordOptionsPerCellChange = (index: number, newChordOptions: ChordesqueIR[]) => {
		const newChordOptionsPerCell = new Map([...chordOptionsPerCell.entries()])
		newChordOptionsPerCell.set(index, newChordOptions)
		setChordOptionsPerCell(newChordOptionsPerCell)
		updateChordCanvasProps({ optionsPerCell: newChordOptionsPerCell })
	}

	const [melodyLength, tempSetMelodyLength] = useState(section.melodyLength)
	const setMelodyLength = (newMelodyLength: number) => {
		tempSetMelodyLength(newMelodyLength)
		onUpdate({ melodyLength: newMelodyLength })
	}

	const [rhythmStrategy, tempSetRhythmStrategy] = useState(section.rhythmStrategy)
	const setRhythmStrategy = (newRhythmStrategy: SectionIR["rhythmStrategy"]) => {
		tempSetRhythmStrategy(newRhythmStrategy)
		onUpdate({ rhythmStrategy: newRhythmStrategy })
	}
	const [melodyLengthStrategy, tempSetMelodyLengthStrategy] = useState(section.melodyLengthStrategy)
	const setMelodyLengthStrategy = (newMelodyLengthStrategy: SectionIR["melodyLengthStrategy"]) => {
		tempSetMelodyLengthStrategy(newMelodyLengthStrategy)
		onUpdate({ melodyLengthStrategy: newMelodyLengthStrategy })
	}
	const [minNumNotes, tempSetMinNumNotes] = useState(section.rhythmPatternOptions.minimumNumberOfNotes)
	const setMinNumNotes = (newMinNumNotes: number) => {
		tempSetMinNumNotes(newMinNumNotes)
		updateRhythmPatternOptions({ minimumNumberOfNotes: newMinNumNotes })
	}
	const [startOnNote, tempSetStartOnNote] = useState(section.rhythmPatternOptions.onlyStartOnNote)
	const setStartOnNote = (newStartOnNote: boolean) => {
		tempSetStartOnNote(newStartOnNote)
		updateRhythmPatternOptions({ onlyStartOnNote: newStartOnNote })
	}
	const [maxRestLength, tempSetMaxRestLength] = useState(section.rhythmPatternOptions.maximumRestLength)
	const setMaxRestLength = (newMaxRestLength: number) => {
		tempSetMaxRestLength(newMaxRestLength)
		updateRhythmPatternOptions({ maximumRestLength: newMaxRestLength })
	}

	const [noteConstraintSet, tempSetNoteConstraintSet] = useState(section.noteCanvasProps.constraints)
	const setNoteConstraintSet = (newNoteConstraintSet: NoteConstraintIR[]) => {
		tempSetNoteConstraintSet(newNoteConstraintSet)
		updateNoteCanvasProps({ constraints: newNoteConstraintSet })
	}
	const addNoteConstraint = (constraint: NoteConstraintIR) => {
		setNoteConstraintSet([...noteConstraintSet, constraint])
	}
	const removeNoteConstraint = (index: number) => {
		const newConstraintSet = [...noteConstraintSet]
		newConstraintSet.splice(index, 1)
		setNoteConstraintSet(newConstraintSet)
	}
	const handleNoteConstraintChange = (index: number, constraint: NoteConstraintIR) => {
		const newConstraintSet = [...noteConstraintSet]
		newConstraintSet[index] = constraint
		setNoteConstraintSet(newConstraintSet)
	}

	const [chordConstraintSet, tempSetChordConstraintSet] = useState(section.chordesqueCanvasProps.constraints)
	const setChordConstraintSet = (newChordConstraintSet: ChordConstraintIR[]) => {
		tempSetChordConstraintSet(newChordConstraintSet)
		updateChordCanvasProps({ constraints: newChordConstraintSet })
	}
	const addChordConstraint = (constraint: ChordConstraintIR) => {
		setChordConstraintSet([...chordConstraintSet, constraint])
	}
	const removeChordConstraint = (index: number) => {
		const newConstraintSet = [...chordConstraintSet]
		newConstraintSet.splice(index, 1)
		setChordConstraintSet(newConstraintSet)
	}
	const handleChordConstraintChange = (index: number, constraint: ChordConstraintIR) => {
		const newConstraintSet = [...chordConstraintSet]
		newConstraintSet[index] = constraint
		setChordConstraintSet(newConstraintSet)
	}

	const [differentMelodyKey, tempSetDifferentMelodyKey] = useState(section.useDifferentMelodyKey)
	const setDifferentMelodyKey = (newDifferentMelodyKey: boolean) => {
		tempSetDifferentMelodyKey(newDifferentMelodyKey)
		onUpdate({ useDifferentMelodyKey: newDifferentMelodyKey })
	}

	const [melodyKeyRoot, tempSetMelodyKeyRoot] = useState(section.melodyKeyRoot)
	const setMelodyKeyRoot = (newMelodyKeyRoot: Note) => {
		tempSetMelodyKeyRoot(newMelodyKeyRoot)
		onUpdate({ melodyKeyRoot: newMelodyKeyRoot })
	}

	const [melodyKeyType, tempSetMelodyKeyType] = useState(melodyKeyTypeToOption(section.melodyKeyType))
	const setMelodyKeyType = (newMelodyKeyType: SelectKeyTypeOption) => {
		if (newMelodyKeyType === null) return
		tempSetMelodyKeyType(newMelodyKeyType)
		onUpdate({ melodyKeyType: newMelodyKeyType.value })
	}

	const env = {
		noteOptionsPerCell,
		handleNoteOptionsPerCellChange,
		melodyLength,
		setMelodyLength,
		noteConstraintSet,
		addNoteConstraint,
		removeNoteConstraint,
		handleNoteConstraintChange,
		minNumNotes,
		setMinNumNotes,
		startOnNote,
		setStartOnNote,
		maxRestLength,
		setMaxRestLength,

		differentMelodyKey,
		setDifferentMelodyKey,
		melodyKeyRoot,
		setMelodyKeyRoot,
		melodyKeyType,
		setMelodyKeyType,

		chordOptionsPerCell,
		handleChordOptionsPerCellChange,
		chordConstraintSet,
		addChordConstraint,
		removeChordConstraint,
		handleChordConstraintChange,
	}

	return <SectionProvider env={env}>
		<div style={{ display: "flex", borderBottom: "1px solid grey", paddingBottom: "1em", flexDirection: "row", gap: "2em", alignItems: "end" }}>
			<div style={{ width: "15vw", display: "flex", flexDirection: "column", justifyContent: "left" }}>
				Name:
				<input type="text" value={section.name} placeholder={`Section${section.id}`} onChange={(e) => {
					onUpdate({ name: e.target.value })
				}} />
			</div>
			<div
				style={{
					...buttonStyles,
					color: "red",
					borderColor: "red",
					cursor: "pointer",
					marginLeft: "auto",
				}}
				onClick={removeSection}>
				Delete section
			</div>
		</div>
		<div style={{ display: "flex", gap: "1em" }}>
			<div style={{ flex: 1 }}>
				<MelodyKeySelector />
				<InheritedMelodyLengthSelector  strategy={melodyLengthStrategy} setStrategy={setMelodyLengthStrategy}/>
				<InheritedRhythmSettings strategy={rhythmStrategy} setStrategy={setRhythmStrategy} />
				<NeighborRules
					inputLabel="Allowed preceding sections"
					checkboxLabel="Restrict preceding sections"
					restrict={section.restrictPrecedingSections}
					setRestrict={(b) => onUpdate({ restrictPrecedingSections: b })}
					allowedSet={section.allowedPrecedingSections}
					setAllowedSet={(s) => onUpdate({ allowedPrecedingSections: s })}
				/>
				<NeighborRules
					inputLabel="Allowed following sections"
					checkboxLabel="Restrict following sections"
					restrict={section.restrictFollowingSections}
					setRestrict={(b) => onUpdate({ restrictFollowingSections: b })}
					allowedSet={section.allowedFollowingSections}
					setAllowedSet={(s) => onUpdate({ allowedFollowingSections: s })}
				/>
			</div>
			<div style={{ flex: 1 }}>
				<NoteTiles />
				<NoteConstraints />
			</div>
			<div style={{ flex: 1 }}>
				<ChordTiles />
				<ChordConstraints />
			</div>
		</div>
	</SectionProvider>

}