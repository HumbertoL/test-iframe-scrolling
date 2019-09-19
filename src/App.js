import React from "react";
import "./App.css";

import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  appBar: {
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    paddingLeft: theme.spacing(2),
    marginBottom: theme.spacing(8),
  },
  drawerAppBar: {
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    paddingLeft: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  drawerContainer: {
    width: '50%'
  },
}));

function App() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const toggleOpen = () => {
    setOpen(!open);
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
          paper: classes.drawerContainer
        }}
        onClose={toggleOpen}
        width="50%"
      >
         <AppBar position="static" className={classes.drawerAppBar}>
            <Typography variant="h6" className={classes.title}>
              Call-Em-All Integration
            </Typography>
          </AppBar>
         <Container style={{height: '100%'}}>
          <div style={{ width: 850, display: 'flex', flexGrow: 1, height: '99%'}}>
            <iframe
              title="CEA SSO test"
              width="850px"
              height="620px"
              scrolling="no"
              src="http://localhost:3000/conversations"
            />
          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default App;
