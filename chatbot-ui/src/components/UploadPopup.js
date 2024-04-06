import React, { useState, useEffect, useRef, useReducer } from 'react';
import axios from "axios"; 
import { 
  Typography,
  TextField,
  Button,
  Grid,
} from "@mui/material"
import { styled } from '@mui/material/styles';

import { FileUpload } from 'primereact/fileupload';
// import { Uploader, Button } from 'rsuite';
// import 'rsuite/Uploader/styles/index.css';

import SendIcon from "@mui/icons-material/Send";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState([]);
  const [promptContent, setPromptContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };



  const handleTextFieldChange = (event) => {
    // This function will be called whenever the content of the TextField changes
    setPromptContent(event.target.value);
  };

  const uploader = useRef();

  const handleUpload = async () => {
    console.log(selectedFile)
  
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post('http://localhost:3003/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded successfully');
      if (selectedFile.length != 0)  {
        setUploadedFiles(prevFiles => [...prevFiles, selectedFile.name]);
        setSelectedFile(null); // Clear selected file after upload

      }
    } catch (error) {
      console.error('Error uploading file: ', error);
    }
  };

  const handlePromptChange = async() => {
    try {
      const payload = {
        _id: "660d334aa446317f0c7e55a6",
        content: JSON.stringify(promptContent),
      };
    
      await axios.post('http://localhost:3001/save-prompt', payload)
     } catch (error) {
      console.error('Error in the API call:', error);
    }
  }

  return (
    // <div style={{padding: '50px'}}>
    <div>
      <Button color="inherit" onClick={togglePopup} style={{marginRight: '10px', background:'red'}}> Admin Panel </Button>
        {showPopup && (
          <div
            style={{
              backgroundColor: '  white',
              width:'90%',
              height: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems:'center',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              paddingLeft: '20px',
              paddingRight: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              zIndex: '999'
            }}
          >
            <Typography style={{paddingTop:'10px', paddingBottom:'10px'}}variant="h4" color={'black'}>
            Admin Panel
          </Typography>
            {/* <h2 style={{color:'black'}}>Admin Panel</h2> */}
            <div style={{display:'flex', flexDirection:'row', flex: 1, backgroundColor:'gray', height:'100%', width:'100%', borderRadius:'15px', overflow:'scroll'}}>
              <div style={{backgroundColor:'#353551', flex: '0 0 50%', overflow:'scroll'}}>
              {/* <div style={{backgroundColor:'#353551', flex: '0 0 50%', overflow:'scroll'}}> */}

                {/* <FileUpload name="demo[]" url={'/api/upload'} multiple accept="pdf/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} /> */}
                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <Typography style={{paddingTop:'10px', paddingBottom:'10px'}}variant="h6" color={'white'}>
                      Currently Selected:
                    </Typography>
                  <div style={{display:'flex', flexDirection:'row', marginTop:'10px', width:'100%', justifyContent:'center', gap:'40px'}}>
                    <Button
                      InputProps={{
                        style: {color:'white'} // Change color to your desired color
                      }}
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      single
                      // startIcon={<CloudUploadIcon />}
                      onChange={handleFileChange}
                    >
                      Upload file
                      <VisuallyHiddenInput type="file" />
                    </Button>

                    {/* <div> */}
                  {/* <Typography style={{paddingTop:'10px', paddingBottom:'10px'}}variant="h6" color={'white'}>
                      Currently Selected:
                    </Typography> */}
                    {selectedFile && (
                      <div style={{textAlign:'center'}}>
                        <p>{selectedFile.name}</p>
                      </div>
                    )}
                  {/* </div> */}
                    <Button color="inherit" onClick={handleUpload} style={{ backgroundColor: 'white', color:'black', alignItems:'center'}}>Upload</Button>
                  </div>

                  <hr style={{ width: '100%', borderWidth:'1px', backgroundColor: 'gray', marginTop:'20px'}} />                  

                  {/* <input type="file" multiple onChange={handleFileChange} /> */}
                  <Typography style={{paddingTop:'10px', paddingBottom:'10px'}}variant="h6" color={'white'}>
                      Uploaded Files:
                    </Typography>
                  
                  <div style={{textAlign:'center', paddingRight:'20px'}}>
                    {uploadedFiles.length > 0 && (
                    <div style={{textAlign:'center'}}> 
                      <ol style={{textAlign:'center', }} >
                        {uploadedFiles.map((file, index) => (
                          <li style={{textAlign:'center'}} key={index}>{file}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor:'#EFEFF8', display:'flex', flexDirection:'column', width:'100%', alignItems:'center'}}>
                <TextField
                InputProps={{
                  style: { color: 'black',  backgroundColor:'#ECECF6'} // Change color to your desired color
                }}
                // InputProps={{sx: {height:'85%'}}}
                  id="filled-multiline-static"
                  label="Edit Prompt"
                  multiline
                  // minRows={22}
                  rows={18}
                  // defaultValue=""
                  variant='filled'
                  fullWidth
                  height="100%"
                  value={promptContent}
                  onChange={handleTextFieldChange}
                />
                <Button variant="contained" endIcon={<SendIcon />} onClick={handlePromptChange} style={{width:'30%', backgroundColor: 'black', color:'white', marginTop:'20px'}}>Edit</Button>
              </div>



            </div>
            <div style={{padding:'15px'}}>
              {/* <button onClick={togglePopup} style={{padding: '5px'}}>Close</button> */}
              <Button color="inherit" onClick={togglePopup} style={{ backgroundColor: 'black', color:'white'}}>Close</Button>
            </div>
          </div>
        )}
    </div>
  );
};

export default UploadPopup;
