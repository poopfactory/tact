import { StrictMode, type ReactElement } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import BrandStory from './pages/BrandStory'
import Studio from './pages/Studio'
import Video from './pages/Video'

// Every route runs under StrictMode except /studio — see main.tsx for why.
function strict(element: ReactElement) {
  return <StrictMode>{element}</StrictMode>
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={strict(<Home />)} />
        <Route path="/shop" element={strict(<Shop />)} />
        <Route path="/brand" element={strict(<BrandStory />)} />
        <Route path="/video" element={strict(<Video />)} />
        <Route path="/studio" element={<Studio />} />
      </Route>
    </Routes>
  )
}
