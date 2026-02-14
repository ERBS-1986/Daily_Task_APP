import { GoogleGenAI } from "@google/genai";

// Lazy initialization to avoid global errors if API_KEY is missing
let aiInstance: any = null;

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getProductivityAdvice = async (data: {
  tasks: any[],
  habits: any[],
  goals: any[]
}) => {
  try {
    const prompt = `
      Atue como um coach de produtividade sênior.
      Analise o seguinte estado atual do usuário:
      Tarefas pendentes: ${data.tasks.filter(t => !t.completed).length}
      Hábitos ativos: ${data.habits.length}
      Metas semanais: ${data.goals.length}
      
      Forneça um conselho curto (máximo 3 frases) e motivador para o dia de hoje. 
      Sugira também qual categoria focar baseado no equilíbrio de vida.
      Retorne em Português do Brasil.
    `;

    const ai = getAI();
    if (!ai) throw new Error("API Key not configured");

    const response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);


    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Mantenha o foco e a consistência. Pequenos passos levam a grandes conquistas!";
  }
};

export const optimizeSchedule = async (tasks: any[]) => {
  try {
    const prompt = `
      Abaixo está uma lista de tarefas. Por favor, reordene-as por prioridade lógica de execução (Deep Work primeiro, tarefas administrativas depois).
      Tarefas: ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority, category: t.category })))}
      
      Retorne APENAS um texto explicativo curto de por que essa ordem é melhor.
    `;

    const ai = getAI();
    if (!ai) throw new Error("API Key not configured");

    const response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);


    return response.text();
  } catch (error) {
    return "Priorize as tarefas mais difíceis no seu horário de maior energia.";
  }
};
