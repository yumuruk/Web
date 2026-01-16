import { createRoot } from 'react-dom/client'
// index.css가 파일이 있다면 놔두시고, 없으면 이 줄도 지우세요.
import './index.css' 
import InterviewInterface from './InterviewInterface.jsx'

createRoot(document.getElementById('root')).render(
    <InterviewInterface />
)