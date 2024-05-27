import { ConstraintSet } from "../../ConstraintSet";
import { Section } from "../../hierarchy/Section";

export class ConstraintInferrer{
    private sections : Section[]
    private constraintsToCheck : ConstraintSet<Section>
    
    constructor(sections : Section[], constraintsToCheck : ConstraintSet<Section>){
        this.sections = sections
        this.constraintsToCheck = constraintsToCheck
    }
    
    check(): boolean {

        return true
    }
}