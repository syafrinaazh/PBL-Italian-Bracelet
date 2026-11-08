export type Order = {
  id: string;
  name: string;
  date: string;
  item: string;
  total: string;
  status: string;
  phone: string;
  address: string;
  payment: string;
  charms: { name: string; qty: number }[];
};