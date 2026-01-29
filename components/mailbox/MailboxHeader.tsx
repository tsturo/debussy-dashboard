interface MailboxHeaderProps {
  totalMessages: number;
  filteredMessages: number;
  lastUpdated: string;
}

export default function MailboxHeader({
  totalMessages,
  filteredMessages,
  lastUpdated,
}: MailboxHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Agent Mailboxes
      </h1>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>
          {filteredMessages === totalMessages
            ? `${totalMessages} messages`
            : `${filteredMessages} of ${totalMessages} messages`}
        </span>
        <span>•</span>
        <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
