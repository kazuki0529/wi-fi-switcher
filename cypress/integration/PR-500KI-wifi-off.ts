/// <reference types="cypress" />

it('Wi-Fi Off', () => {
  cy.visit('http://ntt.setup/ntt/wireless/fifth/common2-4ghz/', {
    auth: {
      username: 'user',
      password: 'tod2judas',
    },
  });
  cy.get('#ssidFlag').uncheck();
  cy.get('#SETTING_BUTTON').click();
});
