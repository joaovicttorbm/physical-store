import { ApiProperty } from '@nestjs/swagger';
import { DeliveryOptionDto } from './delivery-option.dto';

export class StoreResponseDto {
  @ApiProperty({ description: 'Nome da loja', example: 'Loja Exemplo' })
  name: string;

  @ApiProperty({ description: 'Cidade da loja', example: 'São Paulo' })
  city: string;

  @ApiProperty({ description: 'CEP da loja', example: '01001-000' })
  postalCode: string;

  @ApiProperty({ description: 'Tipo da loja', example: 'LOJA' })
  type: string;

  @ApiProperty({ description: 'Distância da loja', example: '1 m' })
  distance: string;

  @ApiProperty({ description: 'Opções de entrega', type: [DeliveryOptionDto] })
  value: DeliveryOptionDto[];

  @ApiProperty({ description: 'Posição da loja no mapa', example: { lat: '-23.5503099', lng: '-46.6342009' } })
    position: { lat: string; lng: string };
    
    @ApiProperty({ description: 'QTD lojas' })
    total: number;
}