import { useAppContext } from "../AppState"
import { NumberSelector } from "./GlobalSettings"

export function RhythmSettings() {
	const {minNumNotes, setMinNumNotes, melodyLength, useRhythm, setUseRhythm, startOnNote, setStartOnNote, maxRestLength, setMaxRestLength} = useAppContext()
	return <>
		<div style={{display: "flex", justifyContent: "center", gap: "0.5em", marginTop:"2em"}}>
			<h2 style={{marginBottom:0, marginTop:0}}>Rhythm</h2>
			<input type="checkbox" checked={useRhythm} onChange={(e) => setUseRhythm(e.target.checked)}/>
		</div>
		{useRhythm && <>
			<NumberSelector value={minNumNotes} setValue={setMinNumNotes} min={1} max={melodyLength} label="Minimum number of notes"/>
			<NumberSelector value={maxRestLength} setValue={setMaxRestLength} min={1} max={16} label="Maximum rest length"/>
			<div style={{display: "flex", justifyContent: "center", gap: "0.5em"}}>
				<h3>Start on note</h3>
				<input type="checkbox" checked={startOnNote} onChange={(e) => setStartOnNote(e.target.checked)}/>
			</div>
		</>}
	</>
}