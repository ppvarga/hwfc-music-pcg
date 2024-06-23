import { useEffect } from "react"
import { useAppContext } from "../AppState"
import { StrictDropownSelector } from "./GlobalSettings"
import { RhythmBox } from "./RhythmBox"
import { H2tooltip } from "./tooltips"

export function RhythmSettings() {
	const { useRhythm, setUseRhythm } = useAppContext()
	return <>
		<div style={{ display: "flex", justifyContent: "center", gap: "0.5em"}}>
			<H2tooltip title="Rhythm" hint="Set the options for rhythm."/>
			<input 
			style={{alignSelf:"center"}}	
			type="checkbox" checked={useRhythm} onChange={(e) => setUseRhythm(e.target.checked)} />
		</div>
		{useRhythm && <RhythmSettingsInner />}
	</>
}

const upperOptions = [
	{ label: "2", value: 2 as const },
	{ label: "3", value: 3 as const },
	{ label: "4", value: 4 as const },
	{ label: "5", value: 5 as const },
	{ label: "6", value: 6 as const },
	{ label: "7", value: 7 as const },
	{ label: "8", value: 8 as const },
	{ label: "9", value: 9 as const },
	{ label: "10", value: 10 as const },
	{ label: "11", value: 11 as const },
	{ label: "12", value: 12 as const }
]

const lowerOptions = [
	{ label: "2", value: 2 as const },
	{ label: "4", value: 4 as const },
	{ label: "8", value: 8 as const },
	{ label: "16", value: 16 as const }
]


function RhythmSettingsInner() {
	const { customMeasures: measures,
		minNumNotes,
		setMinNumNotes,
		melodyLength,
		startOnNote,
		setStartOnNote,
		maxRestLength,
		setMaxRestLength,
		upper,
		lower,
		setUpper,
		setLower,
		setRhythmPattern
	 } = useAppContext()

	const boxLength = () => {
		return 16 * upper/lower
	}

	useEffect(() => {
		if (minNumNotes > melodyLength) setMinNumNotes(melodyLength)
	}, [melodyLength])

	useEffect(() => {
		setRhythmPattern([{type:undefined, duration:(boxLength()/4)}])
	}, [upper, lower])

	return <>
		<div style={{display:"flex", flexDirection:"row", justifyContent:"center", alignContent:"center", marginBottom:"1em"}}>
            <h3 style={{marginRight:"1em"}}>Time Signature</h3>
			<div style={{display:"flex", flexDirection:"column", width:"6em", flexWrap:"wrap", justifyContent:"space-between"}}>
				<StrictDropownSelector value={upper} setValue={setUpper} options={upperOptions}></StrictDropownSelector>
				<StrictDropownSelector value={lower} setValue={setLower} options={lowerOptions}></StrictDropownSelector>
			</div>
        </div>
		<RhythmBox numberOfUnits={boxLength()}></RhythmBox>
	</>
}

export type RhythmStrategy = "Inherit" | "On" | "Off"
interface InheritedRhythmSettingsProps {
	strategy: RhythmStrategy,
	setStrategy: (s: RhythmStrategy) => void,
}
export function InheritedRhythmSettings({ strategy, setStrategy }: InheritedRhythmSettingsProps) {

	const toggleStrategy = () => {
		if (strategy === "Inherit") setStrategy("On")
		else if (strategy === "On") setStrategy("Off")
		else setStrategy("Inherit")
	}

	return <>
		<div style={{ display: "flex", justifyContent: "center", alignItems:"center", gap: "0.5em", marginTop: "2em" }}>
			<h2 style={{ marginBottom: 0, marginTop: 0 }}>Rhythm</h2>
			<button onClick={toggleStrategy}>{strategy}</button>
		</div>
		{strategy === "On" && <RhythmSettingsInner />}
	</>
}