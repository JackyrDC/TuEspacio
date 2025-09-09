// Tipos para React Navigation
export type RootStackParamList = {
  PlacesList: undefined;
  PlaceDetail: { place: any };
  MapSearch: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Places: undefined;
  Contracts: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
