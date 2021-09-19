/// <reference types="cypress" />

it('Wi-Fi On', () => {
  cy.visit('http://ntt.setup/ntt/wireless/fifth/common2-4ghz/', {
    auth: {
      username: 'user',
      password: 'tod2judas',
    },
  });
  cy.get('#ssidFlag').check();
  cy.get('#SETTING_BUTTON').click();
});
