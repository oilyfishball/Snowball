export interface Tab {
  id: number;
  icon: string; // Material icon name
  label: string;
  content: string;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
};
 