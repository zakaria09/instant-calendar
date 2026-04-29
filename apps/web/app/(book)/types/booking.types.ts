export type BookingState = {
  serviceId: string | null;
  staffId: string | null;
  dateTime: string | null;
};
 
export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
};
 
export type PEOPLE = {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
};