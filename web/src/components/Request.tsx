import React, { useState } from 'react';
import moment from 'moment'
import jaLocale from 'date-fns/locale/ja';
import { Stack, TextField, Button, DialogProps, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import { useRequest } from '../hooks/Request';

interface RequestProps extends DialogProps {
  onClose: () => void;
}

const Request: React.FC<RequestProps> = (props: RequestProps) => {
  const [start, setStart] = useState<string>(
    moment().add(30, 'minutes').local().format('YYYY/MM/DD HH:mm')
  )
  const [end, setEnd] = useState<string>(moment().add(120 + 30, 'minutes').local().format('YYYY/MM/DD HH:mm'))
  const request = useRequest();

  return (
    <Dialog
      {...props}
    >
      <DialogTitle>申請</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          ゲームで遊ぶ期間を入力してください。
        </DialogContentText>

        <LocalizationProvider dateAdapter={AdapterDateFns} locale={jaLocale}>
          <Stack spacing={2}>
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="開始日時"
              value={start}
              onChange={(value) => {
                setStart(value as string);
              }}
            />
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="終了日時"
              value={end}
              onChange={(value) => {
                setEnd(value as string);
              }}
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button disabled={request.loading} variant='outlined' color='error' onClick={props.onClose}>閉じる</Button>
        <Button disabled={request.loading} variant='contained' color='success' onClick={() => {
          request.create({
            start: moment(start),
            end: moment(end)
          }).finally(() => {
            props.onClose();
          })
        }}>申請</Button>
      </DialogActions>
    </Dialog >
  );
};

export default Request;
