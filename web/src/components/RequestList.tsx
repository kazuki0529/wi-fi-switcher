import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import StartIcon from '@mui/icons-material/Start';
import TimerIcon from '@mui/icons-material/Timer';
import LoadingButton from '@mui/lab/LoadingButton';
import { Fade, Alert, AlertTitle, Fab, List, ListItem, ListItemIcon, ListItemText, LinearProgress, Chip, Card, CardContent, CardActions, Typography, Grid, Zoom, Switch, FormGroup, FormControlLabel } from '@mui/material';
import moment from 'moment';
import React from 'react';

import { TransitionGroup } from 'react-transition-group';
import { useLogonUser } from '../hooks/LoginUser';
import { useRequest } from '../hooks/Request';
import { useRequestList } from '../hooks/RequestList';
import { Request as RequestType } from '../type/Request';
import Request from './Request';

const calcStartTime = (request: RequestType) => {
  if (request.status !== 'Request') return '処理済み';

  const diffStart = request.start.diff(moment(), 'minutes');
  const diffEnd = request.end.diff(moment(), 'minutes');
  if (diffStart > 0) return `${diffStart} 分後に開始予定`;
  if (diffEnd > 0) return `${-1 * diffStart} 分過ぎています`;

  return 'ゲームプレイ予定の時間が過ぎています';
};

const RequestList: React.FC = () => {
  const request = useRequest();
  const requestList = useRequestList();

  const { userInfo } = useLogonUser();
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [showAll, setShowAll] = React.useState<boolean>(false);

  return (
    <div>
      <FormGroup sx={{ mt: 2 }}>
        <FormControlLabel
          control={<Switch checked={showAll} onChange={(event) => { setShowAll(event.target.checked); }} />}
          label="すべて表示" />
      </FormGroup>
      <Fade in={requestList.loading || request.loading}>
        <LinearProgress />
      </Fade>

      {(requestList.data.filter(req => req.status === 'Request').length === 0 && !requestList.loading && !showAll) ?
        <Zoom in={requestList.data.filter(req => req.status === 'Request').length === 0 && !requestList.loading && !showAll}>
          <Alert severity="info">
            <AlertTitle>Info</AlertTitle>
            現在承認するゲームプレイ申請はありません。
          </Alert>
        </Zoom> : <div />
      }

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {requestList.data.filter(req => req.status === 'Request' || showAll).map((req) => (
          <Grid item key={req.id} xs={12} md={6}>
            <TransitionGroup>
              <Zoom in={req.status === 'Request' || showAll}>
                <Card>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      <Chip sx={{ mr: 2 }} label={req.status} color={(req.status === 'Request') ? 'error' : (req.status === 'Approve') ? 'success' : 'default'} />
                      {calcStartTime(req)}
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
                          primary={req.start.local().format('YYYY-MM-DD HH:mm:ss')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SportsScoreIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={req.end.local().format('YYYY-MM-DD HH:mm:ss')}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                  {userInfo?.attributes?.profile === 'APPROVER' ?
                    <CardActions>
                      <LoadingButton variant="outlined" color='success' loading={request.loading} disabled={req.status !== 'Request'} startIcon={<CheckIcon />}
                        onClick={() => {
                          request.approve(req.id).finally(() => {
                            requestList.reload();
                          });
                        }}
                      >
                        承認
                      </LoadingButton>
                      <LoadingButton variant="outlined" color='error' loading={request.loading} disabled={req.status !== 'Request'} startIcon={<CancelIcon />}
                        onClick={() => {
                          request.reject(req.id).finally(() => {
                            requestList.reload();
                          });
                        }}
                      >
                        却下
                      </LoadingButton>
                    </CardActions>
                    : <div />}
                </Card>
              </Zoom>
            </TransitionGroup>
          </Grid>
        ))}
      </Grid>

      <Fab color="primary" aria-label="add" onClick={() => setShowForm(true)} sx={{
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
      }}>
        <AddIcon />
      </Fab>
      <Request open={showForm} onClose={(created) => { if (created) requestList.reload(); setShowForm(false); }} />
    </div>
  );
};

export default RequestList;
