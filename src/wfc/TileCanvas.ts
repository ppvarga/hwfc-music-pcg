import { Random } from "../util/Random"
import { Equatable } from "../util/utils"
import { ConstraintSet } from "./ConstraintSet"
import { HigherValues } from "./HigherValues"
import { OptionsPerCell } from "./OptionsPerCell"
import { Tile } from "./Tile"
import { TileSelector } from "./TileSelector"
import { HWFCNode } from "./hierarchy/HWFCNode"
import { NoteLevelNode } from "./hierarchy/NoteLevelNode"

export interface TileCanvasProps<T extends Equatable> {
	optionsPerCell: OptionsPerCell<T>
	constraints: ConstraintSet<T>
}

export const unionOfTileCanvasProps = <T extends Equatable>(first: TileCanvasProps<T>, second: TileCanvasProps<T>) => {
	return {
		optionsPerCell: first.optionsPerCell.union(second.optionsPerCell),
		constraints: first.constraints.union(second.constraints),
	}
}

const optionsToWeighedOptions = <T>(options: Set<T>): Set<[T, number]> => {
	return new Set([...options].map((option: T) => [option, 1]))
}

type Decision<T extends Equatable> = {
	index : number
	value : T
	oldState : Tile<T>[]
}

export class TileCanvas<P extends Equatable, T extends Equatable> {
	private collapsed: number
	private tiles: Tile<T>[]
	private pq: TileSelector<T>
	private higherValues: HigherValues
	private constraints: ConstraintSet<T>
	private decisions: Decision<T>[]

	public getSize(): number {
		return this.size
	}

	constructor(
		private size: number,
		props: TileCanvasProps<T>,
		higherValues: HigherValues,
		private random: Random,
		private node: HWFCNode<P, T>
	) {
		this.collapsed = 0

		const optionsPerCell = props.optionsPerCell

		this.pq = new TileSelector<T>(random)
		this.higherValues = higherValues
		this.constraints = props.constraints
		this.decisions = []

		this.tiles = [this.createTile(optionsPerCell, 0)]

		for (let i = 1; i < this.size; i++) {
			const tile = this.createTile(optionsPerCell, i)

			this.tiles[i - 1].setNext(tile)

			this.tiles.push(tile)
		}

		this.tiles[this.size - 1].setNext(Tile.trailer(this))

		this.tiles.forEach((tile) => {
			tile.updateOptions()
			this.pq.add(tile)
		})
	}

	private createTile(optionsPerCell: OptionsPerCell<T>, i: number) {
		const options = optionsPerCell.getOptions(i)
		let status
		if (options.length === 1) {
			this.collapsed++
			status = options[0]
		} else {
			status = optionsToWeighedOptions(new Set(options))
		}
		return new Tile<T>({
			status,
			canvas: this,
			position: i,
			prev: i === 0 ? Tile.header(this) : this.tiles[i - 1],
		})
	}

	firstTileOfNext(): Tile<T> {
		const nextIndex = this.node.getPosition() + 1
		const parent: HWFCNode<any, P> | undefined = this.node.getParent()
		if (parent === undefined) return Tile.trailer(this)
		if (nextIndex >= parent.getSubNodes().length) {
			const grandparent = parent.getParent()
			if(grandparent === undefined) return Tile.trailer(this)
			const parentNextIndex = parent.getPosition() + 1
			if (parentNextIndex >= grandparent.getSubNodes().length) return Tile.trailer(this)
			const uncle = grandparent.getSubNodes()[parentNextIndex]
			if (uncle === undefined || uncle.getSubNodes().length == 0) return Tile.trailer(this)
			return uncle.getSubNodes()[0].getCanvas().tiles[0]
		}
		const next: HWFCNode<P, T> = parent.getSubNodes()[nextIndex]
		const nextCanvas = next.getCanvas()
		return nextCanvas.tiles[0]
	}

	lastTileOfPrevious(): Tile<T> {
		const prevIndex = this.node.getPosition() - 1
		const parent = this.node.getParent()
		if (parent === undefined) return Tile.header(this)
		if (prevIndex < 0)  {
			const grandparent = parent.getParent()
			if(grandparent === undefined) return Tile.trailer(this)
			const parentPrevIndex = parent.getPosition() - 1
			if (parentPrevIndex < 0) return Tile.trailer(this)
			const uncle = grandparent.getSubNodes()[parentPrevIndex]
			if (uncle === undefined) return Tile.trailer(this)
			const uncleLength = uncle.getSubNodes().length
			if (uncleLength == 0) return Tile.trailer(this)
			const prevCanvasTiles = uncle.getSubNodes()[uncleLength - 1].getCanvas().tiles
			return prevCanvasTiles[prevCanvasTiles.length - 1]
		}
		const prev = parent.getSubNodes()[prevIndex]
		const prevCanvas = prev.getCanvas()
		return prevCanvas.tiles[prevCanvas.size - 1]
	}

	public getTiles(): Tile<T>[] {
		return this.tiles
	}

	public getConstraints(): ConstraintSet<T> {
		return this.constraints
	}

	public getHigherValues(): HigherValues {
		return this.higherValues
	}

	public collapseOne(): number {
		return ++this.collapsed
	}

	public retractOne(): number {
		return --this.collapsed
	}

	public addTileOption(tile: Tile<T>) {
		this.pq.add(tile)
	}

	public getRandom(): Random {
		return this.random
	}

	public collapseNext() {
		if (this.collapsed >= this.size) throw new Error("Nothing to collapse")
		const tileToCollapse = this.pq.poll()

		var numOptions = tileToCollapse.getNumOptions()
		const oldState = this.tiles.map(t => t.clone())

		while(numOptions > 0){
			const value = tileToCollapse.chooseValue()
			if (value === undefined) {
				this.backtrack()
				return
			}
			if (tileToCollapse.collapse(value)){
				this.decisions.push({
					index: tileToCollapse.getPosition(),
					value: tileToCollapse.getValue(),
					oldState
				})
				break
			}
			numOptions--
		}
		if(numOptions == 0) this.backtrack()

		return
	}

	public collapseNextOtherInstruments(otherInstruments: NoteLevelNode[]) {
		if (this.collapsed >= this.size) throw new Error("Nothing to collapse")
		const tileToCollapse = this.pq.poll()

		tileToCollapse.updateOptionsOtherInstruments(otherInstruments)

		var numOptions = tileToCollapse.getNumOptions()
		const oldState = this.tiles.map(t => t.clone())

		while(numOptions > 0){
			const value = tileToCollapse.chooseValue()
			if (value === undefined) {
				return
			}
			if (tileToCollapse.collapse(value)){
				this.decisions.push({
					index: tileToCollapse.getPosition(),
					value: tileToCollapse.getValue(),
					oldState
				})
				break
			}
			numOptions--
		}
		if(numOptions == 0) throw new Error("You've run out of options (ignoring backtracking)")
		return
	}

	private backtrack() {
		const decision = this.decisions.pop()
		if(decision === undefined) throw new Error("You've run out of options :(")
		this.tiles = decision.oldState
		this.tiles[decision.index].removeValue(decision.value)
		this.retractOne()
	}

	public generate(): T[] {
		while (this.collapsed < this.size) {
			this.collapseNext()
		}
		return this.tiles.map((tile) => tile.getValue())
	}

	public generateOtherInstruments(otherInstruments: NoteLevelNode[]) {
		while (this.collapsed < this.size) {
			this.collapseNextOtherInstruments(otherInstruments)
		}
		return this.tiles.map((tile) => tile.getValue())
	}

	public getNode(): HWFCNode<P,T> {
		return this.node
	}

	public isCollapsed(): boolean {
		return this.size <= this.collapsed
	}
}
