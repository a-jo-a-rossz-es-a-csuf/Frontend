import React from 'react';
import { Link } from 'react-router-dom';

const Aszf = () => {
    // Aktuális dátum generálása a frissítéshez
    const currentDate = new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto">
                
                {/* Fejléc szekció */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-4">
                        Általános <span className="text-red-600">Szerződési Feltételek</span>
                    </h1>
                    <p className="text-gray-500 italic">Utolsó frissítés: {currentDate}</p>
                    <div className="h-1 w-20 bg-red-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Tartalom kártya */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    
                    {/* Gyors navigáció / Tartalomjegyzék */}
                    <div className="bg-gray-900 p-6 text-white">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                            Gyors navigáció
                        </h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                            <li><a href="#uzemelteto" className="hover:text-red-400 transition underline decoration-gray-700">1. Üzemeltetői adatok</a></li>
                            <li><a href="#rendeles" className="hover:text-red-400 transition underline decoration-gray-700">2. A rendelés menete</a></li>
                            <li><a href="#arak" className="hover:text-red-400 transition underline decoration-gray-700">3. Árak és fizetés</a></li>
                            <li><a href="#szallitas" className="hover:text-red-400 transition underline decoration-gray-700">4. Szállítási feltételek</a></li>
                            <li><a href="#elallas" className="hover:text-red-400 transition underline decoration-gray-700">5. Elállási jog</a></li>
                            <li><a href="#garancia" className="hover:text-red-400 transition underline decoration-gray-700">6. Garancia és szavatosság</a></li>
                        </ul>
                    </div>

                    <div className="p-8 sm:p-12 space-y-10 leading-relaxed">
                        
                        {/* 1. Szekció */}
                        <section id="uzemelteto">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-4">1. Üzemeltetői adatok</h3>
                            <p className="mb-4 text-gray-600">
                                A jelen webáruházat (<strong>AutoParts Pro</strong>) az alábbi gazdasági társaság üzemelteti:
                            </p>
                            <ul className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <li><strong>Név:</strong> AutoParts Pro Kereskedelmi Kft.</li>
                                <li><strong>Székhely:</strong> 1111 Budapest, Autó út 42.</li>
                                <li><strong>Cégjegyzékszám:</strong> 01-09-123456</li>
                                <li><strong>Adószám:</strong> 12345678-2-42</li>
                                <li><strong>Email:</strong> info@autopartspro.hu</li>
                            </ul>
                        </section>

                        {/* 2. Szekció */}
                        <section id="rendeles">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-4">2. A rendelés menete</h3>
                            <p className="text-gray-600">
                                A vásárlás regisztrációhoz kötött, melynek során a felhasználó köteles a valós adatait megadni. A kiválasztott termékeket a kosárba helyezve, a szállítási és számlázási adatok megadása után küldhető el a végleges megrendelés. A rendelésről a rendszer automatikus visszaigazolást küld.
                            </p>
                        </section>

                        {/* 3. Szekció */}
                        <section id="arak">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-4">3. Árak és fizetés</h3>
                            <p className="text-gray-600">
                                A webshopban feltüntetett árak bruttó árak, az ÁFA-t tartalmazzák. A fizetés történhet online bankkártyával, előre utalással vagy utánvéttel a futárnál. Fenntartjuk a jogot az árak módosítására, de ez a már visszaigazolt rendeléseket nem érinti.
                            </p>
                        </section>

                        {/* 4. Szekció */}
                        <section id="szallitas">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-4">4. Szállítási feltételek</h3>
                            <p className="text-gray-600">
                                A kiszállítást szerződött logisztikai partnereink végzik (GLS, MPL). A várható szállítási idő raktáron lévő termékek esetén 1-3 munkanap. A szállítási díj a rendelési érték függvényében változhat, melyről a pénztár folyamat során tájékoztatjuk.
                            </p>
                        </section>

                        {/* 5. Szekció */}
                        <section id="elallas">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-4">5. Elállási jog</h3>
                            <p className="text-gray-600">
                                A fogyasztót a termék kézhezvételétől számított <strong>14 naptári napon belül</strong> indokolás nélküli elállási jog illeti meg. Elállás esetén a terméket sértetlen állapotban, eredeti csomagolásban kell visszajuttatni telephelyünkre. A visszaküldés költsége a vásárlót terheli.
                            </p>
                        </section>

                        {/* 6. Szekció */}
                        <section id="garancia">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-4">6. Garancia és szavatosság</h3>
                            <p className="text-gray-600">
                                Az autóalkatrészekre a hatályos jogszabályok szerinti jótállást vállaljuk. Felhívjuk figyelmét, hogy a nem szakszerű beszerelésből eredő meghibásodásokra a garancia nem vonatkozik. Javasoljuk, hogy az alkatrészek beépítését minden esetben szakműhelyben végeztesse el.
                            </p>
                        </section>

                    </div>

                    {/* Footer a kártyában */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                        <span className="text-gray-500 italic">AutoParts Pro © 2026 - Minden jog fenntartva.</span>
                        <Link to="/" className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Vissza a főoldalra
                        </Link>
                    </div>
                </div>

                {/* Extra apróbetűs rész */}
                <p className="text-center text-[10px] text-gray-400 mt-6 px-10">
                    A fenti dokumentum tájékoztató jellegű. Valódi üzleti tevékenység esetén javasoljuk jogi szakértő bevonását a pontos, törvényi előírásoknak megfelelő ÁSZF elkészítéséhez.
                </p>
            </div>
        </div>
    );
};

export default Aszf;