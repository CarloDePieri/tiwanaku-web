import ReactDOM from "react-dom/client"
import { PersistGate } from "redux-persist/integration/react"
import App from "./App.tsx"
import { Provider } from "react-redux"
import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"
import { persistor, store } from "./app/store.ts"

ReactDOM.createRoot(document.getElementById("root")!).render(
  // TODO reactivate strict mode
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  // </React.StrictMode>,
)
