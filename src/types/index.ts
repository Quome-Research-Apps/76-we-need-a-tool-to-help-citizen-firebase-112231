export type Status = 'Submitted' | 'In Progress' | 'Completed' | 'Rejected';

export const StatusEnum: [Status, ...Status[]] = [
  'Submitted',
  'In Progress',
  'Completed',
  'Rejected',
];

export interface StatusUpdate {
  id: string;
  status: Status;
  notes: string;
  date: string; // ISO string
}

export interface ServiceRequest {
  id: string;
  description: string;
  category: string;
  referenceNumber?: string;
  createdAt: string; // ISO string
  updates: StatusUpdate[];
  currentStatus: Status;
}
