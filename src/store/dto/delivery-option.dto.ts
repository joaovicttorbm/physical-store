import { ApiProperty } from '@nestjs/swagger';

export class DeliveryOptionDto {
  @ApiProperty({ description: 'Prazo de entrega', example: '2 dias úteis' })
  prazo: string;

  @ApiProperty({ description: 'Código do produto da agência', example: '04014' })
  codProdutoAgencia: string;

  @ApiProperty({ description: 'Preço do frete', example: 'R$ 27,00' })
  price: string;

  @ApiProperty({ description: 'Descrição do serviço', example: 'Sedex a encomenda expressa dos Correios' })
  description: string;
}