import { useAppContext } from "../AppState"
import { RhythmUnit, MeasureTypeInit, generateRhythmPattern, MeasureIR} from "../music_theory/Rhythm"

interface RhythmConfigProps {
    chosenMeasureIndex: number | undefined
}

export function RhythmConfig ({chosenMeasureIndex}: RhythmConfigProps) {
    const { measures, updateMeasure } = useAppContext()

    const notes = {
        "0.5": "𝅗𝅥", // half note
        "0.25": "𝅘𝅥", // quarter note
        "0.375": "𝅘𝅥𝅮𝅭", // eighth note triplet
        "0.125": "𝅘𝅥𝅮", // eighth note
        "0.1875": "𝅘𝅥𝅯𝅭", // sixteenth note triplet
        "0.0625": "𝅘𝅥𝅯", // sixteenth note
        "3/32": "𝅘𝅥𝅰", // thirty-second note triplet
    }
    const rests = {
        "0.5": "𝄼", // half note
        "0.25": "𝄽", // quarter note
        "0.125": "𝄾", // eighth note
        "0.0625": "𝄿", // sixteenth note 
    }
    
    function rhythmUnitToSymbol(upper:number, lower:number, rhythmUnit: RhythmUnit): string {

        const durationString = (rhythmUnit.duration/upper).toString()
        console.log("note is " + rhythmUnit.duration + " string is " + durationString)

        if (rhythmUnit.type === "rest") {
            return rests[durationString as keyof typeof rests] || "0"
        }
        
        return notes[durationString as keyof typeof notes] || "0"
    }

    return <div style={{ display: "flex", borderBottom: "1px solid grey", paddingBottom: "1em", flexDirection: "row", gap: "2em", alignItems: "end" }}>
        <div style={{display: "flex",
            gap: "0.5em",
            padding: "0.5em",
            marginBottom: "1em",
            border: "1px solid",
            borderRadius: "0.5em",
            borderColor: "white",
            backgroundColor: "white"}}>
        
            {chosenMeasureIndex == undefined ? <div></div> :
                measures[chosenMeasureIndex]?.notes.map((note) => (
                <div style={{color:"black", fontSize:"2em"}}>
                    {rhythmUnitToSymbol(measures[chosenMeasureIndex].signatureUpper, measures[chosenMeasureIndex].signatureLower, note)}
                </div>
            ))}
        </div>
        <button style={{ width: "inherit", marginBottom: "1em" }} onClick={() => {
                    const mes = measures[chosenMeasureIndex!]
                    updateMeasure(chosenMeasureIndex!, {
                        id:mes.id,
                        signatureUpper: mes.signatureUpper,
                        signatureLower: mes.signatureLower,
                        name: "",
                        notes: generateRhythmPattern(4, 4, 5)
                    })
                    
                }}>+</button>
        <div style={{ width: "15vw", display: "flex", flexDirection: "column", justifyContent: "left" }}>
        </div>
    </div>
}