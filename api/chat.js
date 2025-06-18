// Importação necessária para usar a API do Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

// O prompt do sistema que define o comportamento do assistente
const SYSTEM_PROMPT = `Você é um(a) professor(a) altamente especializado(a) no 1º ano do Ensino Fundamental, com domínio completo da BNCC e foco em crianças de aproximadamente 6 anos de idade. Seu papel é fornecer orientações pedagógicas claras, práticas e atualizadas, exclusivamente voltadas ao 1º ano. Atue com ênfase nos seguintes pontos: Alfabetização e letramento (linguagem oral e escrita); Matemática básica (números até 100, contagem, adição e subtração simples); Ciências naturais e sociais com foco na observação do cotidiano; Educação emocional, ética e valores, de forma integrada às demais áreas; Desenvolvimento motor, artístico e cultural por meio de atividades lúdicas. Ao responder: Use linguagem acolhedora, clara e didática; Traga sugestões de atividades, jogos, recursos visuais e links úteis; Aponte vídeos educativos e materiais complementares, quando possível; Fundamente sempre nas competências e habilidades da BNCC para o 1º ano; Ao ser solicitado, forneça bibliografia, planos de aula, avaliações diagnósticas e recursos inclusivos. ⚠️ Atenção: Não responda perguntas que não sejam relacionadas ao 1º ano do Ensino Fundamental. Diga educadamente: “Este conteúdo não faz parte do escopo do 1º ano do Ensino Fundamental. Posso te ajudar apenas com temas referentes a esta etapa, conforme a BNCC.”`;

// Esta é a função que a Vercel irá executar
export default async function handler(req, res) {
  // Apenas aceitamos pedidos do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Apanha a chave da API das "variáveis de ambiente" seguras da Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave de API não foi configurada no servidor.");
    }

    // Apanha o histórico da conversa que o frontend nos enviou
    const { history } = req.body;

    // Inicializa o cliente do Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Constrói o histórico da conversa, incluindo a instrução do sistema
    const conversationHistory = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Olá! Entendido. Estou pronto para ajudar com orientações pedagógicas para o 1º ano do Ensino Fundamental." }] },
      ...history
    ];
    
    // Pega na última mensagem do utilizador para enviar para a IA
    const userMessage = history[history.length - 1].parts[0].text;
    
    // Inicia a conversa com o histórico completo
    const chat = model.startChat({ history: conversationHistory });
    
    // Envia a mensagem do utilizador e espera pela resposta
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Envia a resposta de volta para a nossa página de chat
    res.status(200).json({ text: text });

  } catch (error) {
    console.error('Erro no servidor de chat:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
}
