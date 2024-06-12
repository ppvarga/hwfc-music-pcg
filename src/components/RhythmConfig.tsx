import { useAppContext } from "../AppState"
import Select from "react-select"
import { selectStyles } from "../styles"
import { RhythmUnit, MeasureTypeInit, generateRhythmPattern, MeasureIR} from "../music_theory/Rhythm"
import { useState } from "react"

interface RhythmConfigProps {
    chosenMeasureIndex: number | undefined
}

export function RhythmConfig ({chosenMeasureIndex}: RhythmConfigProps) {
    const { customMeasures: measures, updateMeasure } = useAppContext()
    const [current, setCurrent] = useState<MeasureIR>(measures[chosenMeasureIndex!])
    const setUpper = (upper: number) => {
        setCurrent({...current, signatureUpper:upper})
    }
    const setLower = (lower: number) => {
        setCurrent({...current, signatureLower:lower})
    }

    const notes = {
        "2": "𝅗𝅥", // half note
        "1.5": "𝅘𝅥.", // quarter note dotted
        "1": "𝅘𝅥", // quarter note
        "0.75": "𝅘𝅥𝅮.", // eighth note dotted
        "0.5": "𝅘𝅥𝅮", // eighth note
        "0.375": "𝅘𝅥𝅯.", // sixteenth note dotted
        "0.25": "𝅘𝅥𝅯", // sixteenth note
    }
    const rests = {
        "2": "𝄼", // half note
        "1": "𝄽", // quarter note
        "0.5": "𝄾", // eighth note
        "0.25": "𝄿", // sixteenth note 
    }

    const lowerOptions = [
        { label: "2", value: 2 as const },
        { label: "4", value: 4 as const },
        { label: "8", value: 8 as const },
        { label: "16", value: 16 as const }
    ]

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

    type SelectSignature = {
        value: number
        label: string
    } | null

    function rhythmUnitToSymbol(rhythmUnit: RhythmUnit): string {

        const durationString = (rhythmUnit.duration).toString()

        if (rhythmUnit.type === "rest") {
            return rests[durationString as keyof typeof rests] || (durationString + "-rest")
        }
        
        return notes[durationString as keyof typeof notes] || (durationString)
    }

    return <div style={{ display: "flex", paddingBottom: "1em", flexDirection: "row", gap: "2em", alignItems: "center" }}>
        <div style={{display: "flex",
            justifyContent: "space-around",
            gap: "0.5em",
            padding: "0.5em",
            marginBottom: "1em",
            border: "1px solid",
            width: "25em",
            borderRadius: "0.5em",
            borderColor: "white",
            backgroundColor: "white",}}>
        
            {chosenMeasureIndex == undefined ? <div></div> :
                measures[chosenMeasureIndex]?.notes.map((note) => (
                <div style={{color:"black", fontSize:"2em"}}>
                    {rhythmUnitToSymbol(note)}
                </div>
            ))}
        </div>  
        <div style={{ display: "flex", flexDirection: "column", alignItems:"center", width:"10em" }}>
            <h3>Time Signature</h3>
            <Select
            options={upperOptions}
            placeholder={4}
            styles={selectStyles}
            value={{ label: current.signatureUpper.toString(), value: current.signatureUpper } as SelectSignature}
            onChange={(option: SelectSignature) => {
                setUpper(option!.value)
            }} />
            <Select
            options={lowerOptions}
            placeholder={4}
            styles={selectStyles}
            value={{ label: current.signatureLower.toString(), value: current.signatureLower } as SelectSignature}
            onChange={(option: SelectSignature) => {
                setLower(option!.value)
            }} />
        </div>


        <button style={{ width: "inherit", marginBottom: "1em" }} onClick={() => {
                    const mes = current
                    updateMeasure(chosenMeasureIndex!, {
                        id:mes.id,
                        signatureUpper: mes.signatureUpper,
                        signatureLower: mes.signatureLower,
                        name: "",
                        notes: generateRhythmPattern(mes.signatureUpper, mes.signatureLower, 5)
                    })
                    
                }}>Generate Random</button>
        
    </div>
}