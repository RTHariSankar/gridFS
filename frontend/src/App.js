import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles()
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.message === 'File uploaded successfully') {
        alert(response.data.message);
        setSelectedFile(null);
        fetchFiles(); // Refresh the file list after successful upload
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setSelectedFile(null);
    }
  };

  const handleFileDownload = (filename) => {
    // window.open(`http://localhost:5000/api/download/${filename}`, '_blank');
    try {
        axios.get(`http://localhost:5000/api/download/${filename}`);
        alert('file downloaded successfully');
        fetchFiles();
    } catch (error) {
        console.log(error)
    }
  };

  const handleFileDelete = async (id) => {
    console.log(id);
    try {
      const response = await axios.delete(`http://localhost:5000/files/${id}`);
  
      if (response.status === 200) {
        // File deleted successfully, you can update the file list or show a message here
        console.log('File deleted successfully');
        fetchFiles(); // Assuming fetchFiles() is a function that fetches the updated file list.
      } else {
        // There was an error deleting the file, handle the error here
        console.error('Error deleting file:', response.statusText);
      }
    } catch (error) {
      // Network or other errors
      console.error('Error:', error);
    }
  };
  

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files');
      setFiles(response.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" name="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>

      <div>
        {/* <div>{console.log(files)}</div> */}
        <h2>File List</h2>
        {files.length === 0 ? (
          <p>No files found</p>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file._id}>
                {file.filename}
                <button onClick={() => handleFileDownload(file.filename)}>Download</button>
                <button onClick={() => handleFileDelete(file._id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
