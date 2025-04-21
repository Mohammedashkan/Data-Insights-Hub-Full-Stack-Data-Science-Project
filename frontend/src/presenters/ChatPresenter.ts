import { ChatModel, Message } from '../models/ChatModel';

export class ChatPresenter {
  private model: ChatModel;
  private onMessagesChanged: (messages: Message[]) => void;
  private onError: (error: string) => void;
  private onLoading: (loading: boolean) => void;

  constructor(
    onMessagesChanged: (messages: Message[]) => void,
    onError: (error: string) => void,
    onLoading: (loading: boolean) => void
  ) {
    this.model = ChatModel.getInstance();
    this.onMessagesChanged = onMessagesChanged;
    this.onError = onError;
    this.onLoading = onLoading;
  }

  getMessages(): Message[] {
    return this.model.getMessages();
  }

  async sendMessage(content: string): Promise<void> {
    try {
      this.onLoading(true);
      await this.model.sendMessage(content);
      this.onMessagesChanged(this.model.getMessages());
    } catch (error) {
      this.onError('Failed to send message');
    } finally {
      this.onLoading(false);
    }
  }
}