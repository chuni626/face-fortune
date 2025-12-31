'use client';

import { useState, useRef } from "react";
import { analyzeFace } from "./actions";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [celebrity, setCelebrity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setResult("");
      setCelebrity("");
      setError("");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ✨ 공유하기 기능 함수 ✨
  const handleShare = async () => {
    const shareData = {
      title: '✨ 내 관상 & 닮은꼴 연예인 찾기 ✨',
      text: `[AI 관상 분석 결과]\n\n${result}\n\n👉 나랑 닮은 연예인: ${celebrity}\n\n너도 한번 해봐! 소름 돋음 🔮`,
      url: window.location.href, // 현재 사이트 주소 자동 첨부
    };

    try {
      // 모바일 등 공유 기능이 지원되는 브라우저인지 확인
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // PC 등 지원 안 하면 클립보드에 복사
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert("결과가 복사되었습니다! SNS나 카톡에 붙여넣기 하세요. 📝");
      }
    } catch (err) {
      console.log("공유 취소됨");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;

    if (!file || file.size === 0) {
      setError("먼저 사진을 콕! 눌러서 선택해 주세요! 📸");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setCelebrity("");

    try {
      const data = await analyzeFace(formData);
      
      const match = data.match(/!!!닮은꼴:(.*?)!!!/);
      
      if (match) {
        setCelebrity(match[1]);
        setResult(data.replace(match[0], ""));
      } else {
        setResult(data);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "앗! 분석 중에 뭔가 문제가 생겼어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100 via-pink-100 to-sky-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce-slow">☁️</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-20 animate-bounce-slow delay-700">🌈</div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden relative z-10 transition-transform hover:scale-[1.01]">
        
        <div className="p-6 text-center bg-gradient-to-b from-purple-100 to-white relative">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-2 drop-shadow-sm">
            ✨ AI 관상 놀이터 ✨
          </h1>
          <p className="text-gray-500 text-sm font-bold bg-purple-100 inline-block px-3 py-1 rounded-full">
            나랑 닮은 연예인은 누구일까? 🤔
          </p>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center justify-center">
              <div 
                onClick={triggerFileSelect}
                className={`
                  relative w-full overflow-hidden rounded-3xl border-4 border-dashed cursor-pointer transition-all duration-300
                  ${preview ? 'border-pink-300 bg-pink-50' : 'border-purple-300 bg-purple-50 hover:bg-purple-100'}
                  aspect-square max-h-[320px] flex items-center justify-center shadow-inner
                `}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain p-2 rounded-3xl" />
                ) : (
                  <div className="text-center p-6 flex flex-col items-center">
                    <span className="text-7xl mb-4 animate-pulse">🦁</span>
                    <p className="text-purple-600 font-extrabold text-xl">사진 찰칵!</p>
                    <span className="text-purple-400 text-sm mt-2 font-medium">얼굴이 잘 나온 사진을 골라주세요</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} name="image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <button
              type="submit"
              disabled={loading || !preview}
              className={`w-full py-4 rounded-2xl font-black text-xl transition-all transform shadow-lg
                ${loading 
                  ? "bg-gray-300 cursor-not-allowed text-white" 
                  : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105 active:scale-95 ring-4 ring-white"
                }`}
            >
              {loading ? "✨ AI가 열심히 분석 중! ✨" : "🚀 내 닮은꼴 찾기!"}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-100 rounded-2xl text-red-500 text-center font-bold animate-shake">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 animate-pop-in space-y-4">
              
              <div className="bg-white rounded-3xl p-6 border-4 border-yellow-200 shadow-lg relative">
                 <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-yellow-300 text-yellow-800 px-4 py-1 rounded-full font-bold text-sm shadow-sm border-2 border-white">
                  분석 완료!
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium mt-2">
                  {result}
                </div>
              </div>

              {celebrity && (
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-6 border-4 border-white shadow-xl text-center animate-bounce-in">
                  <p className="text-lg font-bold text-gray-600 mb-2">
                    당신의 닮은꼴은 바로...
                  </p>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
                    🎉 {celebrity} 🎉
                  </h2>
                  <div className="flex flex-col gap-3">
                    <a 
                      href={`https://www.google.com/search?q=${celebrity}&tbm=isch`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-white text-pink-500 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-pink-50 hover:scale-105 transition-transform border-2 border-pink-100"
                    >
                      📸 {celebrity} 사진 보러가기!
                    </a>
                    
                    {/* ✨ 공유하기 버튼 추가 ✨ */}
                    <button
                      onClick={handleShare}
                      className="w-full bg-yellow-400 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-yellow-500 hover:scale-105 transition-transform border-2 border-yellow-200 flex items-center justify-center gap-2"
                    >
                      📢 친구한테 자랑하기 (공유)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 팁 문구 추가 */}
      <footer className="absolute bottom-4 text-center text-gray-500 text-xs font-medium opacity-70">
        © 2024 AI 관상 놀이터 | 친구와 함께 공유해보세요! 😉
      </footer>
    </main>
  );
}