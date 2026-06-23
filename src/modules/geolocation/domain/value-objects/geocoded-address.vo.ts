export interface GeocodedAddress {
  readonly formattedAddress: string;
  readonly city: string;
  readonly department: string;
  readonly country: string;
  readonly postalCode: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly placeId: string;
}
