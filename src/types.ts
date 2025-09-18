export interface LabelItem {
  text: string;
}

export interface Account {
  id: string;
  labelRaw: string;
  labels: LabelItem[];
  type: string | null;
  login: string;
  password: string;
  isValid: boolean;
}
