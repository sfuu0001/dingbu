export interface TableSession {
  id: string;
  tableNo: string;
  status: 'open' | 'closed';
}

export function getSessions(): TableSession[] {
  return [
    { id: 'ts-1', tableNo: 'A01', status: 'open' },
    { id: 'ts-2', tableNo: 'A02', status: 'open' },
    { id: 'ts-3', tableNo: 'A03', status: 'open' },
    { id: 'ts-4', tableNo: 'B01', status: 'open' },
    { id: 'ts-5', tableNo: 'B02', status: 'open' },
    { id: 'ts-6', tableNo: 'C01', status: 'open' },
    { id: 'ts-7', tableNo: 'C02', status: 'open' },
    { id: 'ts-8', tableNo: 'C03', status: 'closed' }
  ];
}
