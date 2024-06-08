import { ConflictError } from "../Tile"
import { SectionLevelNode } from "./SectionLevelNode"
import { ResultManager } from "./results"

export class DepthFirstTraverser {
    public static generate(sectionLevelNode: SectionLevelNode, resultManager: ResultManager) {
        sectionLevelNode.getCanvas().generate()

        let sectionsDone = false

        while(!sectionsDone){

            try{
                for (let i = 0; i < sectionLevelNode.getSubNodes().length; i++){
                    sectionLevelNode.getSubNodes()[i].getCanvas().initialize()
                }

                let chordsDone = false

                while(!chordsDone) {
                    for (let i = 0; i < sectionLevelNode.getSubNodes().length; i++){
                        sectionLevelNode.getSubNodes()[i].getCanvas().generate()

                        try{
                            for (let j = 0; j < sectionLevelNode.getSubNodes()[i].getCanvas().getSize(); j++){
                                const noteLevelNode = sectionLevelNode.getSubNodes()[i].getSubNodes()[j]
                                noteLevelNode.getCanvas().initialize()
                                noteLevelNode.getCanvas().generate()
                            }

                            chordsDone = true
    
                        } catch (e) {
                            if(!(e instanceof ConflictError)) throw e
                            sectionLevelNode.getSubNodes()[i].getCanvas().tryAnother() 
                            break
                        }
                    }
                   
                }

                sectionsDone = true
                
            } catch (e) {
                if(!(e instanceof ConflictError)) throw e
                sectionLevelNode.getCanvas().tryAnother() 
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
