import  { useState } from 'react';

export function FileUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileChange = (event: { target: { files: any[]; }; }) => {
        const file = event.target.files[0];
        setSelectedFile(file);

        // Check if the file is a MIDI file
        if (file && file.type !== 'audio/midi') {
            setErrorMessage('Only MIDI files are allowed.');
        } else {
            setErrorMessage('');
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            // Upload logic here, you can use XMLHttpRequest or fetch API
            const formData = new FormData();
            formData.append('filename', selectedFile);

            // Send formData to the server
            // Example using fetch:
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                // Handle response from the server
            })
            .catch(error => {
                // Handle error
            });
        } else {
            setErrorMessage('No file selected.');
        }
    };

    return (
        <form action="/action_page.php">
			<input type="file" id="myFile" name="filename"/>
			<input type="submit"/>
		</form>
    );
}


