# 📦 Physical-Store API

API desenvolvida em NestJS para cadastro e localização de lojas com base no CEP informado. Realiza cálculo de distância com a Google Maps Distance Matrix API, busca de endereço com ViaCEP e consulta de opções de frete com a API Melhor Envio.

---

## 🚀 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Axios](https://axios-http.com/)
- [Google Maps API](https://developers.google.com/maps/documentation/distance-matrix)
- [ViaCEP](https://viacep.com.br/)
- [Melhor Envio API](https://www.melhorenvio.com.br/)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

## 📌 Funcionalidades

- 📍 **Cadastrar loja com CEP**: busca endereço com ViaCEP, localiza coordenadas no Google Maps e armazena a loja com latitude/longitude.
- 🔍 **Buscar lojas por estado ou ID**
- 📦 **Buscar lojas próximas com base no CEP do cliente**
  - Cálculo de distância entre o endereço do cliente e cada loja (máx. 100km)
  - Ordenação por menor distância
  - Consulta de frete com Melhor Envio

---

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
GOOGLE_MAPS_API_KEY=your_google_api_key
MELHOR_ENVIO_API_KEY=your_melhor_envio_api_key

```

---

# Clone o repositório

git clone https://github.com/seu-usuario/nestjs-store-locator.git
cd physical-store

# Instale as dependências

npm i

# Configure o ambiente

cp .env

# Preencha com suas chaves de API

# Rode a aplicação

npm run start:dev
