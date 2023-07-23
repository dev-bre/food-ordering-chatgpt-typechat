import './output.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ChatBot } from './components/Chatbot';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ChatBot />} />
      </Routes>
    </BrowserRouter>
  );
} 