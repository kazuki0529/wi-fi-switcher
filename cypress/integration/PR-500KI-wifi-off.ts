/// <reference types="cypress" />

it('Wi-Fi Off', () => {
  cy.visit('http://ntt.setup/', {
    auth: {
      username: 'user',
      password: 'tod2judas',
    },
  });
  cy.visit('http://ntt.setup/ntt/wireless/fifth/common', {
    auth: {
      username: 'user',
      password: 'tod2judas',
    },
  });
  cy.get('#WLAN_AP_SETTING_2_4GHz_CHECK').uncheck();
  cy.get('#WLAN_AP_SETTING_SET').click();
});
