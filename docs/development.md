# Programação de Funcionalidades


## Requisitos Atendidos

As tabelas que se seguem apresentam os requisitos funcionais e não-funcionais que relacionam o escopo do projeto com os artefatos criados:

### Requisitos Funcionais
|ID    | Descrição do Requisito | Responsável | Artefato Criado |
|------|------------------------|------------|-----------------|
|RF-001| A aplicação deve permitir que o usuário solicite ou oferte uma viagem. Caso seja uma oferta, ele poderá especificar se aceita ou não efetuar o transporte de encomendas | João Pedro | caronas/index.html | 
|RF-002| A aplicação deve permitir que o usuário solicite ou oferte um transporte de encomenda | Angel| encomendas/index.html |
|RF-003| A aplicação deve permitir que o usuário informe origem, destino, data, horário e se a viagem será gratuita ou com divisão de custos ao criar uma solicitação | João Pedro e Marco | oferecer-carona.html; caronas/pedir-carona.html; encomendas/pedir-encomenda.html; encomendas/transporte-encomendas.html |
|RF-004| A aplicação deve permitir que o usuário visualize seu histórico de solicitações e ofertas, incluindo informações como origem, destino, data, horário e se viagem será gratuita ou com divisão de custos | Angel | viagens/index.html |
|RF-005| A aplicação deve permitir que o usuário edite ou exclua suas próprias solicitações ou ofertas de viagens e encomendas | João Pedro e Marco | caronas/editar-carona.html; encomendas/editar-encomendas.html; encomendas/editar-transporte-encomenda.html |
|RF-006| A aplicação deve permitir que o usuário marque a publicação como emergência e insira uma justificativa, que será destacada para outros usuários | João Pedro | caronas/pedir-carona.html |
|RF-007| A aplicação deve permitir que o usuário avalie outros participantes com estrelas e comentários, e exibir a média no perfil | João Pedro | viagens/avaliacao.html |
|RF-008| A aplicação deve permitir que o usuário visualize seu histórico completo de interações concluídas, incluindo participação como motorista ou passageiro, e se a viagem incluiu entrega de encomendas ou não |  Angel | viagens/index.html |
|RF-009| A aplicação deve permitir que o usuário se comunique com outros usuários envolvidos na publicação por meio de um chat interno | João Pedro | viagens/negociar.html |
|RF-010| A aplicação deve permitir que o usuário faça login e visualize seu perfil | Silas | pages/index.html; autenticacao/login.html; autenticacao/register.html |
|RF-011| A aplicação deve permitir ordenar e filtrar solicitações e ofertas por origem, destino e data | João Pedro e Angel | caronas/index.html; encomendas/index.html |
|RF-012| A aplicação deve fornecer mensagens de alerta ou instruções nos formulários, garantindo que os campos obrigatórios sejam preenchidos | João Pedro, Marco, Silas e Angel | caronas/pedir-carona.html; encomendas/pedir-encomenda.html; encomendas/transporte-encomendas.html; utenticacao/login.html; autenticacao/register.html; comunidades/comunidade-cadastro.html |
|RF-013| A aplicação deve possibilitar o cadastro dos locais existentes na comunidade | Angel | comunidades/index.html |


### Requisitos não Funcionais
|ID    | Descrição do Requisito | Responsável | Artefato Criado |
|------|------------------------|------------|-----------------|
|RNF-002| A aplicação deve ser responsiva, adaptando-se a computadores, tablets e celulares | João Pedro, Marco, Silas e Angel | Aplicação de media queries, Flexbox/Grid | 
|RNF-004| A aplicação deve funcionar nos principais navegadores (Chrome, Firefox, Edge) | João Pedro, Marco, Silas e Angel | Uso de HTML/CSS padrão |
|RNF-007| A aplicação deve ser desenvolvida apenas com HTML, CSS e JavaScript simples, sem back-end  | João Pedro, Marco, Silas e Angel  | Arquivos estáticos e simples |
|RNF-008| A aplicação deve ser de baixo custo, utilizando apenas tecnologias gratuitas e abertas  | João Pedro, Marco, Silas e Angel | Uso de ferramentas gratuitas e código aberto (HTML, CSS, editor gratuito)



## Descrição das estruturas:

|  **Nome**      | **Tipo**          | **Descrição**                             | **Exemplo**                                    |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| | |  ||
| | | |                                                    |
|   |  |  |                                          |


## Usuários

| **Nome**      | **Tipo**          | **Descrição**                                 | **Exemplo**                  |
|------------|---------------|--------------------------------------------|---------------------------|
| id         | Número (Inteiro) | Identificador único do usuário            | 1                         |
| name       | Texto         | Nome completo do usuário                   | Angel                     |
| email      | Texto         | E-mail do usuário                          | angelcas98@outlook.com    |
| senha      | Texto         | Senha do usuário                           | 6ef1ff7c                  |
| usuario    | Texto         | Nome de usuário/login                      | angelcas98                |
| username   | Texto         | Nome de usuário alternativo (username)     | angelcas98                |
| telefone   | Texto         | Número de telefone                         | 31134141123               |
| comunidade | Texto         | Comunidade à qual o usuário pertence       | Centro                    |
| cidade     | Texto         | Cidade do usuário                          | SRS                       |
| endereco   | Objeto        | Endereço completo do usuário               | Rua Raimundos, 164, Borges|

---

## Caronas

| **Nome**      | **Tipo**          | **Descrição**                                 | **Exemplo**                  |
|--------------------|-----------------|-------------------------------------------------------------|--------------------------------|
| id                 | Número (Inteiro) | Identificador único da carona                                | 1763917816211                  |
| tipo               | Texto            | Tipo da carona (pedindo ou oferecendo)                      | pedindo                        |
| usuario            | Objeto           | Dados do usuário que criou ou solicitou a carona            | angelcas98                     |
| criadorId          | Número (Inteiro) | ID do criador da carona                                      | 1                              |
| passageiroId       | Número (Inteiro) | ID do passageiro (se houver)                                | 1                              |
| motoristaId        | Número (Inteiro) | ID do motorista (se houver)                                  | null                           |
| comunidadeId       | Número (Inteiro) | ID da comunidade da carona                                   | 1                              |
| rota               | Objeto           | Origem e destino da carona                                   | { origem: "Mercado Central KTO", destino: "Hospital" } |
| data               | Texto            | Data da carona                                               | 28/11/2025                     |
| horario            | Texto            | Horário de saída                                             | 13:00                          |
| tipoCarona         | Texto            | Tipo da carona                                               | comum                           |
| precisaRetorno     | Booleano         | Indica se precisa de retorno                                  | false                          |
| dataRetorno        | Texto            | Data do retorno (se aplicável)                                | ""                             |
| horarioRetorno     | Texto            | Horário do retorno (se aplicável)                             | ""                             |
| motoristasCandidatos| Array            | Lista de candidatos a motorista                               | []                             |
| passageiros        | Array            | Lista de passageiros                                          | []                             |
| encomendas         | Array            | Lista de encomendas associadas                                 | []                             |
| statusViagem       | Texto            | Status da carona                                              | agendada                        |
| veiculo            | Texto            | Tipo de veículo (para caronas oferecendo)                    | carro                          |
| vagas              | Número (Inteiro) | Quantidade de vagas disponíveis                               | 1                              |
| custo              | Texto            | Custo da carona                                               | Viagem gratuita                |
| incluiRetorno      | Booleano         | Indica se inclui retorno                                      | false                          |
| dataInicio         | Texto            | Data/hora de início da viagem (ISO)                           | 2025-11-23T17:31:51.936Z      |
| dataConclusao      | Texto            | Data/hora de conclusão da viagem (ISO)                        | 2025-11-23T17:31:54.155Z      |

---

## Encomendas

| **Nome**      | **Tipo**          | **Descrição**                                 | **Exemplo**                  |
|-------------------|-----------------|----------------------------------------------------------|----------------------------------|
| id                 | Número (Inteiro) | Identificador único da encomenda                          | 1                                |
| tipo               | Texto            | Tipo da encomenda (pedindo ou oferecendo)                | pedindo                          |
| descricao          | Texto            | Descrição do item a ser transportado                     | Saco de milho                     |
| origem             | Texto            | Local de origem                                          | Centro                           |
| destino            | Texto            | Local de destino                                        | Mercado Central                  |
| localOrigem        | Texto            | Nome do local de origem                                   | Centro                           |
| localDestino       | Texto            | Nome do local de destino                                  | Mercado Central                  |
| destinatarioEhVoce | Booleano         | Indica se o destinatário é o próprio usuário             | true                             |
| nomeDestinatario   | Texto            | Nome do destinatário                                      | Próprio solicitante              |
| dataReceber        | Texto            | Data prevista para receber a encomenda                   | 26/09/2025                       |
| horario            | Texto            | Horário previsto                                         | 14:00                            |
| dataISO            | Texto            | Data em formato ISO                                      | 2025-09-26T03:00:00.000Z        |
| dataTexto          | Texto            | Data em formato legível                                  | 26 de setembro de 2025           |
| usuario            | Objeto           | Dados do usuário que solicitou a encomenda              | Gustavo                          |
| criadorId          | Número (Inteiro) | ID do criador da encomenda                               | 2                                |
| transportadorId    | Número (Inteiro) | ID do transportador aprovado                             | 1                                |
| status             | Texto            | Status da encomenda                                      | em andamento                     |
| candidatos         | Array            | Lista de candidatos a transportar a encomenda            | [{ userId: 1, status: "aprovado" }] |

---

## Locais

| **Nome**      | **Tipo**          | **Descrição**                                 | **Exemplo**                  |
|---------------|-------------|-----------------------------------------|----------------------------------------|
| id            | Texto/Número| Identificador do local                   | 1                                      |
| nome          | Texto       | Nome do local                             | Mercado Central KTO                     |
| comunidadeId  | Número      | ID da comunidade                          | 1                                      |
| comunidade    | Texto       | Nome da comunidade                        | Centro                                 |
| tipo          | Texto       | Tipo do local                              | Mercado                                |
| endereco      | Texto       | Endereço completo                          | Avenida Augusto de Lima, 744 - Centro |
| imagem        | Texto       | URL ou descrição da imagem do local       | imagem do local                        |
| criador       | Texto       | Quem cadastrou o local                     | Usuário da plataforma                  |
| contato       | Texto       | Informações de contato                     | ""                                     |
| quantidadeViagens | Número   | Quantidade de viagens realizadas           | 0                                      |
| aprovado      | Booleano    | Indica se o local foi aprovado             | false                                  |
| criadoEm      | Texto       | Data de criação do registro (ISO)         | 2025-11-21T21:50:39.992Z              |

---

## Comunidades

| **Nome**      | **Tipo**          | **Descrição**                                 | **Exemplo**                  |
|------|------|-----------|---------|
| id   | Número (Inteiro) | Identificador único da comunidade | 1 |
| nome | Texto | Nome da comunidade | Centro |

---

## Veículos

| **Nome**      | **Tipo**          | **Descrição**                                 | **Exemplo**                  |
|---------------|----------------|-----------------------------------------|-------------------------------|
| id            | Número/Texto   | Identificador único do veículo           | 1763761718449                 |
| motoristaId   | Número (Inteiro)| ID do motorista do veículo               | 1                             |
| type          | Texto          | Tipo de veículo                           | CAR                           |
| brand         | Texto          | Marca do veículo                           | Honda                         |
| model         | Texto          | Modelo do veículo                          | Civic                         |
| color         | Texto          | Cor do veículo                             | Preto                         |
| licensePlate  | Texto          | Placa do veículo                           | ABC1234                       |
| availableSeats| Número (Inteiro)| Quantidade de assentos disponíveis        | 4                             |

## Instruções para acesso e verificação da implementação:

- Clonar o repositório para a máquina.
- Utilizar o live JSON Server para exibir as páginas.

1- pages/index.html:
 - Clique em "Cadastre-se Gratuitamente" ou "Entre na sua conta".

2-pages/autenticacao/register.html:
 - Informe o nome, e-mail, senha, nome de usuário, telefone, comunidade, cidade, endereço e veículo (se possuir) para criar uma conta.

3-pages/autenticacao/login.html:
 - Insira se nome de usuário e senha para fazer o login.

4-caronas/index.html:
 - Escolha no menu lateral entre acessar as páginas de caronas, encomendas, comunidades e o histórico de viagens.
 - Clique no botão "Pedir uma carona" ou "Oferecer uma carona" para criar uma viagem.
 - No dashboard de caronas, uritlize os filtros "Tudo", "Pessoas oferecendo carona", "Pessoas pedindo caronas".
 - Utilize os filtros de oriegem, destino e data para procurar caronas como passageiro ou motorista.

5-caronas/oferecer-carona.html:
 - Informe o local de partida, local de chegada, a data da viagem, o veículo que será utilizado, a quantidade de vagas disponíveis, se será uma viagem gratuita ou com divisão de custos, se há disponibilidade para transporte de encomendas, se deseja incluir previsão de retorno, data e hora do retorno (opcional).
 - Clique no botão "Criar carona"

6-caronas/pedir-carona.html:
 - Informe o tipo de carona (comum ou emergencial), local de partida, local de chegada, data e horário da viagem, se há necessidade de retorno, data e horário de retorno (opcional).
 - Clique no botão "Pedir carona"

7-encomendas/index.html:
 - Clique no botão "Pedir transporte" ou "Oferecer transporte" para criar uma viagem.
 - No dashboard de encomendas, uritlize os filtros "Todas", "Pessoas pedindo transporte", "Pessoas oferecendo transporte".
 - Utilize os filtros de oriegem, destino e data para procurar caronas como passageiro ou motorista.
 - Clique no botão "mais informações" para visualizar os detalhes da publicação.

8-encomendas/transporte-encomendas.html:
 - Informe o local de partida, local de chegada, a data da viagem, o veículo que será utilizado, se será um transporte gratuito ou com custos, se deseja incluir previsão de retorno, data e hora do retorno (opcional).
 - Clique no botão "Criar oferta".

9-encomendas/pedir-encomenda.html:
 - Informe a descrição do item, local onde o item está, local onde o item deve ser entregue, se o destinatátio é o usuário ou outra pesssoa, nome do destinatário, data para recebimento do item.
 - Clique no botão "Criar pedido de transporte de encomenda".

10-comunidades/index.html:
 - Clique no botão "cadastrar novo local" para cadastar um novo local na comunidade.
 - No dashboard de comunidades, uritlize os filtros "Locais da região" ou "Locais da comunidade selecionada".
 - Utilize a barra para pesquisar o nome do local que está procurando.
 - Clique no botão "conhecer local" para acessar a página daquele local.

11-comunidades/comunidade-local.html:
 - Clique no botão "Entrar em contato" para entrar em contato pelo whatsapp do local.
 - No dashboard de comunidades, visualize as viagens que estarão passando por aquele local.
 - Clique no botão "participar da viagem" para participar da viagem.

 12-comunidades/comunidade-cadastro.html:
 - Informe o nome do local ou estabelecimento, comunidade a qual o local faz parte, categoria do local, endereço e faça upload de uma foto de capa.
 - Clique no botão "Cadastrar local".

 13-viagens/index.html:
 - No dashboard de viagens, uritlize os filtros "Todas", "Caronas" e "Encomendas" para verificar o histórico de viagens.
 - Clique no botão "Detalhes" para acessar a página daquele local.








