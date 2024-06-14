import { useEffect, useRef, useState } from "react";
import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from "@air/react-drag-to-select";
import "./RhythmBox.css"

export function RhythmBox () {
  const [selectionBox, setSelectionBox] = useState<Box>();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const selectableItems = useRef<Box[]>([]);
  const elementsContainerRef = useRef<HTMLDivElement | null>(null);

  
  const { DragSelection } = useSelectionContainer({
    eventsElement: document.getElementById("root"),
    onSelectionChange: (box) => {
        const boxey = document.getElementById("rhythmcontainer")
        const x = boxey?.scrollLeft || 0
        const y = window.scrollY - (boxey?.getBoundingClientRect().top || 0)
        // console.log("boxtop: " + box.top)
        // console.log("windowtop: " + window.scrollY)
        // console.log("containertop: " + boxey?.getBoundingClientRect().top)
        // console.log("calcs: " + y)
        const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
        }

        const checkSelect = (box1: Box, box2: Box) => {
            return (box1.top + box1.height) > box2.top 
                && (box1.left + box1.width) > box2.left 
                && box1.top < (box2.top + box2.height)
                && box1.left < (box2.left + box2.width)
        }

        setSelectionBox(scrollAwareBox);
        const indexesToSelect: number[] = [];
        
        selectableItems.current.forEach((item, index) => {
            console.log(scrollAwareBox)
            console.log(item)
            if (checkSelect(scrollAwareBox, item)) {
                console.log("boxes INTERSECT YES")
                indexesToSelect.push(index)
            }
        })
        console.log("selectable items:")
        console.log(selectableItems)
        console.log(indexesToSelect)

      setSelectedIndexes(indexesToSelect);
    },
    onSelectionStart: () => {
      console.log("OnSelectionStart");
    },
    onSelectionEnd: () => console.log("OnSelectionEnd"),
    selectionProps: {
      style: {
        border: "2px dashed purple",
        borderRadius: 4,
        backgroundColor: "brown",
        opacity: 0.5
      }
    },
    isEnabled: true
  })

  useEffect(() => {
    if (elementsContainerRef.current) {
        let temp = new Array<Box>
        Array.from(elementsContainerRef.current.children).forEach((item) => {
        const { left, top, width, height } = item.getBoundingClientRect()
        
        temp.push({
            left,
            top,
            width,
            height
        })
        })
        selectableItems.current = temp
    }
  }, [])

  return (
    <div id="rhythmcontainer" className="container">
      <DragSelection />
      <div
        id="elements-container"
        className="elements-container"
        ref={elementsContainerRef}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <div
            data-testid={`grid-cell-${i}`}
            key={i}
            className={`element ${
              selectedIndexes.includes(i) ? "selected" : ""
            }`}
          />
        ))}
      </div>

      <div className="selection-box-info">
        Selection Box:
        <div>top: {selectionBox?.top || ""}</div>
        <div>left: {selectionBox?.left || ""}</div>
        <div>width: {selectionBox?.width || ""}</div>
        <div>height: {selectionBox?.height || ""}</div>
      </div>
    </div>
  );
}
