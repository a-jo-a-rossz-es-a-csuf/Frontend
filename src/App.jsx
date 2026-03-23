import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Kosar from './Kosar'
import Admin from './Admin'
import Header from './Header'
import Alvazszamkereso from './Alvazszamkereso'
import Bejelentkezes from './Bejelentkezes'
import Cikkszam from './Cikkszam'
import Folyadekok from './Folyadekok'
import Motor from './Motor'
import Register from './Register'
import Segitsegkeres from './Segitsegkeres'
import Szemely from './Szemely'
import Teher from './Teher'



export default function App() {


  return (
    <BrowserRouter>

      <Header/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kosar" element={<Kosar />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/alvazszamkereso" element={<Alvazszamkereso />} />
        <Route path="/bejelentkezes" element={<Bejelentkezes />} />
        <Route path="/cikkszam" element={<Cikkszam />} />
        <Route path="/folyadekok" element={<Folyadekok />} />
        <Route path="/motor" element={<Motor />} />
        <Route path="/register" element={<Register />} />
        <Route path="/segitsegkeres" element={<Segitsegkeres />} />
        <Route path="/szemely" element={<Szemely />} />
        <Route path="/teher" element={<Teher />} />


      </Routes>

    </BrowserRouter>
  )
}
