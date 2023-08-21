import "./App.css"
import {  AppProvider } from "./AppState"
import { Output } from "./components/Output"
import { GlobalSettings } from "./components/GlobalSettings"
import { AddChordConstraint, ChordConstraints } from "./components/ChordConstraints"
import { ChordTiles } from "./components/ChordTiles"
import { AddNoteConstraint, NoteConstraints } from "./components/NoteConstraints"
import { NoteTiles } from "./components/NoteTiles"

function App() {
	return (
		<AppProvider>
			<h1>WFC Music</h1>
			<GlobalSettings />
			<h2>Canvases</h2>
			<ChordTiles/>
			<NoteTiles/>
			<h2>Constraints</h2>
			<ChordConstraints />
			<AddChordConstraint />
			<NoteConstraints />
			<AddNoteConstraint />
			<h3>Melody constraints</h3>
			<Output/>
		</AppProvider>
	)
}

export default App