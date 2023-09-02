import { useState } from "react"
import Popup from "reactjs-popup"
import { useAppContext } from "../AppState"
import { OctavedNote } from "../music_theory/Note"

interface NoteTileProps {
  index: number
  initialOptions?: string[]
}

function NoteTile({index, initialOptions} : NoteTileProps) {
	const [input, setInput] = useState(initialOptions?.join(" ") || "")
	const [popupOpen, setPopupOpen] = useState(false)
	const {noteOptionsPerCell, setNoteOptionsPerCell} = useAppContext()
	const optionsString = (!initialOptions || initialOptions.length === 0) ? "*" : initialOptions.join(" | ")

	return <div key={index} className='tile'>
		<button onClick={() => setPopupOpen(true)}>{optionsString}</button>
		<Popup open={popupOpen} closeOnDocumentClick={false}>
			<div className='modal'>
				<h3>Set options for note at position {index}</h3>
				<div style={{display: "flex", gap: "0.5em"}}>
					<input type="text" onChange={e => setInput(e.target.value)} value={input} style={{flex: 1}}/>
					<img src="src\assets\hint.png" title="Try 'C5' or 'E5 F5'" width="30px" height="30px"/> <br/>
				</div>
				<br/>
				<p>Leaving this empty means allowing all notes</p>
				<button onClick={() => {
					const newOptionsPerCell = new Map(noteOptionsPerCell)
					newOptionsPerCell.set(index, OctavedNote.parseMultiple(input))
					setNoteOptionsPerCell(newOptionsPerCell)
					setPopupOpen(false)
				}}>Save</button>
				<button onClick={() => {
					setInput(initialOptions?.join(" ") || "")
					setPopupOpen(false)
				}}>Cancel</button>
			</div>
		</Popup>
	</div>
}

export function NoteTiles() {
	const {melodyLength, noteOptionsPerCell} = useAppContext()
	const arr = Array(melodyLength).fill(0)

	return <>
		<h3>Notes</h3>
		{arr.map((_, i) => <NoteTile key={i} index={i} initialOptions={noteOptionsPerCell.get(i)?.map(note => note.toString())}/>)}
	</>
}