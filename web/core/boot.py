import logging
import os
from datetime import datetime, timedelta, time

import pandas as pd
import streamlit as st

file = '../../data/schedule.csv'
df = pd.read_csv(file)
df['start'] = pd.to_datetime(df['start'], format='%Y-%m-%d %H:%M:%S')
df['end'] = pd.to_datetime(df['end'], format='%Y-%m-%d %H:%M:%S')


# ページ内のタイトル
st.set_page_config(page_title='ゲームプレイ申請', page_icon=':video_game:')
st.title('ゲームプレイ申請')
st.header('新規申請', anchor="new_request")


# 今日どれくらいやる予定か表示する
today = datetime(*datetime.now().timetuple()[:3])
today_request = df.query(f'start >= "{today}" and start < "{today + timedelta(days=1)}"')
if len(today_request) > 0:
    play_sec = today_request.apply(lambda x: (x['end'] - x['start']).total_seconds(), axis=1).sum()
    st.info(f'本日は {time(hour=int(play_sec / 60 / 60), minute=int(play_sec / 60 % 60), second=int(play_sec % 60))} 分のゲームプレイ申請をしています。')

now = datetime.now()
with st.container():
    start = datetime.combine(
        st.date_input(label='開始日', value=now, min_value=now),
        st.time_input(label='開始時間', value=now)
    )

end = start
end = datetime.combine(
    st.date_input(label='終了日', value=end, min_value=start),
    st.time_input(label='終了時間', value=end)
)

# TODO: 23時とかにゲームやらないようにチェックする
if (end - start).total_seconds() <= 2 * 60 * 60 + 10 * 60:  # 2時間 + 10分（バッファ）
    if st.button('申請'):
        df = df.append({
            'start': start,
            'end': end,
            'status': 'Request'
        }, ignore_index=True)
        df.to_csv(file, index=False)
        logging.info(f'申請が行われました。（申請期間：{start} ～ {end}）')
        st.success('申請内容を登録しました。LINEで承認依頼の連絡してください。')
else:
    st.error('一度にプレイできるゲーム時間は2時間です。')

with st.expander("承認済みの申請を表示する"):
    st.dataframe(df.query('status == "Approve"').sort_values('start', ascending=False))


st.header('申請承認', anchor="request_list")
st.subheader('未承認一覧', anchor='approve')

# 未承認の一覧
st.table(df.query('status != "Approve"'))

st.subheader('承認', anchor='approve')

num = st.number_input(label='対象番号', value=(len(df) - 1), min_value=0, max_value=(len(df) - 1))
password = st.text_input(label='承認コード', type='password')
col1, col2 = st.columns(2)

with col1:
    approved = st.button('承認')
with col2:
    rejected = st.button('却下')

try:
    if approved:
        if password == os.environ['APPROVE_CODE']:
            # NOTE: 承認ステータスに変更して保存する
            df.at[num, 'status'] = 'Approve'
            df.to_csv(file, index=False)
            st.success('承認しました。')
        else:
            raise RuntimeError('承認コードが不適切です。この操作は記録されました。')

    if rejected:
        pass
except RuntimeError as e:
    st.error(e)
    logging.error(e)
