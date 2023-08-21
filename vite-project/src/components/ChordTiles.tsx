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

	return (
		<div key={index} className='tile'>
			<button onClick={() => setPopupOpen(true)}>{optionsString}</button>
			<Popup open={popupOpen} closeOnDocumentClick={false}>
				<div className='modal'>
					<h3>Set options for chord at position {index}</h3>
					<input type="text" onChange={e => setInput(e.target.value)} value={input} />
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
