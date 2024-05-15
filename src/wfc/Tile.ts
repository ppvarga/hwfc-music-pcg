import { Equatable } from "../util/utils"
import { TileCanvas } from "./TileCanvas"

export interface TileProps<T extends Equatable<T>> {
	status: T | Set<[T, number]> | "header" | "trailer"
	position: number
	canvas: TileCanvas<any, T, any>
	prev?: Tile<T>
	next?: Tile<T>
}

function getItemFromSet<T>(set: Set<T>, predicate: (item: T) => boolean): T | undefined {
    for (const item of set) {
        if (predicate(item)) {
            return item;
        }
    }
    return undefined; // Return undefined if no item matches the predicate
}

export class Tile<T extends Equatable<T>> {
	private prev!: Tile<T>
	private next!: Tile<T>
	private position: number
	private numOptions: number
	private status: T | Set<[T, number]> | "header" | "trailer"
	private canvas: TileCanvas<any, T, any>
	private collapsed: boolean

	constructor(props: TileProps<T>) {
		this.status = props.status
		this.position = props.position
		this.canvas = props.canvas
		if (props.status === "header" || props.status === "trailer") {
			this.numOptions = 0
			this.collapsed = false
		} else if (props.status instanceof Set) {
			this.numOptions = props.status.size
			this.collapsed = false
		} else {
			this.numOptions = 1
			this.collapsed = true
		}
		this.prev = props.prev!
		this.next = props.next!
	}

	public clone(): Tile<T> {
		const newStatus = this.status instanceof Set ? new Set(this.status) : (this.status == "header" || this.status == "trailer") ? this.status : this.status.clone()
		const out = new Tile({
			status: newStatus,
			position: this.position,
			canvas: this.canvas,
			prev: this.prev,
			next: this.next
		})
		return out
	}

	public setPrev(prev: Tile<T>): void {
		this.prev = prev
	}

	public setNext(next: Tile<T>): void {
		this.next = next
	}

	public getPrev(reachOver: boolean): Tile<T> {
		if (reachOver && this.prev.status == "header") return this.canvas.lastTileOfPrevious()
		else return this.prev
	}

	public getNext(reachOver: boolean): Tile<T> {
		if (reachOver && this.next.status == "trailer") return this.canvas.firstTileOfNext()
		else return this.next
	}

	static header<T extends Equatable<T>>(canvas: TileCanvas<any, T, any>): Tile<T> {
		return new Tile<T>({
			status: "header",
			position: -1,
			canvas: canvas,
		})
	}

	static trailer<T extends Equatable<T>>(canvas: TileCanvas<any, T, any>): Tile<T> {
		return new Tile<T>({
			status: "trailer",
			position: canvas.getSize(),
			canvas: canvas,
		})
	}

	public updateOptions(options?: T[]): number {
		if (options === undefined) {
			if (!(this.status instanceof Set)) return -1
			options = [...(this.status as Set<[T, number]>)].map(
				([option, _weight]) => option,
			)
		}

		const newOptionWeights: [T, number][] = []
		let out = 0

		options.forEach((option: T) => {
			const weight = this.canvas
				.getConstraints()
				.weight(
					this.hypotheticalTile(option),
					this.canvas.getHigherValues(),
				)
			if (weight <= 0) return
			const optionWeightPair: [T, number] = [option, weight]
			newOptionWeights.push(optionWeightPair)
			out++
		})

		if (out === 0) {
			throw new ConflictError()
		} else if (out === 1) {
			if (!this.collapse(newOptionWeights[0][0])){
				throw new ConflictError()
			}
			return 1
		}

		this.status = new Set(newOptionWeights)
		this.numOptions = out

		this.canvas.addTileOption(this)
		return out
	}

	private hypotheticalTile(value: T): Tile<T> {
		const out = new Tile({
			canvas: this.canvas,
			position: this.position,
			status: value,
		})
		out.setPrev(this.prev)
		out.setNext(this.next)
		return out
	}

	// returns whether it was a successful collapse
	public collapse(value: T): boolean {
		if(! (this.status instanceof Set)) throw new Error("Already collapsed, bozo")
 		const oldStatus = this.status
		this.status = value
		this.canvas.collapseOne()
		this.collapsed = true
		try {
			this.getPrev(true).updateOptions()
			this.getNext(true).updateOptions()
		} catch (e) {
			if(! (e instanceof ConflictError)) throw e
			this.collapsed = false
			this.canvas.retractOne()
			this.status = oldStatus
			this.removeValue(value)

			return false
		}
		return true
	}

	public removeValue(value: T) {
		if(!(this.status instanceof Set)){
			throw new Error("Can't remove from non-set status")
		}
		const valuePair = getItemFromSet(this.status, t => t[0] == value)
		if (valuePair === undefined) throw new Error("This wasn't in the set")
		this.status.delete(valuePair)
	}

	public getNumOptions(): number {
		return this.numOptions
	}

	public isActive(): boolean {
		return this.status instanceof Set
	}

	public isCollapsed(): boolean {
		return this.collapsed
	}

	public chooseValue(): T | undefined {
		const options = Array.from(this.status as Set<[T, number]>)
		const totalWeight = options.reduce(
			(acc, [_, weight]) => acc + weight,
			0,
		)
		const random = this.canvas.getRandom()
		let randomWeight = random.next() * totalWeight
		let out: T | undefined = undefined
		for (const [option, weight] of options) {
			randomWeight -= weight
			if (randomWeight < 0) {
				out = option
				break
			}
		}
		return out
	}

	public getValue(): T {
		if (!this.collapsed) {
			console.log(this)
			throw new Error(`Tile at ${this.position} not collapsed, has status ${this.status}`)
		}
		return this.status as T
	}

	public getPosition(): number {
		return this.position
	}

	public getCanvas(): TileCanvas<any, T, any> {
		return this.canvas
	}

	public getOptions(): T[] {
		if (this.status instanceof Set) return Array.from(this.status).map(a => a[0])
		if (this.status == "header" || this.status == "trailer") throw new Error("HOW")
		return [this.status]
	}

	public decrementNumOptions() {
		this.numOptions--
	}
}

export class ConflictError extends Error{
	constructor() {
		super("No valid options left")
	}
}