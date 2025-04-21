export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export class ChatModel {
  private static instance: ChatModel;
  private messages: Message[] = [
    {
      id: '1',
      content: 'Hello! I\'m your Data Insights Assistant. How can I help you analyze your data today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ];

  private constructor() {}

  public static getInstance(): ChatModel {
    if (!ChatModel.instance) {
      ChatModel.instance = new ChatModel();
    }
    return ChatModel.instance;
  }

  getMessages(): Message[] {
    return this.messages;
  }

  async sendMessage(content: string): Promise<Message> {
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: new Date()
      };
      
      this.messages.push(userMessage);
      
      // Send to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content
        })
      });
      
      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      this.messages.push(assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      this.messages.push(errorMessage);
      return errorMessage;
    }
  }
}