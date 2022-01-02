import { Container, AppBar, Toolbar, Typography, Fab } from '@mui/material'
import RequestList from './components/RequestList'
import AddIcon from '@mui/icons-material/Add';

function App() {
  return (
    <div className="App">
      <AppBar position='static'>
        <Toolbar>
          <Typography variant="h6" component="div">
            ゲームプレイ申請
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <RequestList />
      </Container>
      <Fab color="primary" aria-label="add" sx={{
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
      }}>
        <AddIcon />
      </Fab>
    </div>

  );
}

export default App;
