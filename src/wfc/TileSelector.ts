import { Random } from "../util/Random"
import { Equatable } from "../util/utils"
import { Tile } from "./Tile"
import { TileCanvas } from "./TileCanvas"

export class TileSelector<T extends Equatable<T>> {
	private pq: [number, Tile<T>][] = []
	private random: Random

	constructor(random: Random, private canvas: TileCanvas<any,T,any>) {
		this.random = random
	}

	public add(tile: Tile<T>): void {
		this.pq.push([tile.getNumOptions(), tile])
		this.pq.sort((a, b) => a[0] - b[0])
	}

	public poll(): Tile<T> {
		let found = false
		let pair: [number, Tile<T>] | undefined

		while (!found && this.pq.length > 0) {
			pair = this.pq.shift() as [number, Tile<T>]
			const tile = pair[1]

			if (this.canvas.getTileAtPos(tile.getPosition()).isActive()) {
				found = true
			}
		}

		if (!found || !pair) throw new Error("No tile options left")

		const tileOptions: Array<Tile<T>> = [pair[1]]
		const numStates = pair[0]

		while (this.pq.length > 0 && this.pq[0][0] == numStates) {
			const tile = (this.pq.shift() as [number, Tile<T>])[1]
			if (tile.isActive()) {
				tileOptions.push(tile)
			}
		}

		const numOptions = tileOptions.length
		if (numOptions === 0) {
			throw new Error("Collapse unsuccessful")
		}

		const randomIndex = this.random.nextInt(numOptions)
		const out = Array.from(tileOptions)[randomIndex]

		const remainingTileOptions = tileOptions
			.slice(0, randomIndex)
			.concat(tileOptions.slice(randomIndex + 1))

		for (const tile of remainingTileOptions) {
			this.add(tile)
		}

		return out
	}
}
