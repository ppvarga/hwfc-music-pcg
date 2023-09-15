import { useState } from "react"
import { useAppContext } from "../AppState"
import { ChordPrototypeIR, ChordPrototypeInit } from "../wfc/hierarchy/prototypes"
import { ChordPrototypeConfig } from "./ChordPrototypeConfig"
import { buttonStyles } from "../styles"

export function ChordPrototypesPage() {
	const [chosenPrototypeIndex, setChosenPrototypeIndex] = useState<number | undefined>(undefined)
	const {chordPrototypes, addChordPrototype, removeChordPrototype, handleChordPrototypeChange, getNextChordPrototypeID} = useAppContext()
	
	const updatePrototype = (index: number, changes: Partial<ChordPrototypeIR>) => {
		const updatedPrototype = { ...chordPrototypes[index], ...changes }
		handleChordPrototypeChange(index, updatedPrototype)
	}

	return <div style={{display:"flex", gap:"1em", paddingTop: "1em"}}>
		<div style={{
			width: "10vw",
			borderRight: "1px solid grey",
			paddingRight: "1em",
			height: "70vh",
		}}>
			{chordPrototypes.map((prototype, index) => {
				const effectiveName = prototype.name === "" ? `ChordPrototype${prototype.id}` : prototype.name
				const chosen = chosenPrototypeIndex === index
				const multipleWithSameName = chordPrototypes.filter((proto2) => proto2.name === effectiveName).length > 1
				return <div key={index} 
					style={{
						...buttonStyles,
						borderColor: chosen ? "white" : "grey",
						color: multipleWithSameName ? "red" : chosen ? "white" : "grey",
						cursor: chosen ? "default" : "pointer",
						
					}} 
					onClick={() => {
						if(!chosen) {
							setChosenPrototypeIndex(index)
						}
					}
					}>{effectiveName}</div>
			})}
			<button style={{width: "inherit"}} onClick={() => {
				addChordPrototype(ChordPrototypeInit(getNextChordPrototypeID()))
				setChosenPrototypeIndex(chordPrototypes.length)
			}}>+</button>
		</div>
		<div style={{ flex: 1 }}>
			{
				chosenPrototypeIndex === undefined ? <h2>Select a prototype to edit on the left!</h2> :
					<ChordPrototypeConfig 
						key={chosenPrototypeIndex}
						prototype={chordPrototypes[chosenPrototypeIndex]}
						onUpdate={(changes) => {
							updatePrototype(chosenPrototypeIndex, changes)
						}}
						removePrototype={() => {
							setChosenPrototypeIndex(undefined)
							removeChordPrototype(chosenPrototypeIndex)
						}}
					/>
			}
		</div>
	</div>
}