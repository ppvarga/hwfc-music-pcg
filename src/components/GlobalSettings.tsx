import { useAppContext } from "../AppState"
import { Note } from "../music_theory/Note"
import Select from "react-select"
import { selectStyles } from "../styles"
import { SelectKeyTypeOption, SelectOption } from "./utils"
import { ConstantNoteSelector } from "./ConstantNoteSelector"
import { RhythmSettings } from "./RhythmSettings"

export function GlobalSettings() {

	const {numChords, setNumChords,} = useAppContext()
	return <div className="main-column">
		<h2>Global settings</h2>
		<NumberSelector value={numChords} setValue={setNumChords} min={1} max={16} label="Number of chords"/>
		<MelodyLengthSelector/>
		<GlobalKeySelector/>
		<MelodyKeySelector/>
		<RhythmSettings/>
	</div>
}

export function MelodyLengthSelector() {
	const {melodyLength, setMelodyLength} = useAppContext()
	return <>
		<NumberSelector value={melodyLength} setValue={setMelodyLength} min={1} max={16} label="Melody length"/>
	</>
}

interface NumberSelectorProps {
	value: number
	setValue: (value: number) => void
	min: number
	max: number
	label?: string
}

export function NumberSelector({value, setValue, min, max, label}: NumberSelectorProps) {
	return <div style={{display: "flex", alignItems: "center", padding: "1em",}}>
		{label && <h3 style={{margin: 0}}>{label}:</h3>}
		<div style={{display: "flex", gap:"0.5em", flexDirection: "row", marginLeft: "auto", alignItems: "center", paddingLeft: "0.5em"}}>
			<button onClick={() => setValue(Math.max(min, value - 1))}>-</button>
			<h3 style={{margin: 0}}>{value}</h3>
			<button onClick={() => setValue(Math.min(max, value + 1))}>+</button>
		</div>
	</div>

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

const melodyKeyTypeOptions = [
	{label: "Major", value: "major" as const},
	{label: "Minor", value: "minor" as const},
	{label: "Blues", value: "blues" as const},
	{label: "Major Pentatonic", value: "major_pentatonic" as const},
	{label: "Minor Pentatonic", value: "minor_pentatonic" as const},
	{label: "Harmonic Minor", value: "harmonic_minor" as const},
	{label: "Melodic Minor", value: "melodic_minor" as const},
	{label: "Diminished", value: "diminished" as const},
	{label: "Whole Tone", value: "whole_tone" as const},
]

export const melodyKeyTypeToOption = (keyType: MusicalKeyType | undefined) => {
	const result = melodyKeyTypeOptions.find(option => option.value === keyType)
	if(result === undefined) return null
	return result
}

export type MusicalKeyType = typeof melodyKeyTypeOptions[number]["value"]

function GlobalKeySelector() {
	const {keyRoot, setKeyRoot, keyType, setKeyType} = useAppContext()
	return <>
		<h3>Key</h3>
		<div style={{display:"flex", flexDirection:"column"}}>
			<div style={{display:"flex", flexDirection:"row"}}>
				<div style={{width:"6em"}}>
					<ConstantNoteSelector placeholder={"Select a key root"} value={keyRoot} setValue={setKeyRoot} style={{flex: 1}}/>
				</div>
				<Select options={keyTypeOptions} placeholder={"Select a key type"} styles={selectStyles} value={keyType} onChange={(option: SelectOption) => {setKeyType(option as SelectKeyTypeOption)}}/>
			</div>
			
		</div>
	</>
}

export function MelodyKeySelector() {
	const {melodyKeyRoot, setMelodyKeyRoot, melodyKeyType, setMelodyKeyType, differentMelodyKey, setDifferentMelodyKey} = useAppContext()

	return <div>
		<div style={{display: "flex", flexDirection:"row", gap:"1em", justifyContent:"center"}}>
			<h4>Use different key for melody</h4>
			<input type="checkbox" checked={differentMelodyKey} onChange={(e) => setDifferentMelodyKey(e.target.checked)}/>
		</div>
		{differentMelodyKey && <div style={{display:"flex", flexDirection:"row"}}>
			<div style={{width:"6em"}}>
				<ConstantNoteSelector placeholder={"Select a key root"} value={melodyKeyRoot} setValue={setMelodyKeyRoot} style={{flex: 1}}/>
			</div>
			<Select options={melodyKeyTypeOptions} placeholder={"Select a key type"} styles={selectStyles} value={melodyKeyType} onChange={(option: SelectOption) => {setMelodyKeyType(option as SelectKeyTypeOption)}}/>
		</div>}													
	</div>
}

