import { mockAssistantRules } from '../data/mockAssistantRules';
import type { ChatMessage } from '../types';
import type { IAssistantService } from '../types/services';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'assistant',
    text: 'Hello! I am your MediLink AI Health Assistant demo. You can ask me general questions about health topics, lab test preparation, or finding a specialist.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'What should I bring for a blood sugar test?',
      'How do I manage mild fever at home?',
      'When should I consult a cardiologist?'
    ],
    isDemoResponse: true
  }
];

class AssistantService implements IAssistantService {
  getInitialState(): ChatMessage[] {
    return INITIAL_MESSAGES;
  }

  async sendMessage(prompt: string, _history: ChatMessage[]): Promise<ChatMessage> {
    // Artificial slight delay for realistic feeling
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lower = prompt.toLowerCase();

    // Check emergency triggers
    const isEmergency = /chest pain|difficulty breathing|stroke|unconscious|severe bleeding|heart attack|snake bite/i.test(lower);

    if (isEmergency) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'CRITICAL EMERGENCY WARNING: The symptoms you described may indicate a medical emergency. Please immediately call 112 (National Emergency Helpline) or proceed to the nearest emergency department.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergencyWarning: true,
        suggestions: ['View Emergency Numbers', 'Find Nearby Hospitals'],
        sources: ['National Health Portal Emergency Protocol'],
        isDemoResponse: true
      };
    }

    // Match rules
    for (const rule of mockAssistantRules) {
      if (rule.pattern.test(lower)) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: rule.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: rule.suggestions,
          sources: rule.sources,
          isDemoResponse: true
        };
      }
    }

    // Fallback response
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Thank you for asking about "${prompt}". In this Stage 1 demo, I provide guidance on common topics such as diabetes prep, fever, blood pressure, and doctor discovery. For personalized medical advice, please consult a qualified healthcare professional.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['How to prepare for blood test?', 'Find a General Physician'],
      sources: ['MediLink Demo Knowledgebase v1.0'],
      isDemoResponse: true
    };
  }
}

export const assistantService = new AssistantService();
