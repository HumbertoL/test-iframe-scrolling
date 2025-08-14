import React from 'react';
import './App.css';

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  appBar: {
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingLeft: theme.spacing(2),
    marginBottom: theme.spacing(8),
  },
  drawerAppBar: {
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingLeft: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  drawerContainer: {
    width: '60%',
  },
  textInput: {
    display: 'flex',
    padding: 24,
    width: '80%',
  },
}));

const defaultURL = 'https://staging-app.call-em-all.com?HideHeader=true';

function App() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [urlInput, setUrlInput] = React.useState(defaultURL);

  const [iframeUrl, setIframeUrl] = React.useState(defaultURL);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const handleChange = (event) => {
    setUrlInput(event.target.value);
  };

  const handleGo = (event) => {
    setIframeUrl(urlInput);
  };
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Typography variant="h6" className={classes.title}>
          Recruit-Em-All
        </Typography>
      </AppBar>
      <Button
        onClick={toggleOpen}
        className={classes.button}
        variant="contained"
        color="primary"
      >
        Open Call-Em-All
      </Button>
      <Drawer
        anchor="right"
        open={open}
        classes={{
          paper: classes.drawerContainer,
        }}
        onClose={toggleOpen}
        width="60%"
      >
        <AppBar position="static" className={classes.drawerAppBar}>
          <Typography variant="h6" className={classes.title}>
            Call-Em-All Integration
          </Typography>
        </AppBar>
        <div className={classes.textInput}>
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
            className={classes.button}
            variant="contained"
            color="primary"
          >
            GO
          </Button>
        </div>
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
    </div>
  );
}

export default App;
