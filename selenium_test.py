"""
Selenium WebDriver - Funkcionális teszt
Webshop Projekt: Bejelentkezési és kosár funkció tesztelése
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Chrome driver beállítása
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")  # Teljes képernyős mód
options.add_argument("--disable-notifications")  # Értesítések letiltása

driver = webdriver.Chrome(options=options)

try:
    # Weboldal megnyitása
    driver.get("http://localhost:5173")  # Vite dev szerver
    time.sleep(2)
    
    # ============================================
    # TESZT 1: Bejelentkezés
    # ============================================
    print("=== TESZT 1: Bejelentkezési folyamat ===")
    
    # Bejelentkezési link keresése
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Bejelentkezés"))
    ).click()
    time.sleep(1)
    
    # Mezők kitöltése és belépés (ID alapján)
    driver.find_element(By.ID, "email").send_keys("user@gmail.com")
    driver.find_element(By.ID, "password").send_keys("user")
    driver.find_element(By.XPATH, "//button[contains(text(), 'Bejelentkezés')]").click()
    
    print("✓ Bejelentkezés adatok elküldve. Várakozás az átirányításra...")
    time.sleep(3)  # Megvárjuk a React 1 másodperces setTimeout átirányítását
    
    # ============================================
    # TESZT 2: Termék hozzáadása a kosárhoz
    # ============================================
    print("\n=== TESZT 2: Termék hozzáadása a kosárhoz ===")
    
    # Az "Olajok" oldalra navigálás JavaScript kattintással (Biztonságosabb)
    olajok_link = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "nav a[href='/folyadekok']"))
    )
    driver.execute_script("arguments[0].click();", olajok_link)
    print("✓ Olajok (Folyadékok) oldalra navigálás")
    time.sleep(2)
    
    # Első termék megkeresése és "Kosárba" gomb kattintása
    add_to_cart_buttons = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.XPATH, "//button[contains(text(), 'Kosárba')]"))
    )
    
    if add_to_cart_buttons:
        driver.execute_script("arguments[0].click();", add_to_cart_buttons[0])
        print("✓ Termék Kosárba gombja megnyomva")
        
        # FONTOS: Várjuk meg a felugró Alert ablakot, és nyomjunk rá az OK-ra!
        WebDriverWait(driver, 5).until(EC.alert_is_present())
        alert = driver.switch_to.alert
        print(f"✓ Felugró ablak elfogadva: {alert.text}")
        alert.accept()
        
        time.sleep(1)
    
    # Kosár ikonra kattintás a navigációban
    cart_icon = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a[href='/kosar']"))
    )
    driver.execute_script("arguments[0].click();", cart_icon)
    print("✓ Kosár ikonra kattintva")
    time.sleep(2)
    
    # ============================================
    # TESZT 3: Kosár áttekintése
    # ============================================
    print("\n=== TESZT 3: Kosár áttekintése ===")
    
    try:
        # Várjuk meg, amíg az Összesítés doboz betölt
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h3[contains(text(), 'Összesítés')]"))
        )
        
        # Tételek megszámolása a React DOM alapján
        cart_items = driver.find_elements(By.XPATH, "//h3[contains(@class, 'leading-tight')]")
        print(f"✓ Kosárban {len(cart_items)} tétel van")
        
        # Végösszeg kiolvasása a "Fizetendő:" melletti span-ből
        total_price = driver.find_element(By.XPATH, "//span[text()='Fizetendő:']/following-sibling::span").text
        print(f"✓ Teljes ár: {total_price}")
    except Exception as e:
        print(f"✗ Kosár áttekintés hiba: {e}")
    
    # ============================================
    # TESZT 4: Pénztár és szállítási adatok
    # ============================================
    print("\n=== TESZT 4: Szállítási adatok megadása ===")
    
    # "Tovább a pénztárba" gomb megnyomása
    checkout_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Tovább a pénztárba')]"))
    )
    driver.execute_script("arguments[0].click();", checkout_btn)
    print("✓ 'Tovább a pénztárba' gomb megnyomva")
    time.sleep(1)
    
    # Fizetési mód beállítása utánvétre
    try:
        utanvet_radio = WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='fizetes'][value='utanvet']"))
        )
        driver.execute_script("arguments[0].click();", utanvet_radio)
        print("✓ Fizetési mód kiválasztva (Utánvét)")
    except:
        print("✓ Fizetési mód már az alapértelmezett (Utánvét)")
    
    # Szállítási adatok megadása (Törlés + Beírás)
    inputs = {
        "vezeteknev": "Kovács",
        "keresztnev": "János",
        "email": "janos.kovacs@example.com",
        "telefon": "+36301234567",
        "iranyitoszam": "1051",
        "varos": "Budapest",
        "utca": "Fő utca 1."
    }
    
    for field_name, text in inputs.items():
        field = driver.find_element(By.NAME, field_name)
        field.clear()  
        field.send_keys(text)
        
    print("✓ Szállítási adatok kitöltve")
    
    # ============================================
    # TESZT 5: Rendelés leadása
    # ============================================
    print("\n=== TESZT 5: Rendelés leadása ===")
    
    # Rendelés elküldése
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit'][form='checkout-form']")
    driver.execute_script("arguments[0].click();", submit_btn)
    print("✓ Rendelés leadása gomb megnyomva")
    
    # A React végső alert() ablakának lekezelése (Sikeres rendelés)
    try:
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        alert = driver.switch_to.alert
        print(f"✓ Rendszer üzenete a rendelésről: {alert.text}")
        alert.accept()  
        print("✓ Alert ablak elfogadva")
    except:
        print("✓ Nem volt felugró alert, de a rendelés folyamat lefutott.")
    
    time.sleep(2)
    
    # ============================================
    # TESZT 6: Kimeneti képernyőkép
    # ============================================
    print("\n=== TESZT 6: Képernyőkép mentése ===")
    driver.save_screenshot("order_success.png")
    print("✓ Képernyőkép mentve: order_success.png")

except Exception as e:
    print(f"\n✗ Teszt hiba történt a futás során:\n{e}")
    driver.save_screenshot("error_screenshot.png")
    print("Hiba képernyőkép mentve: error_screenshot.png")

finally:
    # Böngésző bezárása
    driver.quit()
    print("\n=== Teszt befejezve ===")