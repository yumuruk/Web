import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

// [필수] CSS 파일 연결
import './InterviewInterface.css';

// --- [1] 졸음 감지용 수학 함수 (EAR) ---
const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

const getEAR = (landmarks, indices) => {
  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];
  const v1 = getDistance(p2, p6);
  const v2 = getDistance(p3, p5);
  const h = getDistance(p1, p4);
  return (v1 + v2) / (2.0 * h);
};

const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];

const InterviewInterface = () => {
  // UI 상태
  const [isRecording, setIsRecording] = useState(false);
  const [prepTime, setPrepTime] = useState('1min');
  
  // 토글 상태
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  
  // [핵심 해결책] 상태를 즉시 참조하기 위한 Ref 생성
  const aiEnabledRef = useRef(isAiEnabled);

  // AI 및 웹캠 상태
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [blinkStatus, setBlinkStatus] = useState("AI 로딩 중...");
  const requestRef = useRef();

  const handleUserMedia = () => {
    setIsWebcamReady(true);
  };

  // [중요] 토글 버튼을 누를 때마다 Ref 값을 최신으로 업데이트하고 캔버스 정리
  useEffect(() => {
    aiEnabledRef.current = isAiEnabled;

    // 만약 껐다면, 즉시 화면에 그려진 선들을 지워버림
    if (!isAiEnabled && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setBlinkStatus("기능 꺼짐");
    }
  }, [isAiEnabled]);


  // --- [2] AI 모델 로드 및 실행 ---
  useEffect(() => {
    if (!isWebcamReady || !webcamRef.current?.video) return;

    const faceMesh = new window.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    const runDetection = async () => {
      // 비디오가 준비되었고, [핵심] 사용자가 기능을 켰을 때만 AI에게 일을 시킴
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        aiEnabledRef.current // <--- 여기서 Ref를 확인해서 CPU 낭비 방지
      ) {
        await faceMesh.send({ image: webcamRef.current.video });
      }
      
      // 기능이 꺼져있어도 루프는 계속 돌면서 켜지기를 기다림 (성능 부하 거의 없음)
      requestRef.current = requestAnimationFrame(runDetection);
    };

    runDetection();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      faceMesh.close();
    };
  }, [isWebcamReady]);

  // --- [3] 결과 처리 ---
  const onResults = (results) => {
    if (!canvasRef.current || !webcamRef.current?.video) return;

    // [이중 안전장치] 혹시라도 껐는데 결과가 들어오면 무시
    if (!aiEnabledRef.current) return;

    const video = webcamRef.current.video;
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;

    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      for (const landmarks of results.multiFaceLandmarks) {
        
        // 그리기
        if (window.drawConnectors && window.FACEMESH_TESSELATION) {
          window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, { color: '#C0C0C030', lineWidth: 1 });
          window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_LEFT_EYE, { color: '#FF3030', lineWidth: 2 });
          window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_RIGHT_EYE, { color: '#FF3030', lineWidth: 2 });
        }

        // 졸음 감지
        const leftEAR = getEAR(landmarks, LEFT_EYE_INDICES);
        const rightEAR = getEAR(landmarks, RIGHT_EYE_INDICES);
        const avgEAR = (leftEAR + rightEAR) / 2;

        if (avgEAR < 0.25) {
            setBlinkStatus("졸음 감지 ⚠️");
            canvasCtx.fillStyle = "red";
            canvasCtx.font = "bold 50px Arial";
            canvasCtx.save(); 
            canvasCtx.scale(-1, 1); 
            canvasCtx.fillText("WAKE UP!", -350, 100);
            canvasCtx.restore();
        } else {
            setBlinkStatus("정상 (눈 뜸)");
        }
      }
    } else {
       setBlinkStatus("얼굴 인식 중...");
    }
    canvasCtx.restore();
  };

  return (
    <div className="interview-container">
      <header className="interview-header">
        <div className="question-box">Q. 자기소개를 1분 이내로 해주세요</div>
        <div className="timer-box">01:00</div>
      </header>

      <div className="main-content">
        <div className="video-section">
          <div className="video-wrapper">
            
            <Webcam
              ref={webcamRef}
              onUserMedia={handleUserMedia}
              mirrored={true}
              audio={false}
              style={{
                position: 'absolute', left: 0, top: 0,
                width: '100%', height: '100%', objectFit: 'cover',
                zIndex: 10 
              }}
            />
            
            <canvas 
              ref={canvasRef}
              style={{
                position: 'absolute', left: 0, top: 0,
                width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none',
                zIndex: 20, transform: 'scaleX(-1)'
              }}
            />

            <div className="overlay-layer" style={{ zIndex: 30 }}>
              <div className="fake-waveform">IIlIlIIlIlIIlIlIIl</div>
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

        <aside className="sidebar">
          <div className="sidebar-card">
            <h3 className="card-title">🏷️ 설정</h3>
            
            <div className="setting-group">
                <p className="setting-label">실시간 분석</p>
                <div style={{
                    backgroundColor: '#F3F4F6', 
                    padding: '12px', 
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: !isAiEnabled ? '#999' : (blinkStatus.includes("졸음") ? '#EF4444' : '#10B981'),
                    fontSize: '14px'
                }}>
                    {isWebcamReady ? (isAiEnabled ? `👁️ ${blinkStatus}` : "💤 기능 꺼짐") : "⏳ 카메라 연결 중..."}
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

            <div className="setting-group">
              <p className="setting-label">연습 모드</p>
              <div className="toggle-row">
                <span>AI 피드백 켜기</span>
                <input 
                  type="checkbox" 
                  checked={isAiEnabled} 
                  onChange={(e) => setIsAiEnabled(e.target.checked)} 
                />
              </div>
            </div>

          </div>
        </aside>
      </div>

      <footer className="interview-footer">
        <div className="progress-container">
          <span className="progress-text">1/5</span>
          <div className="progress-bar-bg"><div className="progress-bar-fill"></div></div>
        </div>
        <div className="tip-box">
          💡 팁: 카메라를 응시하며 자신감 있게 말해보세요.
        </div>
        <div className="footer-icons"><span>⚙️</span></div>
      </footer>
    </div>
  );
};

export default InterviewInterface;