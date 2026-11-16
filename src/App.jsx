import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const appBarSx = {
  height: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  pl: 2,
};

const defaultURL = 'https://staging-app.call-em-all.com?HideHeader=true';

function App() {
  const [open, setOpen] = useState(true);
  const [urlInput, setUrlInput] = useState(defaultURL);
  const [iframeUrl, setIframeUrl] = useState(defaultURL);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const handleChange = (event) => {
    setUrlInput(event.target.value);
  };

  const handleGo = () => {
    setIframeUrl(urlInput);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ ...appBarSx, mb: 8 }}>
        <Typography variant="h6">Recruit-Em-All</Typography>
      </AppBar>
      <Button
        onClick={toggleOpen}
        sx={{ ml: 1 }}
        variant="contained"
        color="primary"
      >
        Open Call-Em-All
      </Button>
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleOpen}
        slotProps={{ paper: { sx: { width: '60%' } } }}
      >
        <AppBar position="static" sx={appBarSx}>
          <Typography variant="h6">Call-Em-All Integration</Typography>
        </AppBar>
        <Box sx={{ display: 'flex', p: 3, width: '80%' }}>
          <TextField
            id="standard-name"
            fullWidth
            label="URL"
            value={urlInput}
            onChange={handleChange}
            variant="outlined"
          />
          <Button
            onClick={handleGo}
            sx={{ ml: 1 }}
            variant="contained"
            color="primary"
          >
            GO
          </Button>
        </Box>
        <Container style={{ height: '100%' }}>
          <div
            style={{ width: 912, display: 'flex', flexGrow: 1, height: '99%' }}
          >
            <iframe
              title="CEA SSO test"
              width="912px"
              height="800px"
              scrolling="no"
              src={iframeUrl}
            />
          </div>
        </Container>
      </Drawer>
    </Box>
  );
}

export default App;
