import { useAppContext } from "../AppState"

export function RhythmSettings() {
	const {minNumNotes, setMinNumNotes, melodyLength, useRhythm, setUseRhythm, startOnNote, setStartOnNote, maxRestLength, setMaxRestLength} = useAppContext()
	return <>
		<div style={{display: "flex", justifyContent: "center", gap: "0.5em", marginTop:"2em"}}>
			<h2 style={{marginBottom:0, marginTop:0}}>Rhythm</h2>
			<input type="checkbox" checked={useRhythm} onChange={(e) => setUseRhythm(e.target.checked)}/>
		</div>
		{useRhythm && <>
			<h3>Minimum number of notes</h3>
			<input type="number" value={minNumNotes} onChange={(e) => setMinNumNotes(parseInt(e.target.value))} min={1} max={melodyLength}/>
			<h3>Maximum rest length</h3>
			<input type="number" value={maxRestLength} onChange={(e) => setMaxRestLength(parseInt(e.target.value))} min={0} max={melodyLength}/>
			<div style={{display: "flex", justifyContent: "center", gap: "0.5em"}}>
				<h3>Start on note</h3>
				<input type="checkbox" checked={startOnNote} onChange={(e) => setStartOnNote(e.target.checked)}/>
			</div>
		</>}
	</>
}