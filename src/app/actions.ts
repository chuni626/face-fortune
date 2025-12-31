'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function analyzeFace(formData: FormData) {
  console.log("--- 분석 시작 (정밀 닮은꼴 매칭 모드) ---");
  
  const file = formData.get("image") as File;
  if (!file) throw new Error("이미지가 없습니다.");

  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-3-flash-preview" },
      { apiVersion: 'v1beta' }
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 프롬프트 대폭 수정: '물리적 특징' 강조 및 '한국인 우선' 로직 추가
    const prompt = `
      당신은 수십 년 경력의 관상가이자, 안면 인식 전문가입니다.
      제공된 사진의 인물을 **아이들의 눈높이에 맞춰** 재미있게 설명하되, 닮은꼴 찾기 단계에서는 **매우 정밀하게** 분석해야 합니다.
      
      [분석 단계]
      1. 먼저 사진 속 인물의 성별, 나이대, 얼굴형(둥근형, 계란형, 각진형 등), 눈매(쌍꺼풀 유무, 눈꼬리), 코의 모양, 입술 두께를 관찰하세요.
      2. 위에서 관찰한 **물리적 특징(이목구비의 생김새)**과 가장 일치하는 **실존 연예인(배우, 가수, 운동선수)**을 데이터베이스에서 검색하세요.
      3. 분위기가 비슷한 사람이 아니라, **얼굴 생김새가 실제로 닮은 사람**이어야 합니다.
      4. 사진 속 인물이 한국인으로 보인다면, **한국 연예인** 중에서 우선적으로 찾아주세요.

      [출력 양식]
      다음 5가지 항목에 대해 초등학생도 이해하기 쉬운 한국어로 답변해 주세요:
      
      1. 🦁 전체적인 느낌 (동물에 비유하거나 재미있는 표현 사용)
      2. 👀 얼굴의 특징 (눈, 코, 입이 어떻게 생겼는지 묘사)
      3. ✨ 숨겨진 능력 (성격 장점, 재능)
      4. 🍀 행운의 조언
      5. 👯 나와 닮은 연예인 (선정 이유를 "눈매가 닮았어요" 처럼 구체적으로 설명)

      ★중요★: 답변의 맨 마지막 줄에는 반드시 "!!!닮은꼴:이름!!!" 형식으로 이름만 딱 적어주세요.
      (예시: ...설명 끝. \n!!!닮은꼴:손흥민!!!)
    `;

    const result = await model.generateContent([
      prompt,
      { 
        inlineData: { 
          data: buffer.toString("base64"), 
          mimeType: file.type 
        } 
      }
    ]);

    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini API 호출 에러 상세:", error);
    throw new Error(`분석 중 오류 발생: ${error.message}`);
  }
}