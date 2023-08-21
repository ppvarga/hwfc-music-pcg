import { useRef, useEffect } from "react"

interface MidiPlayerProps {
	src: string
	soundFont?: string
	visualizer: string
	id: string
}

export function MidiPlayer({src, soundFont, visualizer, id}: MidiPlayerProps){
	const ref = useRef<HTMLElement>(null)

	useEffect(() => {
		const midiPlayer = ref.current
		if (midiPlayer) {
			midiPlayer.setAttribute("src", src)
			midiPlayer.setAttribute("sound-font", soundFont ?? "https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus")
			midiPlayer.setAttribute("visualizer", visualizer)
			midiPlayer.setAttribute("id", id)
		}
	}, [src, soundFont, visualizer, id])

	return <midi-player ref={ref} />
}

interface MidiVisualizerProps {
	type: string
	id: string
}
export function MidiVisualizer({type, id}: MidiVisualizerProps){
	const ref = useRef<HTMLElement>(null)

	useEffect(() => {
		const midiVisualizer = ref.current
		if (midiVisualizer) {
			midiVisualizer.setAttribute("type", type)
			midiVisualizer.setAttribute("id", id)
		}
	}, [type, id])

	return <midi-visualizer ref={ref} />
}