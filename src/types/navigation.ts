export type RootStackParamList = {
  Home: undefined;
  OwnerDashboard: undefined;
  AddProperty: undefined;
  PropertyManagement: undefined;
  ApplicationsManagement: undefined;
  Map: {
    mode?: 'view' | 'select';
    initialLocation?: {
      latitude: number;
      longitude: number;
    };
    onLocationSelect?: (latitude: number, longitude: number, address?: string) => void;
  } | undefined;
  PropertyDetail: { propertyId: string };
  Profile: undefined;
  CompleteProfile: undefined;
  Favorites: undefined;
};