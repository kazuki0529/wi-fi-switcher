import React, { useState } from 'react';
import moment from 'moment'
import jaLocale from 'date-fns/locale/ja';
import { Stack, TextField, DialogProps, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import { useRequest } from '../hooks/Request';
import LoadingButton from '@mui/lab/LoadingButton';

interface RequestProps extends DialogProps {
  onClose: (created: boolean) => void;
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
              mask='____/__/__ __:__'
              value={start}
              onChange={(value) => {
                setStart(value as string);
              }}
            />
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="終了日時"
              value={end}
              mask='____/__/__ __:__'
              onChange={(value) => {
                setEnd(value as string);
              }}
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={request.loading} variant='outlined' color='error' onClick={() => props.onClose(false)}>閉じる</LoadingButton>
        <LoadingButton loading={request.loading} variant='contained' color='success' onClick={() => {
          request.create({
            start: moment(start),
            end: moment(end)
          }).finally(() => {
            props.onClose(true);
          })
        }}>申請</LoadingButton>
      </DialogActions>
    </Dialog >
  );
};

export default Request;
