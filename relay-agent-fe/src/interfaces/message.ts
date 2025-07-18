export interface MessageData {
  id: string;
  object: string;
  created_at: number;
  assistant_id: string;
  thread_id: string;
  run_id: null | string;
  role: 'user' | 'assistant';
  content: [
    {
      type: string;
      text: {
        value: string;
        annotations: [];
      };
    },
  ];
  attachments: [];
  metadata: {};
}

export interface Message {
  object: string;
  data: MessageData[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}
