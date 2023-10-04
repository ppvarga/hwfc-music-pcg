import { Random } from "../util/Random"
import { ConstraintSet } from "./ConstraintSet"
import { HigherValues } from "./HigherValues"
import { OptionsPerCell } from "./OptionsPerCell"
import { Tile } from "./Tile"
import { TileSelector } from "./TileSelector"

export class TileCanvasProps<T> {
	private size: number
	private optionsPerCell: OptionsPerCell<T>
	private constraints: ConstraintSet<T>

	constructor(
		size: number,
		optionsPerCell: OptionsPerCell<T>,
		constraints: ConstraintSet<T>,
	) {
		this.size = size
		this.optionsPerCell = optionsPerCell
		this.constraints = constraints
	}

	union(other: TileCanvasProps<T>): TileCanvasProps<T> {
		return new TileCanvasProps<T>(
			other.size,
			this.optionsPerCell.union(other.optionsPerCell),
			this.constraints.union(other.constraints),
		)
	}

	getOptionsPerCell(): OptionsPerCell<T> {
		return this.optionsPerCell
	}

	getConstraints(): ConstraintSet<T> {
		return this.constraints
	}

	getSize(): number {
		return this.size
	}

	setOptionsPerCell(optionsPerCell: OptionsPerCell<T>): void {
		this.optionsPerCell = optionsPerCell
	}

	setSize(size: number): void {
		this.size = size
	}
}

const optionsToWeighedOptions = <T>(options: Set<T>): Set<[T, number]> => {
	return new Set([...options].map((option: T) => [option, 1]))
}

export class TileCanvas<T> {
	private size: number
	private collapsed: number
	private tiles: Tile<T>[]
	private pq: TileSelector<T>
	private random: Random
	private higherValues: HigherValues
	private constraints: ConstraintSet<T>

	public getSize(): number {
		return this.size
	}

	constructor(
		props: TileCanvasProps<T>,
		higherValues: HigherValues,
		random: Random,
	) {
		this.size = props.getSize()
		this.collapsed = 0

		const optionsPerCell = props.getOptionsPerCell()

		this.pq = new TileSelector<T>(random)
		this.random = random
		this.higherValues = higherValues
		this.constraints = props.getConstraints()

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

	public getConstraints(): ConstraintSet<T> {
		return this.constraints
	}

	public getHigherValues(): HigherValues {
		return this.higherValues
	}

	public collapseOne(): number {
		return ++this.collapsed
	}

	public addTileOption(tile: Tile<T>) {
		this.pq.add(tile)
	}

	public getRandom(): Random {
		return this.random
	}

	public collapseNext(): Tile<T> {
		if (this.collapsed >= this.size) throw new Error("Nothing to collapse")
		const tileToCollapse = this.pq.poll()
		tileToCollapse.collapse()
		return tileToCollapse
	}

	public generate(): T[] {
		while (this.collapsed < this.size) this.collapseNext()
		return this.tiles.map((tile) => tile.getValue())
	}
}
