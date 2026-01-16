import React, { useState } from 'react';
import Webcam from 'react-webcam';

// [필수] CSS 파일 연결
import './InterviewInterface.css';

const InterviewInterface = () => {
  // 상태 관리 (녹화 버튼용)
  const [isRecording, setIsRecording] = useState(false);
  const [prepTime, setPrepTime] = useState('1min');

  return (
    <div className="interview-container">
      {/* 1. 상단 헤더 */}
      <header className="interview-header">
        <div className="question-box">
          Q. 자기소개를 1분 이내로 해주세요
        </div>
        <div className="timer-box">
          01:00
        </div>
      </header>

      {/* 2. 메인 컨텐츠 */}
      <div className="main-content">
        
        {/* 왼쪽: 비디오 영역 */}
        <div className="video-section">
          <div className="video-wrapper">
            
            {/* --- 웹캠 컴포넌트 (AI 없이 순수 캠만) --- */}
            <Webcam
              audio={false}
              mirrored={true}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // 화면 꽉 채우기
                position: 'absolute',
                left: 0,
                top: 0
              }}
            />

            {/* 오버레이 UI */}
            <div className="overlay-layer">
              <div className="fake-waveform">
                 IIlIlIIlIlIIlIlIIlIlIIlIlIIlIlIIl
              </div>
              <button 
                className={isRecording ? "stop-button" : "record-button"}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? "⏹ 중지" : "⏺ 녹화"}
              </button>
              <p className="guide-text">편하게 답변해보세요</p>
            </div>

          </div>
        </div>

        {/* 오른쪽: 사이드바 */}
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3 className="card-title">🏷️ 설정</h3>
            
            <div className="setting-group">
                <p className="setting-label">연결 상태</p>
                <div style={{
                    backgroundColor: '#F3F4F6', 
                    padding: '12px', 
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: '14px'
                }}>
                    📷 카메라 테스트 모드
                </div>
            </div>

            <hr className="divider" />

            <div className="setting-group">
              <p className="setting-label">준비 시간</p>
              <label className="radio-label">
                <input type="radio" name="time" checked={prepTime === '30s'} onChange={() => setPrepTime('30s')} /> 30초
              </label>
              <label className="radio-label">
                <input type="radio" name="time" checked={prepTime === '1min'} onChange={() => setPrepTime('1min')} /> 1분
              </label>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. 하단 푸터 */}
      <footer className="interview-footer">
        <div className="progress-container">
          <span className="progress-text">1/5</span>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill"></div>
          </div>
        </div>
        <div className="tip-box">
          💡 팁: 카메라를 응시하며 자신감 있게 말해보세요.
        </div>
        <div className="footer-icons">
          <span>⚙️</span>
        </div>
      </footer>
    </div>
  );
};

export default InterviewInterface;