import { Grabber } from "../Grabber"
import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { Section } from "../hierarchy/Section"
import { HardConstraint } from "./concepts/Constraint"

export class SectionOnlyPrecededByHardConstraint
	implements HardConstraint<Section>
{
	private sectionName: string
	private grabber: Grabber<string[]>
	name = "Section Only Preceded By"
	constructor(sectionName: string, grabber: Grabber<string[]>,
		private reachOver: boolean) {
		this.sectionName = sectionName
		this.grabber = grabber
	}

	check(tile: Tile<Section>, higherValues: HigherValues): boolean {
		const section = tile.getValue()
		const prev = tile.getPrev(this.reachOver)
		const next = tile.getNext(this.reachOver)
		
		let out = true
		if(prev.isCollapsed()){
			out &&= this.checkPair(prev.getValue(), section, higherValues)
		}
		if(next.isCollapsed()){
			out &&= this.checkPair(section, next.getValue(), higherValues)
		}
		return out
	}

	checkPair(
		first: Section,
		second: Section,
		higherValues: HigherValues,
	): boolean {
		if (second.getName() != this.sectionName) return true
		const sectionSet = this.grabber(higherValues)
		return sectionSet.some((sectionName) => sectionName === first.getName())
	}
}
