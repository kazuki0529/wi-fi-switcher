import os

from seleniumbase import BaseCase


class AppTest(BaseCase):
    def test_wifi_on(self):
        # ログ用に改行
        print()
        self.set_default_timeout(60)

        user = os.environ['ROUTER_USER_NAME']
        password = os.environ['ROUTER_PASSWORD']
        self.open(f'http://{user}:{password}@ntt.setup/ntt/wireless/fifth/common2-4ghz')

        self.click('#SSID2_EDIT_BUTTON')
        self.save_screenshot_to_logs('before.png')

        if not self.is_checked('#MAC_FILTER_FLAG'):
            print('The MAC address filter setting is already disabled.')
            return

        print('Disables the MAC address filter setting.')
        self.uncheck_if_checked('#MAC_FILTER_FLAG')
        self.save_screenshot_to_logs('after.png')
        self.click('#SETTING_BUTTON')
