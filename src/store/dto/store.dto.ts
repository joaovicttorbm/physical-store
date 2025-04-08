import { ApiProperty } from '@nestjs/swagger';

export class StoreDto {
  @ApiProperty({ description: 'Name of the store' })
  storeName: string;

  @ApiProperty({ description: 'Indicates if takeout is available in the store' })
  takeOutInStore: boolean;

  @ApiProperty({ description: 'Shipping time in days' })
  shippingTimeInDays: number;

  @ApiProperty({ description: 'Latitude of the store' })
  latitude?: string;

  @ApiProperty({ description: 'Longitude of the store' })
  longitude?: string;

  @ApiProperty({ description: 'Primary address of the store' })
  address1: string;

  @ApiProperty({ description: 'Secondary address of the store', required: false })
  address2?: string;

  @ApiProperty({ description: 'Tertiary address of the store', required: false })
  address3?: string;

  @ApiProperty({ description: 'City where the store is located' })
  city: string;

  @ApiProperty({ description: 'District where the store is located' })
  district: string;

  @ApiProperty({ description: 'State where the store is located' })
  state: string;

  @ApiProperty({ description: 'Type of the store', enum: ['LOJA', 'PDV'] })
  type: 'LOJA' | 'PDV';

  @ApiProperty({ description: 'Country where the store is located' })
  country: string;

  @ApiProperty({ description: 'Postal code of the store' })
  postalCode: string;

  @ApiProperty({ description: 'Telephone number of the store' })
  telephoneNumber: string;

  @ApiProperty({ description: 'Email address of the store' })
  emailAddress: string;
}
