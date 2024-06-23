import { useEffect, useRef, useState } from "react";
import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from "@air/react-drag-to-select";
import "./RhythmBox.css"
import { useAppContext } from "../AppState";
import { RhythmUnit } from "../music_theory/Rhythm";
import { StringDropownSelector } from "./GlobalSettings"

interface RhythmBoxProps {
	numberOfUnits: number
}

export function RhythmBox ({numberOfUnits}: RhythmBoxProps) {
  const [selectionBox, setSelectionBox] = useState<Box>();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [selectableItems, setSelectableItems] = useState<Box[]>([]);
  const elementsContainerRef = useRef<HTMLDivElement | null>(null);
  const {upper, lower, rhythmPattern, setRhythmPattern} = useAppContext()
  const [currentNoteColorIndex, setCurrentNoteColorIndex]  = useState<number>(0)
  const [currentRestColorIndex, setCurrentRestColorIndex]  = useState<number>(0)
  const [type, setType] = useState<string | undefined>("note")
  
  const { DragSelection } = useSelectionContainer({
    eventsElement: document.getElementById("root"),
    onSelectionChange: (box) => {
        const scrollAwareBox: Box = {
            ...box,
            top: box.top + window.scrollY,
            left: box.left + window.scrollX
        }

        setSelectionBox(scrollAwareBox);
        const indexesToSelect: number[] = [];
        selectableItems.forEach((item, index) => {
            if (boxesIntersect(scrollAwareBox, item)) {
                indexesToSelect.push(index)
            }
        })

      setSelectedIndexes(indexesToSelect);
    },
    onSelectionStart: () => {
      console.log("OnSelectionStart");
      console.log("rhythmpattern:")
      console.log(rhythmPattern)
    },
    onSelectionEnd: () => {
        console.log("OnSelectionEnd")
        if (selectedIndexes.length != 0) {
            console.log("selected indexes")
            console.log(selectedIndexes)
            let from = selectedIndexes[0] / 4
            let to = (selectedIndexes[selectedIndexes.length-1] + 1) / 4
            addToRhythm(from, to)
            highlightBoxes()
        }
        setSelectedIndexes([])
    },
    selectionProps: {
      style: {
        visibility: "hidden"
      }
    },
    isEnabled: true
  })

  useEffect(() => {
    resetBoxes()
    console.log("sdfaSJFKSDHFLDSF")
    }, [lower, upper])

  const addToRhythm = (from: number, to: number) => {
    let start = 0
    let newPattern = rhythmPattern
    let startIndex = -1
    let startPoint = -1
    let endIndex = -1
    let endPoint = -1
    let startType = undefined
    let endType = undefined
    
    for (let i = 0; i < newPattern.length; i++) {
        let unit = newPattern[i]
        let end = start + unit.duration
        
        if (startIndex == -1 && start <= from && from <= end) {
            startIndex = i
            startPoint = start
            startType = unit.type
        }
        if (startIndex != -1 && start <= to && to <= end) {
            endIndex = i
            endPoint = end
            endType = unit.type
            break
        }
        start = end
    }

    let first = {type: startType, duration: (from - startPoint)} as RhythmUnit
    let second = {type: type, duration: (to - from)} as RhythmUnit
    let third = {type: endType, duration: (endPoint - to)} as RhythmUnit

    if (first.duration != 0){
        newPattern.splice(startIndex, (endIndex - startIndex + 1), first)
        newPattern.splice(startIndex+1, 0, second)
        if (third.duration != 0)
            newPattern.splice(startIndex+2, 0, third)
    }
    else{
        newPattern.splice(startIndex, (endIndex - startIndex + 1), second)
        if (third.duration != 0)
            newPattern.splice(startIndex+1, 0, third)
    }
    setRhythmPattern(newPattern)
  }

  const highlightBoxes = () => {
    if (elementsContainerRef.current) {
        let boxes = Array.from(elementsContainerRef.current.children) as Array<HTMLElement>
        let color = ""
        if (type != undefined) 
            color = provideHighlightColor()
        boxes.forEach((box, index) => {
            if (selectedIndexes.indexOf(index) >= 0) {
                box.style.backgroundColor = color
            }
        })
    }
  }
  const resetBoxes = () => {
    if (elementsContainerRef.current) {
        let boxes = Array.from(elementsContainerRef.current.children) as Array<HTMLElement>
        let color = ""
        boxes.forEach((box) => {
            box.style.backgroundColor = color
        })
    }
  }

  const provideHighlightColor = () => {
    if (type == "note") {
        let colors = [
            "#71a0ff",
            "#7da9ff",
            "#89b1ff",
            "#95b9ff",
            "#a1c2ff",
            "#adcaff"
       
        ]
        const res = colors[currentNoteColorIndex]
        if (currentNoteColorIndex == colors.length-1)
            setCurrentNoteColorIndex(0)
        else
            setCurrentNoteColorIndex(currentNoteColorIndex + 1)
        return res
    } else {
        let colors = [
            "#000000",
            "#111111",
            "#1b1b1b",
            "#252525",
            "#303030"

        ]
        const res = colors[currentRestColorIndex]
        if (currentRestColorIndex == colors.length-1)
            setCurrentRestColorIndex(0)
        else
            setCurrentRestColorIndex(currentRestColorIndex + 1)
        return res
    }
  }

  const updateSelectableItems = () => {
    if (elementsContainerRef.current) {
      let temp: Box[] = []
      Array.from(elementsContainerRef.current.children).forEach((item) => {
        const { left, top, width, height } = item.getBoundingClientRect()
        temp.push({
          left,
          top,
          width,
          height,
        })
      })
      setSelectableItems(temp)
    }
  }

  useEffect(() => {
    updateSelectableItems()
  }, [numberOfUnits, elementsContainerRef])

  useEffect(() => {
    window.addEventListener("resize", updateSelectableItems);
    return () => {
      window.removeEventListener("resize", updateSelectableItems);
    }
  }, [])

  const typeOptions = [
	{ label: "note", value: "note" as const },
	{ label: "rest", value: "rest" as const },
	{ label: "delete", value: undefined }
]

  return (
    <div style={{
        display:"flex",
        flexDirection:"row",
        alignContent:"center",
        justifyContent:"center",
        marginLeft:"1em",
        paddingLeft:"1em",
        background:"rgba(255,255,255,0.3)"}}>
        <div style={{width:"7em", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <StringDropownSelector value={type} setValue={setType} options={typeOptions}></StringDropownSelector> 
        </div>
        <div id="rhythmcontainer" className="container">
            <DragSelection/>
            <div
                id="elements-container"
                className="elements-container"
                ref={elementsContainerRef}
            >
                {Array.from({ length: numberOfUnits }, (_, i) => (
                <div
                    data-testid={`grid-cell-${i}`}
                    key={i}
                    className={`element
                    ${(Math.floor(i/(16/lower)) % 2 == 0)?"even":"odd"}
                    ${selectedIndexes.includes(i) ? "selected" : ""}
                    `}
                />
                ))}
            </div>
        </div>
    </div>
  );
}
