import { PassiveAppState, useAppContext } from "../AppState";
import React, { useRef } from 'react';
import {MidiToNoteOutput} from "../audio/midi"

interface UploadButtonProps {
  onUpload: (data: any) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buff = e.target?.result as ArrayBuffer;
      //  const noteOutputs = MidiToNoteOutput(buff); // Assuming MidiToNoteOutput function is synchronous
       console.log(onUpload(buff));
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

export const MidiAnalyser = () => {
    const config = useAppContext() 
    const handleDownload = () => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(config as PassiveAppState)], { type: "application/json" }))
        
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
    </div>

}