import { useState } from "react"
import { useAppContext } from "../AppState"
import { buttonStyles } from "../styles"
import { MeasureTypeInit, nameOfMeasure, MeasureIR } from "../music_theory/Rhythm"

export function RhythmPage () {
    const [chosenMeasureIndex, setChosenMeasureIndex] = useState<number | undefined>(undefined)
    const { measures, addMeasure, getNextMeasureID } = useAppContext()
    
	return <div style={{ display: "flex", gap: "1em", paddingTop: "1em" }}>
		<div style={{
			width: "10vw",
			borderRight: "1px solid grey",
			paddingRight: "1em",
			height: "70vh",
		}}>
			<button style={{ width: "inherit", marginBottom: "1em" }} onClick={() => {
				addMeasure(MeasureTypeInit(getNextMeasureID()))
				setChosenMeasureIndex(measures.length)
			}}>+</button>
            {/* <div style={{ flex: 1 }}>
                {
                    chosenMeasureIndex === undefined ? <h2>Select a section to edit on the left!</h2> :
                        < ADD RHYTHMCONFIG WITH ALL THAT SETUP
                        />
                }
            </div> */}
            {measures.map((measure, index) => {
                    const effectiveName = nameOfMeasure(measure)
                    const chosen = chosenMeasureIndex === index
                    const multipleWithSameName = measures.filter((me) => nameOfMeasure(me) === effectiveName).length > 1
                    return <div key={index}
                        style={{
                            ...buttonStyles,
                            borderColor: chosen ? "white" : "grey",
                            color: multipleWithSameName ? "red" : chosen ? "white" : "grey",
                            cursor: chosen ? "default" : "pointer",

                        }}
                        onClick={() => {
                            if (!chosen) {
                                setChosenMeasureIndex(index)
                            }
                        }
                        }>{effectiveName}</div>
                })}
        </div>
	</div>
}