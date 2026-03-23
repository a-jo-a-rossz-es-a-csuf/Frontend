// =============================================
// AUTOPARTS PRO - ADATBÁZIS KEZELŐ
// PHP/MySQL Backend API kapcsolat
// =============================================

const DB = {
  // API URL - ezt állítsd be a saját localhost-odnak megfelelően
  API_URL: "http://127.0.0.1/autoparts/api",

  // Token tárolása
  token: localStorage.getItem("authToken"),
  user: JSON.parse(localStorage.getItem("currentUser") || "null"),

  // =============================================
  // AUTENTIKÁCIÓ
  // =============================================

  async login(felhasznalonev, jelszo) {
    try {
      const response = await fetch(`${this.API_URL}/auth.php?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ felhasznalonev, jelszo }),
      })
      const data = await response.json()

      if (data.success) {
        this.token = data.token
        this.user = data.user
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("currentUser", JSON.stringify(data.user))
      }
      return data
    } catch (error) {
      console.error("Login error:", error)
      return { error: "Kapcsolódási hiba" }
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${this.API_URL}/auth.php?action=register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      return await response.json()
    } catch (error) {
      console.error("Register error:", error)
      return { error: "Kapcsolódási hiba" }
    }
  },

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
  },

  isLoggedIn() {
    return !!this.token && !!this.user
  },

  isAdmin() {
    return this.user && this.user.szerepkor === "admin"
  },

  // =============================================
  // AUTÓK
  // =============================================

  async getMarkak() {
    try {
      const response = await fetch(`${this.API_URL}/cars.php?action=markak`)
      return await response.json()
    } catch (error) {
      console.error("Márkák betöltési hiba:", error)
      // Fallback adatok ha nincs backend
      return [
        { id: 1, nev: "BMW", aktiv: 1 },
        { id: 2, nev: "Audi", aktiv: 1 },
        { id: 3, nev: "Mercedes-Benz", aktiv: 1 },
      ]
    }
  },

  async getModellek(markaId) {
    try {
      const response = await fetch(`${this.API_URL}/cars.php?action=modellek&marka_id=${markaId}`)
      return await response.json()
    } catch (error) {
      console.error("Modellek betöltési hiba:", error)
      return []
    }
  },

  async getMotorok(modellId) {
    try {
      const response = await fetch(`${this.API_URL}/cars.php?action=motorok&modell_id=${modellId}`)
      return await response.json()
    } catch (error) {
      console.error("Motorok betöltési hiba:", error)
      return []
    }
  },

  async getKategoriak() {
    try {
      const response = await fetch(`${this.API_URL}/cars.php?action=kategoriak`)
      return await response.json()
    } catch (error) {
      console.error("Kategóriák betöltési hiba:", error)
      return []
    }
  },

  // =============================================
  // TERMÉKEK
  // =============================================

  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams(filters)
      const response = await fetch(`${this.API_URL}/products.php?action=list&${params}`)
      return await response.json()
    } catch (error) {
      console.error("Termékek betöltési hiba:", error)
      return []
    }
  },

  async getProduct(id) {
    try {
      const response = await fetch(`${this.API_URL}/products.php?action=get&id=${id}`)
      return await response.json()
    } catch (error) {
      console.error("Termék betöltési hiba:", error)
      return null
    }
  },

  async searchByOE(oeNumber) {
    try {
      const response = await fetch(`${this.API_URL}/products.php?action=search_oe&oe=${encodeURIComponent(oeNumber)}`)
      return await response.json()
    } catch (error) {
      console.error("OE keresési hiba:", error)
      return []
    }
  },

  async createProduct(productData) {
    try {
      const response = await fetch(`${this.API_URL}/products.php?action=create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(productData),
      })
      return await response.json()
    } catch (error) {
      console.error("Termék létrehozási hiba:", error)
      return { error: "Kapcsolódási hiba" }
    }
  },

  async updateProduct(productData) {
    try {
      const response = await fetch(`${this.API_URL}/products.php?action=update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(productData),
      })
      return await response.json()
    } catch (error) {
      console.error("Termék frissítési hiba:", error)
      return { error: "Kapcsolódási hiba" }
    }
  },

  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.API_URL}/products.php?action=delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ id }),
      })
      return await response.json()
    } catch (error) {
      console.error("Termék törlési hiba:", error)
      return { error: "Kapcsolódási hiba" }
    }
  },
}

// Globális hozzáférhetőség
window.DB = DB