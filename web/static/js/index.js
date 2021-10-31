const STATUS_COLOR = {
  'Approve': '#2E7D32',
  'Request': '#D32F2F',
  'Rejected': '#757575'
}

const store = {
  state: {
    success: {
      show: false,
      message: '',
    },
    failure: {
      show: false,
      message: '',
    },
    approveCode: undefined,
    today: true,
    gamePlay: {
      loading: true,
      saving: true,
      search: '',
      headers: [
        {text: '開始', value:'start'},
        {text: '終了', value:'end'},
        { text: '状態', value: 'status' },
        { text: '操作', value: 'actions', sortable: false },
      ],
      filter: true,
      data: [],
    },
    requestForm: {
      dialog: false,
      date: {
        picker: false,
        value: moment().format("YYYY-MM-DD"),
      } ,
      startTime: {
        picker: false,
        value: moment().format("hh:mm"),
      },
      endTime: {
        picker: false,
        value: moment().add(2, 'hours').format("hh:mm"),
      },
    }
  }
}

new Vue({
  el: '#app',
  data: store.state,
  vuetify: new Vuetify(),
  created: function () {
    this.getRequests();
    this.getApproveCode();
  },
  computed: {
    approveWaitingList() {
      return this.gamePlay.data.filter( e => !this.gamePlay.filter || e.status === 'Request')
    },
    calcPlayTimeByToday() {
      const today = moment();
      return this.gamePlay.data
        .filter(e => today.format('YYYY-MM-DD') === e.start.format('YYYY-MM-DD') && e.status !== 'Rejected')
        .reduce((prev, curr) => prev + curr.end.diff(curr.start, 'hours'), 0)
    }
  },
  methods: {
    getStatusColor(item) {
      return STATUS_COLOR[item.status]
    },
    getRequests() {
      this.gamePlay.loading = true;
      axios.get(
        '/api/requests',
      ).then(
        (response) => this.gamePlay.data = response.data.map(e => ({
          ...e,
          ...{
            start: moment(e.start),
            end: moment(e.end),
          }
        }))
      ).catch(
        (error) => {
          this.failure.show = true;
          this.failure.message = '読み込みに失敗しました。';
        }
      ).finally(
        () => this.gamePlay.loading = false
      );
    },
    saveRequests() {
      this.gamePlay.saving = true;
      axios.post(
        '/api/requests',
        this.gamePlay.data.map((e) => ({
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          status: e.status
        }))
      ).then(
        () => {
          this.success.show = true;
          this.success.message = '保存が成功しました。';
        }
      ).catch(
        (error) => {
          this.failure.show = true;
          this.failure.message = '保存に失敗しました。';
        }
      ).finally(
        () => this.gamePlay.saving = false
      );
    },
    addRequest(item) {
      this.gamePlay.data.push({
        start: moment(`${item.date.value} ${item.startTime.value}`),
        end: moment(`${item.date.value} ${item.endTime.value}`),
        status: 'Request',
        color: STATUS_COLOR['Request']
      });

      this.saveRequests();
      this.requestForm.dialog = false
    },
    getApproveCode() {
      axios.get(
        '/api/approve/code',
      ).then(
        (response) => this.approveCode = response.data
      ).catch(
        (error) => {
          this.failure.show = true;
          this.failure.message = '認証コードの取得に失敗しました。';
        }
      );
    },
    approve(item) {
      if (this.approveCode === window.prompt("承認用コードを入力してください", "")) {
        item.status = 'Approve';
        this.saveRequests();
      } else {
        this.failure.show = true;
        this.failure.message = '認証用コードが一致しませんでした。この操作は記録されます。';
      }
    },
    reject(item) {
      item.status = 'Rejected';
      this.saveRequests();
    }
  }
});
