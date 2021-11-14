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
      startDate: {
        picker: false,
        value: moment().format("YYYY-MM-DD"),
      } ,
      startTime: {
        picker: false,
        value: moment().format("HH:mm"),
      },
      endDate: {
        picker: false,
        value: moment().add(2, 'hours').format("YYYY-MM-DD"),
      } ,
      endTime: {
        picker: false,
        value: moment().add(2, 'hours').format("HH:mm"),
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
    },
    calcEndDateTime() {
      this.requestForm.startDate.picker = false

      const end = moment(`${item.startDate.value} ${item.startTime.value}`).add(2, 'hours');
      this.requestForm.endDate.value = end.format('YYYY-MM-DD')
      this.requestForm.endTime.value = end.format('HH:mm')
    },
  },
  methods: {
    getStatusColor(item) {
      return STATUS_COLOR[item.status]
    },
    getRequests() {
      this.gamePlay.loading = true;
      axios.get(
        '/api/v1/requests',
      ).then(
        (response) => this.gamePlay.data = response.data.map(e => ({
          ...e,
          ...{
            start: moment(e.start),
            end: moment(e.end),
            createdAt: moment(e.createdAt),
            updatedAt: moment(e.updatedAt),
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
    showRequestForm() {
      const now = moment();
      const end = now.clone().add(2, 'hours');

      this.requestForm.startDate.value = now.format('YYYY-MM-DD')
      this.requestForm.startTime.value = now.format('HH:mm')
      this.requestForm.endDate.value = end.format('YYYY-MM-DD')
      this.requestForm.endTime.value = end.format('HH:mm')

      this.requestForm.dialog = !this.requestForm.dialog;
    },
    addRequest(item) {
      axios.post(
        '/api/v1/requests',
        {
          start: moment(`${item.startDate.value} ${item.startTime.value}`).toISOString(),
          end: moment(`${item.endDate.value} ${item.endTime.value}`).toISOString(),
          status: 'Request',
        }
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
        () => {
          this.gamePlay.saving = false
          // 一覧更新
          this.getRequests()
        }
      );

      // 一覧更新
      this.getRequests()
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
        axios.put(
          `/api/v1/requests/${item['id']}`,
          {
            status: 'Approve',
          }
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
          () => {
            this.gamePlay.saving = false
            // 一覧更新
            this.getRequests()
          }
        );
      } else {
        this.failure.show = true;
        this.failure.message = '認証用コードが一致しませんでした。この操作は記録されます。';
      }
    },
    reject(item) {
      axios.put(
        `/api/v1/requests/${item['id']}`,
        {
          status: 'Rejected',
        }
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
        () => {
          this.gamePlay.saving = false
          // 一覧更新
          this.getRequests()
        }
      );
    }
  }
});
