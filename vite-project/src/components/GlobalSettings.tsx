import { useAppContext } from "../AppState"
import { Note } from "../music_theory/Note"
import Select from "react-select"
import { selectStyles } from "../styles"
import { SelectNoteOption, SelectOption } from "./utils"

export function GlobalSettings() {

	const {numChords, setNumChords, numNotesPerChord, setNumNotesPerChord} = useAppContext()
	return <>
		<h2>Global settings</h2>
		<h3>Number of chords</h3>
		<input type="number" value={numChords} onChange={(e) => setNumChords(parseInt(e.target.value))} min={1} max={16}/>
		<h3>Number of notes per chord</h3>
		<input type="number" value={numNotesPerChord} onChange={(e) => setNumNotesPerChord(parseInt(e.target.value))} min={1} max={16}/>
		<GlobalKeySelector/>
	</>
}

export const noteOptions = [
	{label: "C", value: Note.C},
	{label: "C#", value: Note.CSharp},
	{label: "D", value: Note.D},
	{label: "D#", value: Note.DSharp},
	{label: "E", value: Note.E},
	{label: "F", value: Note.F},
	{label: "F#", value: Note.FSharp},
	{label: "G", value: Note.G},
	{label: "G#", value: Note.GSharp},
	{label: "A", value: Note.A},
	{label: "A#", value: Note.ASharp},
	{label: "B", value: Note.B},
]

const keyTypeOptions = [
	{label: "Major", value: "major"},
	{label: "Minor", value: "minor"},
]

function GlobalKeySelector() {
	const {keyRoot, setKeyRoot, keyType, setKeyType} = useAppContext()
	return <>
		<h3>Key</h3>
		<ConstantNoteSelector placeholder={"Select a key root"} value={keyRoot} setValue={setKeyRoot}/>
		<Select options={keyTypeOptions} placeholder={"Select a key type"} styles={selectStyles} value={keyType} onChange={(option: SelectOption) => {setKeyType(option)}}/>
	</>
}

interface ConstantNoteSelectorProps {
	placeholder?: string
	value: SelectNoteOption
	setValue: (_: SelectNoteOption) => void
	onChange?: (_: SelectNoteOption) => void
}

export function ConstantNoteSelector({placeholder, value, setValue, onChange}: ConstantNoteSelectorProps) {
	const onChangeUsed = (onChange === undefined ? 
		((option: SelectNoteOption) => {setValue(option)}) : 
		((option: SelectNoteOption) => {setValue(option); onChange(option)}))

	return <Select options={noteOptions} placeholder={placeholder} styles={selectStyles} value={value} onChange={onChangeUsed}/>
}