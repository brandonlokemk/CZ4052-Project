import React, { useState } from 'react';
import axios from "axios"; 
import { 
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material"
import SendIcon from "@mui/icons-material/Send";

const UploadPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [files, setFiles] = useState([]);
  const [promptContent, setPromptContent] = useState('');

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const handleFileChange = (event) => {
    const fileList = Array.from(event.target.files);
    setFiles(fileList);
  };
  const handleTextFieldChange = (event) => {
    // This function will be called whenever the content of the TextField changes
    setPromptContent(event.target.value);
  };

  const handleUpload = () => {
    // Handle file upload logic here
    console.log('Uploaded files:', files);
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
              width:'80%',
              height: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems:'center',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#ffffff',
              padding: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              zIndex: '999',
            }}
          >
            <h2 style={{ color: 'black', textAlign: 'center' }}>Admin Panel</h2>
            <Grid className="box-content" style={{ display: 'flex', background:'white', alignItems: 'center', justifyContent:'center', gap:'5%', width:"100%", height:'100%'}}>
              <Grid item xs={1} className='upload-files' style={{ display: 'flex', flex: 1, background:'gray', height:'100%', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'5px'}}>
                <input type="file" onChange={handleFileChange} multiple />
                <div style={{ color: 'black' }}>
                  {files.map((file, index) => (
                    <div key={index}>{file.name}</div>
                  ))}
                </div>
                <button onClick={handleUpload}>Upload</button>
              </Grid>  
              
              <Grid item xs={1} className='edit-prompt' style={{ flex: 1,  color:'black'}}>
                <div style={{display: 'flex', flexDirection: 'column', background: 'white'}}>
                  <div style={{ width: '100%'}}>
                    <TextField
                      fullWidth
                      id="outlined-multiline-standard"
                      label="Edit Prompt"
                      multiline
                      minRows={8}
                      maxRows={15}
                      variant="filled"
                      placeholder='Enter prompt here'
                      style={{ width: '100'}}
                      value={promptContent}
                      onChange={handleTextFieldChange}
                    />
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'10px'}}>
                    <Button
                      // fullWidth
                      color="primary"
                      variant="contained"
                      style={{padding: '6px 30px'}}
                      onClick={handlePromptChange}
                      // endIcon={<SendIcon />}
                    >
                      Update prompt
                    </Button>
                  </div>
                </div>


                
              </Grid>
            </Grid>
            <div>
              <button onClick={togglePopup} style={{padding: '5px'}}>Close</button>
            </div>
          </div>
        )}
    </div>
  );
};

export default UploadPopup;
