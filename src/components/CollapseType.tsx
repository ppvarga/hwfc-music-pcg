import Select from "react-select"
import { useAppContext } from "../AppState"
import { selectStyles } from "../styles"

export type CollapseType = "Naive collapse" | "Random collapse" | "Random k collapse" | "Jam collapse"

export function CollapseType() {

    const { collapseType, setCollapseType, collapseTypeK, setCollapseTypeK, melodyLength } = useAppContext()

    const collapseTypeOptions: { value: CollapseType, label: CollapseType }[] = [
        { value: "Naive collapse", label: "Naive collapse" },
        { value: "Random collapse", label: "Random collapse" },
        { value: "Random k collapse", label: "Random k collapse" },
        { value: "Jam collapse", label: "Jam collapse" },
    ]

    const kOptions = []
    for (let i = 1; i <= melodyLength; i++) {
        kOptions.push({ value: i, label: i.toString() })
    }
    

    return (
        <>
            <h3>Collapse algorithm</h3>
            <Select 
                options={collapseTypeOptions}
                value={{ value: collapseType, label: collapseType }}
                placeholder={"Set the collapsing algorithm to be used"}
                onChange={(option) => { 
                    if (option) {
                        setCollapseType(option.value) 
                        if (collapseType == "Naive collapse" || collapseType == "Random collapse") {
                            setCollapseTypeK(undefined)
                        }
                    } else {
                        setCollapseType("Naive collapse")
                    }  
                }}
                styles={selectStyles}
            />
            {
                collapseType == "Random k collapse" || collapseType == "Jam collapse" ? 
                (<Select 
                    options={kOptions}
                    value={collapseTypeK ? kOptions[collapseTypeK - 1] : undefined}
                    placeholder={"Select a k..."}
                    onChange={(option) => option ? setCollapseTypeK(option.value) : setCollapseTypeK(undefined)}
                    styles={selectStyles}
                />) : <></>
            }
        </>
    )
}
