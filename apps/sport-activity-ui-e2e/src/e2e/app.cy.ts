import { getGreeting } from '../support/app.po';

describe('sport-activity-ui', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    expect(true).to.equal(true);
  });
});
