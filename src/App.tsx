import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthGate } from './components/AuthGate'
import { FridayView } from './routes/FridayView'
import { Household } from './routes/Household'
import { EditVisit, LogVisit } from './routes/LogVisit'
import { NotFound } from './routes/NotFound'
import { PlaceDetail } from './routes/PlaceDetail'
import { WantToTry } from './routes/WantToTry'
import { DataProvider } from './state/DataProvider'

export default function App() {
  return (
    <DataProvider>
      <AuthGate>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<FridayView />} />
              <Route path="want" element={<WantToTry />} />
              <Route path="household" element={<Household />} />
              <Route path="log" element={<LogVisit />} />
              <Route path="visit/:visitId" element={<EditVisit />} />
              <Route path="place/:placeId" element={<PlaceDetail />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthGate>
    </DataProvider>
  )
}
