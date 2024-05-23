import { PassiveAppState, useAppContext } from "../AppState";
import React, { useRef, useState } from 'react';
import {MidiToNoteOutput} from "../audio/midi"
import { MidiPlayer, NoteOutput } from "./MidiPlayer";
interface UploadButtonProps {
  onUpload: (data: any) => void;
}


let newNotes: NoteOutput[] = [];


const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const appState = useAppContext()
  const { setOutput } = appState
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buff = e.target?.result as ArrayBuffer;
      //  const noteOutputs = MidiToNoteOutput(buff); // Assuming MidiToNoteOutput function is synchronous
        const Notes = MidiToNoteOutput(buff);
        console.log(Notes)
        newNotes = Notes;
        setOutput([Notes, Notes.length])
       
      } catch (err) {
        console.error("Error parsing MIDI:", err);
        alert("Invalid MIDI file.");
      }
    };

    reader.readAsArrayBuffer(file); // Read as ArrayBuffer instead of text
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <>
      <button onClick={handleClick}>Upload MIDI</button>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".mid" 
        onChange={handleFileChange} 
      />
    </>
  );
}

export default UploadButton;
function updatePlayer() {
  const appState = useAppContext()

  const { setOutput } = appState

  setOutput([newNotes, 0])
}
export const MidiAnalyser = () => {
    const appState = useAppContext()
    const { output} = appState;  
    const [isPlaying, setIsPlaying] = useState(false);
    
    const handleDownload = () => {
       const url = URL.createObjectURL(new Blob([JSON.stringify(appState as PassiveAppState)], { type: "application/json" }))
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wfc.json';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        // Optional: Release the object URL to free up memory
        URL.revokeObjectURL(url);
    };

    return <div style={{padding:"1em", display:"flex", flexDirection:"row", gap:"1em"}}>
        <button onClick={handleDownload}>Save current MIDI</button>
        <UploadButton onUpload={MidiToNoteOutput} />
        <MidiPlayer notes={output[0]} length={output[1]} isPlaying={isPlaying} setIsPlaying={setIsPlaying} updatePlayer={updatePlayer}/> 
    </div>

}