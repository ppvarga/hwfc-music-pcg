import { useState } from "react"
import { useAppContext } from "../AppState"
import Popup from "reactjs-popup"
import { Chord } from "../music_theory/Chord"

interface ChordTileProps {
  index: number;
  initialOptions?: string[];
}

function ChordTile({ index, initialOptions } : ChordTileProps) {
	const [popupOpen, setPopupOpen] = useState(false)
	const optionsString = (!initialOptions || initialOptions.length === 0) ? "*" : initialOptions.join(" | ")

	return (
		<div key={index} className='tile'>
			<button onClick={() => setPopupOpen(true)}>{optionsString}</button>
			<ChordValuesPopup popupOpen={popupOpen} index={index} setPopupOpen={setPopupOpen} initialOptions={initialOptions} />
		</div>
	)
}

interface ChordValuesInputProps {
	value: string
	setValue: (s: string) => void
}

export function ChordValuesInput({value, setValue}: ChordValuesInputProps) {
	return <div style={{ display: "flex", gap: "0.5em" }}>
		<input type="text" onChange={e => setValue(e.target.value)} value={value} style={{ flex: 1 }} />
		<img src="hint.png" title="Try 'Dm' or 'C F'" width="30px" height="30px" />
	</div>
}

interface ChordValuesPopupProps {
	popupOpen: boolean
	index: number
	setPopupOpen: (b: boolean) => void
	initialOptions: string[] | undefined
}
function ChordValuesPopup({popupOpen, index, setPopupOpen, initialOptions}: ChordValuesPopupProps) {
	const [input, setInput] = useState(initialOptions?.join(" ") || "")
	const {handleChordOptionsPerCellChange} = useAppContext()
	const chords = Chord.parseChordsString(input)

	return <Popup open={popupOpen} closeOnDocumentClick={false}>
		<div className='modal'>
			<h3>Set options for chord at position {index}</h3>
			<ChordValuesInput value={input} setValue={setInput} />
			<br />
			<p>Leaving this empty means allowing all chords</p>
			<button disabled={chords === undefined}
				onClick={() => {
					handleChordOptionsPerCellChange(index, chords as Chord[])
					setPopupOpen(false)
				} }>Save</button>
			<button onClick={() => {
				setInput(initialOptions?.join(" ") || "")
				setPopupOpen(false)
			} }>Cancel</button>
		</div>
	</Popup>
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
