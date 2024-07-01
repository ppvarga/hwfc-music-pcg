import "./App.css"
import { AppProvider } from "./AppState"
import { Output } from "./components/Output"
import { GlobalSettings } from "./components/GlobalSettings"
import { ChordConstraints } from "./components/ChordConstraints"
import { ChordTiles } from "./components/ChordTiles"
import { NoteConstraints } from "./components/NoteConstraints"
import { NoteTiles } from "./components/NoteTiles"
import TabComponent from "./components/TabComponent"
import { ChordPrototypesPage } from "./components/ChordPrototypesPage"
import { SectionsPage } from "./components/SectionsPage"
import { SectionTiles } from "./components/SectionTiles"
import { Configs } from "./components/Configs"
import { HashRouter, Routes, Route } from "react-router-dom";

function App() {

	const tabs = [
		{
			title: "Main",
			content: <>
				<div className="main-div">
					<GlobalSettings />
					<div className="main-column">
						<SectionTiles />
					</div>
					<div className="main-column">
						<ChordTiles />
						<ChordConstraints />
					</div>
					<div className="main-column">
						<NoteTiles />
						<NoteConstraints />
					</div>
				</div>
			</>
		},
		{
			title: "Sections",
			content: <SectionsPage />
		},
		{
			title: "Chord prototypes",
			content: <ChordPrototypesPage />
		},
		{
			title: "Configs",
			content: <Configs />
		}
	]

	const PLApp = () =>
		<AppProvider>
			<TabComponent tabs={tabs} />
			<Output/>
		</AppProvider>
	
	return (
		<HashRouter basename="/proceduraliszt/">
		<Routes>
			<Route index path="" element={<PLApp/>} />
		</Routes>
	</HashRouter>
	)
}

export default App