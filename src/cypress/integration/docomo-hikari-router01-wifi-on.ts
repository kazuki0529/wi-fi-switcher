/// <reference types="cypress" />

it('Wi-Fi On', () => {
  cy.visit('http://192.168.1.2/wlbasic5.htm', {
    auth: {
      username: Cypress.env('USER_NAME'),
      password: Cypress.env('PASSWORD'),
    },
  })
  // cy.get('#wl_disable1').should('have.value', 'OFF')

  cy.get('#wl_disable1').select('使用する')

  cy.get('form[name="wlanSetup"]').submit()
  cy.on('window:confirm', () => true)

  cy.get('#restartNow').click()
})
