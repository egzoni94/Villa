export const isNumericInput = (value: string) => {
    return /^\d*$/.test(value); // allows empty or digits only
  };
