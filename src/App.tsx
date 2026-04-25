import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Onboarding from './pages/Onboarding'
import FavoritesFunnel from './pages/FavoritesFunnel'
import Applications from './pages/Applications'
import Conversion from './pages/Conversion'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="favorites" element={<FavoritesFunnel />} />
        <Route path="applications" element={<Applications />} />
        <Route path="conversion" element={<Conversion />} />
      </Route>
    </Routes>
  )
}
