import { ConflictError } from "../Tile"
import { TileCanvas } from "../TileCanvas"
import { SectionLevelNode } from "./SectionLevelNode"
import { ResultManager } from "./results"

export class DepthFirstTraverser {
    public static generate(sectionLevelNode: SectionLevelNode, resultManager: ResultManager) {
        sectionLevelNode.getCanvas().initialize()
        sectionLevelNode.getCanvas().generate()
        let lastCanvas: TileCanvas<any, any, any> = sectionLevelNode.getCanvas()

        for (let i = 0; i < sectionLevelNode.getSubNodes().length; i++){
            let found = false
            while(!found){
                try{
                    sectionLevelNode.getSubNodes()[i].getCanvas().initialize()
                    found = true
                } catch (e) {
                    if(!(e instanceof ConflictError)) throw e
                    lastCanvas.tryAnother()
                }
            }
        }

        for (let i = 0; i < sectionLevelNode.getSubNodes().length; i++){
            sectionLevelNode.getSubNodes()[i].getCanvas().generate()
            lastCanvas = sectionLevelNode.getSubNodes()[i].getCanvas()

            for (let j = 0; j < sectionLevelNode.getSubNodes()[i].getCanvas().getSize(); j++){
                const noteLevelNode = sectionLevelNode.getSubNodes()[i].getSubNodes()[j]
                let found = false
                while(!found){
                    try{
                        noteLevelNode.getCanvas().initialize()
                        found = true
                    } catch (e) {
                        if(!(e instanceof ConflictError)) throw e
                        lastCanvas.tryAnother()
                    }
                }
                console.log(i,j)
                if (i == 1 && j == 1){
                    console.log("asd")
                }
                noteLevelNode.getCanvas().generate()
                lastCanvas = noteLevelNode.getCanvas()
               }
        }

        console.log("CHECKS:")
        if(!sectionLevelNode.getCanvas().isCollapsed()) console.log("Not all sections collapsed")
        
        for(let chordLevelNode of sectionLevelNode.getSubNodes()){
            if(!chordLevelNode.getCanvas().isCollapsed()) console.log(`Not all chords of section ${chordLevelNode.getPosition()} collapsed`)
            
            for(let noteLevelNode of chordLevelNode.getSubNodes()){
                if(!noteLevelNode.getCanvas().isCollapsed()) console.log(`Not all notes of chord ${noteLevelNode.getPosition()} of section ${chordLevelNode.getPosition()} (${sectionLevelNode.getCanvas().getValueAtPosition(chordLevelNode.getPosition()).getName()}) collapsed`)
            }
        }
    }
}
