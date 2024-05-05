import Select from "react-select"
import { useAppContext } from "../AppState"
import { selectStyles } from "../styles"

export function NumberOfInstruments() {

    const { numInstruments, setNumInstruments } = useAppContext()
    const options = [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
    ]

    return (
        <>
            <h3>Number of instruments</h3>
            <Select 
                options={options}
                value={options[numInstruments - 1]}
                placeholder={numInstruments}
                onChange={(option) => !option ? setNumInstruments(1) : setNumInstruments(option.value)}
                styles={selectStyles}
            />
        </>
    )
}