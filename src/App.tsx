import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex min-h-screen items-center justify-center">
              <h1 className="text-2xl font-semibold text-gradient-faciloop">
                Faciloop CRM — En construction
              </h1>
            </div>
          }
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
