import Select from "react-select";
import { useAppContext } from "../AppState";
import { selectStyles } from "../styles";

export function InstrumentSelector() {
    const { numInstruments, selectedInstrument, setSelectedInstrument } = useAppContext()

    const options = []
    for (let i = 1; i <= numInstruments; i++) {
        options.push({ value: i, label: i.toString() })
    }

    return (
        <>
            <h2>Instrument</h2>
            <Select 
                options={options}
                value={options[selectedInstrument - 1]}
                placeholder={"Select an instrument..."}
                onChange={(option) => option ? setSelectedInstrument(option.value) : setSelectedInstrument(1)}
                styles={selectStyles}
            />
        </>
    )
}