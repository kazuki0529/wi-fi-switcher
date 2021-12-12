import os

from seleniumbase import BaseCase


class AppTest(BaseCase):
    def test_wifi_off(self):
        # ログ用に改行
        print()
        self.set_default_timeout(60)

        user = os.environ['ROUTER_USER_NAME']
        password = os.environ['ROUTER_PASSWORD']
        self.open(f'http://{user}:{password}@ntt.setup/ntt/wireless/fifth/common2-4ghz')

        self.click('#SSID2_EDIT_BUTTON', timeout=60)
        self.save_screenshot_to_logs('before.png')

        if self.is_checked('#MAC_FILTER_FLAG'):
            print('The MAC address filter setting is already enabled.')
            return

        print('Enables the MAC address filter setting.')
        self.check_if_unchecked('#MAC_FILTER_FLAG')
        self.save_screenshot_to_logs('after.png')
        self.click('#SETTING_BUTTON', timeout=60)
