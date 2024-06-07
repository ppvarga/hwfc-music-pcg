import { ConflictError } from "../Tile"
import { SectionLevelNode } from "./SectionLevelNode"
import { ResultManager } from "./results"

export class DepthFirstTraverser {
    public static generate(sectionLevelNode: SectionLevelNode, resultManager: ResultManager) {
        sectionLevelNode.getCanvas().generate()

        let sectionsDone = false

        while(!sectionsDone){
            const chordLevelNodes = sectionLevelNode.getSubNodes()

            try{
                for (let i = 0; i < chordLevelNodes.length; i++){
                    chordLevelNodes[i].getCanvas().initialize()
                }

                let chordsDone = false

                while(!chordsDone) {
                    let lastChordLevelNode = undefined

                    for (let i = 0; i < chordLevelNodes.length; i++){
                        const chordLevelNode = chordLevelNodes[i]
                        
                        chordLevelNode.getCanvas().generate()
                        
                        lastChordLevelNode = chordLevelNode

                        const noteLevelNodes = chordLevelNode.getSubNodes()

                        try{
                            for (let j = 0; j < noteLevelNodes.length; j++){
                                const noteLevelNode = noteLevelNodes[j]
                                noteLevelNode.getCanvas().initialize()
                                noteLevelNode.getCanvas().generate()
                            }

                            chordsDone = true
    
                        } catch (e) {
                            if(!(e instanceof ConflictError)) throw e
                            lastChordLevelNode!.getCanvas().tryAnother() 
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
    }
}
