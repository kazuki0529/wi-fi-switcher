import { Container, AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import RequestList from './components/RequestList'
import Amplify from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { awsConfig } from './awsConfig';
import '@aws-amplify/ui-react/styles.css';
import './App.css'

Amplify.configure(awsConfig);

function App() {
  return (
    <div>
      <Authenticator variation="modal">
        {({ signOut }) => (
          <div className="App">
            <AppBar position='static'>
              <Toolbar>
                <IconButton size="large" color="inherit">
                  <SportsEsportsIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                >
                  ゲームプレイ申請
                </Typography>
                <Box sx={{ flexGrow: 0 }}>
                  <IconButton
                    size="large"
                    aria-haspopup="true"
                    color="inherit"
                    onClick={signOut}>
                    <LogoutIcon />
                  </IconButton>
                </Box>
              </Toolbar>
            </AppBar>
            <Container>
              <RequestList />
            </Container>
          </div>
        )}
      </Authenticator >
    </div>
  );
}

export default App;
