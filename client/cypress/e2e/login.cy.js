describe("Se connecter - Traitement de tous les cas de connexions", () => {
  beforeEach(() => {
    window.localStorage.removeItem("token");
    cy.visit("http://localhost:5173/login");
  });

  it("Affiche une erreur pour une connexion valide", () => {
    cy.getByData("email").type("mariem@gmail.com");
    cy.getByData("password").type("admin123");
    cy.getByData("connect").click();
    cy.location("pathname").should("eq", "/");
  });
});
