import { useState } from "react"
import { useAppContext } from "../AppState"
import Popup from "reactjs-popup"
import { Chord } from "../music_theory/Chord"

interface ChordTileProps {
  index: number;
  initialOptions?: string[];
}

function ChordTile({ index, initialOptions } : ChordTileProps) {
	const [input, setInput] = useState(initialOptions?.join(" ") || "")
	const [popupOpen, setPopupOpen] = useState(false)
	const { chordOptionsPerCell, setChordOptionsPerCell } = useAppContext()
	const optionsString = (!initialOptions || initialOptions.length === 0) ? "*" : initialOptions.join(" | ")

	const popup = <Popup open={popupOpen} closeOnDocumentClick={false}>
		<div className='modal'>
			<h3>Set options for chord at position {index}</h3>
			<div style={{display: "flex", gap: "0.5em"}}>
				<input type="text" onChange={e => setInput(e.target.value)} value={input} style={{flex: 1}}/>
				<img src="hint.png" title="Try 'Dm' or 'C F'" width="30px" height="30px"/> <br/>
			</div>
			<br />
			<p>Leaving this empty means allowing all chords</p>
			<button onClick={() => {
				const newOptionsPerCell = new Map(chordOptionsPerCell)
				newOptionsPerCell.set(index, Chord.parseChordsString(input))
				setChordOptionsPerCell(newOptionsPerCell)
				setPopupOpen(false)
			}}>Save</button>
			<button onClick={() => {
				setInput(initialOptions?.join(" ") || "")
				setPopupOpen(false)
			}}>Cancel</button>
		</div>
	</Popup>

	return (
		<div key={index} className='tile'>
			<button onClick={() => setPopupOpen(true)}>{optionsString}</button>
			{popup}
		</div>
	)
}

export function ChordTiles() {
	const { numChords, chordOptionsPerCell } = useAppContext()
	const arr = Array(numChords).fill(0)

	return (
		<>
			<h3>Chords</h3>
			{arr.map((_, i) => (
				<ChordTile key={i} index={i} initialOptions={chordOptionsPerCell.get(i)?.map(chord => chord.toString())} />
			))}
		</>
	)
}
