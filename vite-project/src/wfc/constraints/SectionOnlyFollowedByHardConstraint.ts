import { HigherValues } from "../HigherValues"
import { Tile } from "../Tile"
import { Section } from "../hierarchy/prototypes"

export class SectionOnlyFollowedByHardConstraint implements HardConstraint<Section> {
	private sectionName: string
	private grabber: Grabber<Set<string>>
	name = "Section Only Followed By"
	configText = () => `Section: ${this.sectionName}, Followed By: ${this.grabber.configText()}`
	constructor(sectionName: string, grabber: Grabber<Set<string>>) {
		this.sectionName = sectionName
		this.grabber = grabber
	}

	check(tile: Tile<Section>, higherValues: HigherValues): boolean {
		const section = tile.getValue()
		const prevSection = tile.getPrev().getValue()
		const nextSection = tile.getNext().getValue()
		return this.checkPair(prevSection, section, higherValues) && this.checkPair(section, nextSection, higherValues)
	}

	checkPair(first: Section, second: Section, higherValues: HigherValues): boolean {
		if(first.getName() != this.sectionName) return true
		const sectionSet = this.grabber.grab(higherValues)
		return sectionSet.has(second.getName())
	}
}