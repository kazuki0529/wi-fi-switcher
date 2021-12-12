import os

from seleniumbase import BaseCase


class AppTest(BaseCase):
    def test_wifi_off(self):
        # ログ用に改行
        print()
        self.set_default_timeout(60)

        user = os.environ['ROUTER_USER_NAME']
        password = os.environ['ROUTER_PASSWORD']
        self.open(f'http://{user}:{password}@192.168.10.1/wlbasic5.htm')

        self.save_screenshot_to_logs('before.png')

        if self.get_value('#wl_disable1') == '使用しない':
            print('Wi-Fi is already disabled.')
            return

        self.select_option_by_text('#wl_disable1', '使用しない')
        self.save_screenshot_to_logs('after.png')
        print('Disables the Wi-Fi.')

        self.submit('form[name="wlanSetup"]')
        self.accept_alert()

        self.click('#restartNow')
