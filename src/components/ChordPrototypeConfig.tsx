import { useState } from "react"
import { Note, OctavedNote } from "../music_theory/Note"
import { ChordPrototypeIR } from "../wfc/hierarchy/prototypes"
import { NoteConstraintIR } from "../wfc/constraints/constraintUtils"
import { ChordPrototypeProvider, useAppContext } from "../AppState"
import { NoteTiles } from "./NoteTiles"
import { NoteConstraints } from "./NoteConstraints"
import { buttonStyles, selectStyles } from "../styles"
import { MelodyLengthSelector } from "./GlobalSettings"
import { ChordIR, ChordQuality, chordIRToString, stringToChordIR } from "../music_theory/Chord"
import Select from "react-select"
import { ConstantNoteSelector } from "./ConstantNoteSelector"
import { SelectOption } from "./utils"

interface ChordPrototypeConfigProps {
    prototype: ChordPrototypeIR,
	removePrototype: () => void
	onUpdate: (changes: Partial<ChordPrototypeIR>) => void
}

export function ChordPrototypeConfig({prototype, removePrototype, onUpdate}: ChordPrototypeConfigProps){
	const updateNoteCanvasProps = (changes: Partial<ChordPrototypeIR["noteCanvasProps"]>) => {
		onUpdate({noteCanvasProps: {...prototype.noteCanvasProps, ...changes}})
	}
	
	const [noteOptionsPerCell, setNoteOptionsPerCell] = useState(prototype.noteCanvasProps.optionsPerCell)
	const handleNoteOptionsPerCellChange = (index: number, newNoteOptions: OctavedNote[]) => {
		const newNoteOptionsPerCell = new Map([...noteOptionsPerCell.entries()])
		newNoteOptionsPerCell.set(index, newNoteOptions)
		setNoteOptionsPerCell(newNoteOptionsPerCell)
		updateNoteCanvasProps({optionsPerCell: newNoteOptionsPerCell})
	}

	const [chordValue, setChordValue] = useState(prototype.chord)

	const [melodyLength, tempSetMelodyLength] = useState(prototype.noteCanvasProps.size)
	const setMelodyLength = (newMelodyLength: number) => {
		tempSetMelodyLength(newMelodyLength)
		updateNoteCanvasProps({size: newMelodyLength})	
	}

	const [noteConstraintSet, tempSetNoteConstraintSet] = useState(prototype.noteCanvasProps.constraints)
	const setNoteConstraintSet = (newNoteConstraintSet: NoteConstraintIR[]) => {
		tempSetNoteConstraintSet(newNoteConstraintSet)
		updateNoteCanvasProps({constraints: newNoteConstraintSet})
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

	const env = {
		noteOptionsPerCell,
		handleNoteOptionsPerCellChange,
		melodyLength,
		setMelodyLength,
		noteConstraintSet,
		addNoteConstraint,
		removeNoteConstraint,
		handleNoteConstraintChange
	}

	return <ChordPrototypeProvider env={env}>
		<div style={{display: "flex", borderBottom: "1px solid grey", paddingBottom: "1em"}}>
			<div style={{width: "15vw", display: "flex", flexDirection: "column", justifyContent: "left"}}>
				Name:
				<input type="text" value={prototype.name} placeholder={`ChordPrototype${prototype.id}`} onChange={(e) => {
					onUpdate({name: e.target.value})
				}}/>
			</div>
			<ChordSelector value={chordValue} setValue={(c) => {
				setChordValue(c)
				onUpdate({chord: c})
			}}/>
			<div
				style={{
					...buttonStyles,
					color: "red",
					borderColor: "red",
					marginLeft: "auto",
				}}
				onClick={removePrototype}>
				Delete prototype
			</div>
		</div>
		<div style={{display: "flex", gap: "1em"}}>
			<div style={{flex: 1}}>
				<MelodyLengthSelector/>
				<NoteTiles/>
			</div>
			<NoteConstraints/>
			<div style={{flex: 1}}>
				<NeighborRules
					inputLabel="Allowed preceding chords"
					checkboxLabel="Restrict preceding chords"
					restrict={prototype.restrictPrecedingChords}
					setRestrict={(b) => onUpdate({restrictPrecedingChords: b})}
					allowedSet={prototype.allowedPrecedingChords}
					setAllowedSet={(c) => onUpdate({allowedPrecedingChords: c})}
				/>
				<NeighborRules
					inputLabel="Allowed following chords"
					checkboxLabel="Restrict following chords"
					restrict={prototype.restrictFollowingChords}
					setRestrict={(b) => onUpdate({restrictFollowingChords: b})}
					allowedSet={prototype.allowedFollowingChords}
					setAllowedSet={(c) => onUpdate({allowedFollowingChords: c})}
				/>
			</div>
		</div>
	</ChordPrototypeProvider>

}

const chordQualityOptions: [ChordQuality, {label: string, value: string}][] = [
	["major", {label: "Major", value: "major"}],
	["minor", {label: "Minor", value: "minor"}],
	["diminished", {label: "Diminished", value: "diminished"}],
	["augmented", {label: "Augmented", value: "augmented"}],
]
const chordQualityToOptionMap = new Map(chordQualityOptions)
const chordQualityToOption = (quality: ChordQuality) => chordQualityToOptionMap.get(quality)!

interface ChordSelectorProps {
	value: ChordIR,
	setValue: (c: ChordIR) => void
}

function ChordSelector({value, setValue}: ChordSelectorProps) {
	const [root, tempSetRoot] = useState(value.root)
	const [quality, tempSetQuality] = useState(chordQualityToOption(value.quality))
	const setRoot = (newRoot: Note) => {
		tempSetRoot(newRoot)
		setValue({...value, root: newRoot})
	}
	const setQuality = (newQuality: SelectOption) => {
		tempSetQuality(newQuality!)
		setValue({...value, quality: newQuality!.value as ChordQuality})
	}

	return <>
		<div style={{display:"flex", width:"20vw"}}>
			<ConstantNoteSelector placeholder={"Select a root"} value={root} setValue={setRoot} style={{flex: 1}}/>
			<Select options={chordQualityOptions.map(t => t[1])} placeholder={"Select a key type"} styles={selectStyles} value={quality} onChange={(option: SelectOption) => {setQuality(option!)}}/>
		</div>
	</>
}

interface NeighborRulesProps {
	inputLabel: string,
	checkboxLabel: string,
	restrict : boolean,
	setRestrict: (b: boolean) => void,
	allowedSet: string[],
	setAllowedSet: (c: string[]) => void,
}
function NeighborRules({inputLabel, checkboxLabel, restrict, setRestrict, allowedSet, setAllowedSet}: NeighborRulesProps) {
	const {chordPrototypes} = useAppContext()
	
	const createString = (chord: ChordIR | string) => {
		if(typeof chord === "string") return chord
		else return chordIRToString(chord)
	}
	
	const isValid = (allowedSet: (string)[]) => {
		let out = true
		allowedSet.forEach(s => {
			if(chordPrototypes.some(p => p.name === s)) return
			const chordIR = stringToChordIR(s)
			if(chordIR) return
			out = false
		})
		return out
	}
	const [valid, setValid] = useState(isValid(allowedSet))
	
	return <div style={{display: "flex", flexDirection: "column", gap: "1em"}}>
		<div style={{display: "flex", justifyContent: "center", gap: "0.5em", marginTop:"2em"}}>
			<h3 style={{marginBottom:0, marginTop:0, color: valid ? "white" : "red"}}>{checkboxLabel}</h3>
			<input type="checkbox" checked={restrict} onChange={(e) => setRestrict(e.target.checked)}/>
		</div>
		{ restrict && <>
			<input type="text" value={allowedSet.map(createString).join(" ")}
				placeholder={inputLabel} onChange={(e) => {
					const newAllowed = e.target.value.split(" ")
					setValid(isValid(newAllowed))
					setAllowedSet(newAllowed)
				}}/>
		</>}
	</div>
}