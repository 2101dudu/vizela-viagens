// Utility functions for formatting and data processing

export const formatTime = (time: string): string => {
  if (time.length === 4) {
    return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
  }
  return time;
};

export const formatDate = (date: string): string => {
  if (date.length === 10) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  return date;
};

export const calculateFlightPrice = (option: any): number => {
  return (parseFloat(option.RateTaxVal) || 0) + 
         (parseFloat(option.SuplementsTotalVal) || 0) + 
         (parseFloat(option.Tax) || 0);
};

export const calculateRoomPrice = (room: any): number => {
  return parseFloat(room.SellValue) || 0;
};

export const calculateInsurancePrice = (upgrade: any): number => {
  return parseFloat(upgrade.Sellvalue) || 0;
};
