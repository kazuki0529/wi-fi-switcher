import React from 'react';
import { useState } from 'react';

import { Button, List, ListItem, ListItemIcon, ListItemText, LinearProgress, Chip, Card, CardContent, CardActions, Typography, Grid, Zoom, Switch, FormGroup, FormControlLabel } from '@mui/material';
import { useRequest } from '../hooks/Request';
import { useRequestList } from '../hooks/RequestList';
import { TransitionGroup } from 'react-transition-group';
import TimerIcon from '@mui/icons-material/Timer';
import CancelIcon from '@mui/icons-material/Cancel';
import StartIcon from '@mui/icons-material/Start';
import CheckIcon from '@mui/icons-material/Check';
import SportsScoreIcon from '@mui/icons-material/SportsScore';


const RequestList: React.FC = () => {
  const request = useRequest();
  const requestList = useRequestList();
  const [showAll, setShowAll] = useState<boolean>(false);

  return (
    <div>
      <FormGroup sx={{ mt: 2 }}>
        <FormControlLabel
          control={<Switch checked={showAll} onChange={(event) => { setShowAll(event.target.checked) }} />}
          label="すべて表示" />
      </FormGroup>
      {requestList.loading || request.loading ? <LinearProgress /> : <div />}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {requestList.data.filter(req => req.status === 'Request' || showAll).map((req) => (
          <Grid item key={req.id} xs={12} md={6}>
            <TransitionGroup>
              <Zoom in={req.status === 'Request' || showAll}>
                <Card>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      <Chip sx={{ mr: 2 }} label={req.status} color={(req.status === 'Request') ? 'error' : (req.status === 'Approve') ? 'success' : 'default'} />
                      {req.start.format('YYYY年MM月DD日')}
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <TimerIcon />
                        </ListItemIcon>
                        <ListItemText primary={req.end.diff(req.start, 'minutes') + '分'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <StartIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={req.start.format("YYYY-MM-DD HH:mm:ss")}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SportsScoreIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={req.end.format("YYYY-MM-DD HH:mm:ss")}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                  <CardActions>
                    <Button variant="outlined" color='success' disabled={req.status !== 'Request' || request.loading} startIcon={<CheckIcon />}
                      onClick={() => {
                        request.approve(req.id).finally(() => {
                          requestList.reload();
                        });
                      }}
                    >
                      承認
                    </Button>
                    <Button variant="outlined" color='error' disabled={req.status !== 'Request' || request.loading} startIcon={<CancelIcon />}
                      onClick={() => {
                        request.reject(req.id).finally(() => {
                          requestList.reload();
                        });
                      }}
                    >
                      却下
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </TransitionGroup>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default RequestList;
