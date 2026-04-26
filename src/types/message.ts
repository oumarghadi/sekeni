export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderNameAr: string;
  senderAvatar?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyTitleAr?: string;
  content: string;
  contentAr?: string;
  timestamp: string;
  isRead: boolean;
  type: 'inquiry' | 'offer' | 'general';
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantNameAr: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
  propertyTitleAr?: string;
  messages: Message[];
}
