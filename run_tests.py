"""
Webshop Projekt - Python helper script a tesztek futtatásához
"""

import subprocess
import sys
import os

def check_selenium():
    """Ellenőrzi, hogy a Selenium telepítve van-e"""
    try:
        import selenium
        print(f"✓ Selenium verzió: {selenium.__version__}")
        return True
    except ImportError:
        print("✗ Selenium nincs telepítve!")
        print("Telepítés: pip install selenium")
        return False

def run_bun_tests():
    """Bun tesztek futtatása (React frontend)"""
    print("\n=== Bun (React) tesztek futtatása ===\n")
    try:
        # Itt hívjuk meg a bun test-et
        result = subprocess.run(['bun', 'test'], check=True)
        print("✓ Bun tesztek sikeresek")
        return True
    except subprocess.CalledProcessError:
        print("✗ Bun tesztek sikertelenek")
        return False
    except FileNotFoundError:
        print("✗ A 'bun' parancs nem található. Telepítve van a Bun?")
        return False

def run_selenium_test():
    """Selenium tesztek futtatása"""
    print("\n=== Selenium funkcionális tesztek futtatása ===\n")
    
    if not check_selenium():
        return False
    
    try:
        # Fontos: a fájlnak selenium_test.py-nak kell lennie!
        subprocess.run(['python', 'selenium_test.py'], check=True)
        print("✓ Selenium teszt sikeres")
        return True
    except subprocess.CalledProcessError:
        print("✗ Selenium teszt sikertelen")
        return False
    except FileNotFoundError:
        print("✗ A 'selenium_test.py' nem található abban a mappában, ahonnan futtatod.")
        return False

def main():
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║      Autoalkatrész Webshop - Tesztek rendszerfuttatása         ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    
    # NPM/Bun függőségek ellenőrzése
    if not os.path.exists('node_modules'):
        print("\n📦 node_modules nem található, bun install futtatása...\n")
        subprocess.run(['bun', 'install'])
    
    # Bun tesztek (Frontend)
    bun_success = run_bun_tests()
    
    # Selenium tesztek
    selenium_success = True
    if '--selenium' in sys.argv:
        selenium_success = run_selenium_test()
    else:
        print("\nℹ️  A Selenium tesztek futtatása ki lett hagyva.")
        print("   (Futtasd a 'python run_tests.py --selenium' paranccsal, ha azokat is szeretnéd.)")
    
    # Összefoglaló
    print("\n" + "="*60)
    print("TESZTEK ÖSSZEFOGLALÁSA")
    print("="*60)
    print(f"React (Bun) tesztek: {'✓ SIKERES' if bun_success else '✗ SIKERTELEN'}")
    print(f"Selenium tesztek: {'✓ SIKERES' if selenium_success else ('⊘ NEM FUTOTT' if '--selenium' not in sys.argv else '✗ SIKERTELEN')}")
    
    if bun_success and (selenium_success or '--selenium' not in sys.argv):
        print("\n✓ Minden futtatott teszt sikeres!")
        sys.exit(0)
    else:
        print("\n✗ Néhány teszt sikertelen vagy hiányzik!")
        sys.exit(1)

if __name__ == '__main__':
    main()