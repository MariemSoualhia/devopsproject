describe("S'inscrire - Traitement de tous les cas de connexions", () => {
  beforeEach(() => {
    window.localStorage.removeItem("token");
    cy.visit("http://localhost:5173/register");
  });

  it("pour une inscription valide", () => {
    cy.getByData("name").type("test4");
    cy.getByData("email").type("test4@gmail.com");
    cy.getByData("password").type("admin123");
    cy.getByData("connect").click();
    cy.visit("http://localhost:5173/login");
    cy.getByData("email").type("test4@gmail.com");
    cy.getByData("password").type("admin123");
    cy.getByData("connect").click();
    cy.location("pathname").should("eq", "/");
  });
});
