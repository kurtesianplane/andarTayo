import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AlertProvider } from './context/AlertContext'
import { DarkModeProvider } from './context/DarkModeContext'

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props); this.state={hasError:false,error:null};
  }
  static getDerivedStateFromError(error){ return {hasError:true,error}; }
  componentDidCatch(err,info){ console.error('App error boundary', err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
          <div className="text-6xl mb-4">💥</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm mb-4 max-w-sm">An unexpected error occurred. Try reloading the app. If it persists, clear site data.</p>
          <button onClick={()=>window.location.reload()} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Reload</button>
          {process.env.NODE_ENV!=='production' && this.state.error && (
            <pre className="mt-6 max-w-md text-left text-xs bg-neutral-900/80 text-neutral-100 p-3 rounded overflow-auto">
{this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider>
      <AlertProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AlertProvider>
    </DarkModeProvider>
  </React.StrictMode>,
)
