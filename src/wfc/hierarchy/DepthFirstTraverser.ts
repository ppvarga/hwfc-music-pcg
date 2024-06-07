import { ConflictError } from "../Tile"
import { SectionLevelNode } from "./SectionLevelNode"
import { ResultManager } from "./results"

export class DepthFirstTraverser {
    public static generate(sectionLevelNode: SectionLevelNode, resultManager: ResultManager) {
        sectionLevelNode.getCanvas().generate()

        console.log(1)
        while(true){
            console.log(2)
            const chordLevelNodes = sectionLevelNode.getSubNodes()
            console.log(chordLevelNodes)

            try{
                console.log(3)
                for (let i = 0; i < chordLevelNodes.length; i++){
                    chordLevelNodes[i].getCanvas().initialize()
                }

                while(true) {
                    console.log(4)
                    let lastChordLevelNode = undefined

                    for (let i = 0; i < chordLevelNodes.length; i++){
                        const chordLevelNode = chordLevelNodes[i]
                        
                        chordLevelNode.getCanvas().generate()
                        
                        lastChordLevelNode = chordLevelNode

                        const noteLevelNodes = chordLevelNode.getSubNodes()

                        try{
                            console.log(5)
                            for (let j = 0; j < noteLevelNodes.length; j++){
                                noteLevelNodes[j].getCanvas().initialize()
                            }
    
                            for (let j = 0; j < noteLevelNodes.length; j++){
                                const noteLevelNode = noteLevelNodes[j]
                                noteLevelNode.getCanvas().generate()
                            }
    
                        } catch (e) {
                            if(!(e instanceof ConflictError)) throw e
                            lastChordLevelNode!.getCanvas().tryAnother() 
                            break
                        }
                    }
                   
                }
                
            } catch (e) {
                if(!(e instanceof ConflictError)) throw e
                sectionLevelNode.getCanvas().tryAnother() 
            }
        }
    }
}
