/// <reference types="cypress" />

it('Wi-Fi Off', () => {
  cy.visit('http://ntt.setup/ntt/wireless/fifth/common2-4ghz', {
    auth: {
      username: Cypress.env('USER_NAME'),
      password: Cypress.env('PASSWORD'),
    },
  })
  cy.get('#SSID2_EDIT_BUTTON').click()

  // cy.get('#MAC_FILTER_FLAG').should('not.be.checked')
  cy.get('#MAC_FILTER_FLAG').check()
  cy.get('#SETTING_BUTTON').click()

  cy.on('window:confirm', () => true)
})
