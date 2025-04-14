import { ApiProperty } from '@nestjs/swagger';

export class DeliveryOptionDto {
  @ApiProperty({ description: 'Prazo de entrega', example: '2 dias úteis' })
  prazo: string;

  @ApiProperty({ description: 'Agência', example: 'xxxx' })
  Agencia: string;

  @ApiProperty({ description: 'Preço do frete', example: 'R$ 27,00' })
  price: string;

}