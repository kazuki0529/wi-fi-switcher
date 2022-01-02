import { Container, AppBar, Toolbar, Typography } from '@mui/material'
import RequestList from './components/RequestList'

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
    </div>

  );
}

export default App;
