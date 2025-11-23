# Testes

# Teste de Software

Nesta seção o grupo deverá documentar os testes de software que verificam a correta implementação dos requisitos funcionais e não funcionais do software.

## Plano de Testes de Software

**Caso de Teste** | **CT01 - Login parte 1**
 :--------------: | ------------
**Procedimento**  | 1) http://localhost:3000/pages/autenticacao/login.html <br> 2) Clique em criar conta <br> 2) Preencha todos os campos do formulário <br> 3) Clique no botão "Criar conta".
**Requisitos associados** | RF-010
**Resultado esperado** | Prosseguir para a parte 2 do login
**Dados de entrada** | Inserção de dados válidos no formulário de cadastro
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT02 - Login parte 2**
 :--------------: | ------------
**Procedimento**  | 1) Preencha os campos de usuário com o seu endereço de e-mail e senha <br> 2) Clique no botão "Entrar" <br> 
**Requisitos associados** | RF-010
**Resultado esperado** | Usuário logado
**Dados de entrada** | Inserção de dados válidos nos campos de login
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT03 - Pedir carona**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/caronas/pedir-carona.html <br> 2)Clique no botão "Pedir uma carona" <br> 3)Preencha os campos com as informações solicitadas <br> 4) Clique no botão "Pedir carona" <br> 
**Requisitos associados** | RF-001, RF-003 e RF-006
**Resultado esperado** | Pedido de carona criado
**Dados de entrada** | Inserção de dados válidos nos campos para pedido de carona
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT04 - Oferecer carona**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/caronas/oferecer-carona.html <br> 2)Clique no botão "Oferecer uma carona" <br> 3)Preencha os campos com as informações solicitadas <br> 4) Clique no botão "Criar carona" <br> 
**Requisitos associados** | RF-001 e RF-003
**Resultado esperado** | Oferta de carona criada
**Dados de entrada** | Inserção de dados válidos nos campos para oferta de carona
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT05 - Pedir transporte de encomenda**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/encomendas/pedir-encomenda.html <br> 2)Clique no botão "Pedir transporte" <br> 3)Preencha os campos com as informações solicitadas <br> 4) Clique no botão "Criar pedido de transporte de encomenda" <br> 
**Requisitos associados** | RF-002 e RF-003
**Resultado esperado** | Pedido de transporte de encomenda criado
**Dados de entrada** | Inserção de dados válidos nos campos para pedido de transporte de encomenda
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT06 - Oferecer transporte de encomenda**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/encomendas/transporte-encomendas.html <br> 2)Clique no botão "Oferecer transporte" <br> 3)Preencha os campos com as informações solicitadas <br> 4) Clique no botão "Criar oferta" <br> 
**Requisitos associados** | RF-002 e RF-003
**Resultado esperado** | Oferta de transporte de encomenda criada
**Dados de entrada** | Inserção de dados válidos nos campos para oferta de transporte de encomenda
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT07 - Visualizar histórico de viagens**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/viagens/index.html <br> 
**Requisitos associados** | RF-004 e RF-008
**Resultado esperado** | Visulização do histórico de viagens
**Dados de entrada** | Não é necessário entrada de dados
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT08 - Editar ou exluir solicitações**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/viagens/detalhes.html <br> 2)Clicar no botão "Excluir oferta" ou "Editar viagem" 3) Alterar os campos que quiser editar 4)Clicar no botão "Salvar Alterações"
**Requisitos associados** | RF-005
**Resultado esperado** | Exclusão ou edição concluídos
**Dados de entrada** | Inserção de dados válidos nos campos a serem editados
**Resultado obtido** | Sucesso


**Caso de Teste** | **CT09 - Avaliação de usuários**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/viagens/avalicao.html <br> 2)Clicar no botão "Avaliar viagens" 3) Selecionar o número de estrelas e inserir um comentário  4)Clicar no botão "Salvar Avaliações"
**Requisitos associados** | RF-007
**Resultado esperado** | Avaliação concluídas
**Dados de entrada** | Slecionar o número de estrelas
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT10 - Chat interno**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/viagens/negociar.html<br> 2)Escrever a mensagem no box 3) Clicar no botão  de enviar
**Requisitos associados** | RF-009
**Resultado esperado** |Interação entre usuários
**Dados de entrada** | Mensagem para o usuário
**Resultado obtido** | Sucesso

**Caso de Teste** | **CT11 - Cadastrar local**
 :--------------: | ------------
**Procedimento**  | 1)http://localhost:3000/pages/comunidades/comunidade-cadastro.html<br> 2)Inserção de dados válidos nos campos para cadastro do local 3) Clicar no botão "Cadastrar local"
**Requisitos associados** | RF-013
**Resultado esperado** |Local cadastrado
**Dados de entrada** | Informações do local
**Resultado obtido** | Sucesso


## Registro dos Testes de Software

|*Caso de Teste*                                 |*CT01 - Login parte 1*                                         |
|---|---|
|Requisito Associado | RF-010 - A aplicação deve permitir que o usuário faça login e visualize seu perfil|
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1FDzKLkexvk8euQpRGnkA6yga6BvN_Ma6/view?usp=drive_link| 

|*Caso de Teste*                                 |*CT02 - Login parte 2*                                        |
|---|---|
|Requisito Associado | RF-010 - A aplicação deve permitir que o usuário faça login e visualize seu perfil|
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1I7tWwcFGcrrtknrwIv8R80vuqdBuL2dt/view?usp=drive_link; https://drive.google.com/file/d/1pzgVP3Uwb04iOj1IRYswveSkbjeKJ7ir/view?usp=drive_link| 

|*Caso de Teste*                                 |*CT03 - Pedir carona*                                        |
|---|---|
|Requisito Associado | RF-001 - A aplicação deve permitir que o usuário solicite ou oferte uma viagem. Caso seja uma oferta, ele poderá especificar se aceita ou não efetuar o transporte de encomendas; RF-003 - A aplicação deve permitir que o usuário informe origem, destino, data, horário e se a viagem será gratuita ou com divisão de custos ao criar uma solicitação; RF-006 - A aplicação deve permitir que o usuário marque a publicação como emergência e insira uma justificativa, que será destacada para outros usuários |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1EhXbKiKRFrKQQrQrFH0pnrH2eb_te-Qm/view?usp=drive_link; https://drive.google.com/file/d/1aZCo7BzYuo-CWPZlQ7J5UC8OpXqAV2fM/view?usp=drive_link; https://drive.google.com/file/d/1hrk_X8_n0LTnKKJ5GhH9u9iuapTLQ8YA/view?usp=drive_link|

|*Caso de Teste*                                 |*CT04 - Oferecer carona*                                        |
|---|---|
|Requisito Associado | RF-001 - A aplicação deve permitir que o usuário solicite ou oferte uma viagem. Caso seja uma oferta, ele poderá especificar se aceita ou não efetuar o transporte de encomendas; RF-003 - A aplicação deve permitir que o usuário informe origem, destino, data, horário e se a viagem será gratuita ou com divisão de custos ao criar uma solicitação |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/10BW1SbRHauXnS8NmjkKzE9oFv0dEG5Cw/view?usp=drive_link; https://drive.google.com/file/d/1nOH5QdKnUtziSCIG_Lq8dW8yE2ZiEgJB/view?usp=drive_link; https://drive.google.com/file/d/1cZAFdaw4nCiaIdaYK16XE2BQY3BZAtTh/view?usp=drive_link| 

|*Caso de Teste*                                 |*CT05 - Pedir transporte de encomenda*                                        |
|---|---|
|Requisito Associado | RF-002  - A aplicação deve permitir que o usuário solicite ou oferte um transporte de encomenda; RF-003 - A aplicação deve permitir que o usuário informe origem, destino, data, horário e se a viagem será gratuita ou com divisão de custos ao criar uma solicitação |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/13pqkxTAuhfaOVEbE0wLiI74rj2GfWumr/view?usp=drive_link| 

|*Caso de Teste*                                 |*CT06 - Oferecer transporte de encomenda*                                        |
|---|---|
|Requisito Associado | RF-002n - A aplicação deve permitir que o usuário solicite ou oferte um transporte de encomenda; RF-003 - A aplicação deve permitir que o usuário informe origem, destino, data, horário e se a viagem será gratuita ou com divisão de custos ao criar uma solicitação |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1-UVQWrdkaez_JIke8nw5cxCKAtkO-P28/view?usp=drive_link|

|*Caso de Teste*                                 |*CT07 - Visualizar histórico de viagens*                                        |
|---|---|
|Requisito Associado | RRF-004 - A aplicação deve permitir que o usuário visualize seu histórico de solicitações e ofertas, incluindo informações como origem, destino, data, horário e se viagem será gratuita ou com divisão de custos; RF-008 - A aplicação deve permitir que o usuário visualize seu histórico completo de interações concluídas, incluindo participação como motorista ou passageiro, e se a viagem incluiu entrega de encomendas ou não |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1vh2LoA3Qq1Lw3LiHS4BSpXJfrt4f3xRK/view?usp=drive_link|

|*Caso de Teste*                                 |*CT08 - Editar ou exluir solicitações*                                        |
|---|---|
|Requisito Associado | RF-005 - A aplicação deve permitir que o usuário edite ou exclua suas próprias solicitações ou ofertas de viagens e encomendas  |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1JWgbeH_57wi7qKnQbCgNeRZvJb6X3j_L/view?usp=drive_link|

|*Caso de Teste*                                 |*CT09 - Avaliação de usuários*                                        |
|---|---|
|Requisito Associado | RF-007 - A aplicação deve permitir que o usuário avalie outros participantes com estrelas e comentários, e exibir a média no perfil  |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1EqB4UnrfFYF6o1KhKWQZKFf7FKtQeH05/view?usp=drive_link e https://drive.google.com/file/d/1th3UoCz5rLm8lAnN4G-j6xKPs41nDwZY/view?usp=drive_link|

|*Caso de Teste*                                 |*CT10 - Chat interno*                                        |
|---|---|
|Requisito Associado | RF-009 - A aplicação deve permitir que o usuário se comunique com outros usuários envolvidos na publicação por meio de um chat interno  |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1ClVrhTZJxuGOAh3cI1xpaSalZBX7K3fg/view?usp=drive_link e https://drive.google.com/file/d/1iHdSTFspZ14TW2WNCFszQyVO0oc2Egp-/view?usp=drive_link|

|*Caso de Teste*                                 |*CT11 - Cadastrar local*                                        |
|---|---|
|Requisito Associado | RF-013 - A aplicação deve possibilitar o cadastro dos locais existentes na comunidade  |
|Link do vídeo do teste realizado: | https://drive.google.com/file/d/1JNbFzAjan0r-a9xdN13jxzzHXTRXKvXY/view?usp=drive_link|



## Avaliação dos Testes de Software

O objetivo dos testes foi avaliar a funcionalidade do sistema de gerenciamento das viagens, garantindo que os usuários pudessem visualizar e filtrar corretamente caronas e encomendas, bem como os papéis (motorista, passageiro, solicitante de encomendas e transportador de encomendas) fossem atribuídos corretamente. Além de garantir que a interface seja intuitiva e responsiva. 
Entre os pontos fortes identificados, destacam-se a interface clara e responsiva, que organiza informações em cards e utiliza cores e ícones para indicar status e papéis, facilitando a compreensão do usuário. Os filtros por status e tipo de caronas/encomendas funcionam de forma satisfatória, permitindo que o usuário visualize apenas os itens de seu interesse.


# Testes de Usabilidade

## Cenários de Teste de Usabilidade

| Nº do Cenário | Descrição do cenário |
|---------------|----------------------|
| 1             | Você é um usuário que deseja solicitar uma carona. Acesse a página “Caronas”, utilize os filtros para encontrar uma carona adequada à sua rota e veja os detalhes do motorista ou publique uma soliictação de carona. |
| 2             | Você é um usuário que deseja Oferecer uma carona. Acesse a página “Caronas”, utilize os filtros para encontrar um pedido de carona adequado à sua rota e veja os detalhes do passageiro ou publique uma oferta de carona. |
| 3            | Você é um usuário que deseja pedir o transporte de uma encomenda. Acesse a página “Encomendas”, utilize os filtros para encontrar uma eferta de transporte de encomenda adequada à sua rota e veja os detalhes do motorista ou publique uma soliictação de transporte de encomenda. |
| 4           | Você é um usuário que deseja oferecer o transporte de uma encomenda. Acesse a página “Encomendas”, utilize os filtros para encontrar um peido de transporte de encomenda adequado à sua rota e veja os detalhes do solicitante ou publique uma oferta de transporte de encomenda. |
| 5           | Você é um usuário que deseja visualizar suas caronas e encomendas. Acesse a página “Minhas Viagens”, aplique filtros para visualizar apenas viagens concluídas, canceladas, caronas e encomendas,  e verifique os detalhes de uma viagem específica.|
| 6           | Você é um usuário que deseja visualizar os locais cadastrados nas comunidades. Acesse a página “Comunidade”, aplique filtros para visualizar locais da região ou locais da comunidade selecionada, e conheça o local clicando no botão "conhecer local"



## Registro de Testes de Usabilidade

Cenário 1: Você é um usuário que deseja solicitar uma carona. Acesse a página “Caronas”, utilize os filtros para encontrar uma carona adequada à sua rota e veja os detalhes do motorista ou publique uma solicitação de carona.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 90 segundos                  |
| 2       | SIM             | 5                    | 120 segundos                  |
|  |  |  |  |
| **Média**     | 100%           | 5                | 105 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 60 segundos |


    Comentários dos usuários: Acharam a página de pedido de carona simples e intuitiva.


Cenário 2: Você é um usuário que deseja Oferecer uma carona. Acesse a página “Caronas”, utilize os filtros para encontrar um pedido de carona adequado à sua rota e veja os detalhes do passageiro ou publique uma oferta de carona.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 100 segundos                  |
| 2       | SIM             | 5                    | 125 segundos                  |
|  |  |  |  |
| **Média**     | 100%           | 5                | 112.5 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 60 segundos |


    Comentários dos usuários: Acharam a página de oferta de carona simples e intuitiva.

Cenário 3: Você é um usuário que deseja pedir o transporte de uma encomenda. Acesse a página “Encomendas”, utilize os filtros para encontrar uma eferta de transporte de encomenda adequada à sua rota e veja os detalhes do motorista ou publique uma soliictação de transporte de encomenda.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 155 segundos                  |
| 2       | SIM             | 5                    | 201 segundos                  |
|  |  |  |  |
| **Média**     | 100%           | 5                | 178 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 60 segundos |


    Comentários dos usuários: Acharam a página de pedido de encomenda simples e intuitiva.

Cenário 4: Você é um usuário que deseja oferecer o transporte de uma encomenda. Acesse a página “Encomendas”, utilize os filtros para encontrar um peido de transporte de encomenda adequado à sua rota e veja os detalhes do solicitante ou publique uma oferta de transporte de encomenda.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 122 segundos                  |
| 2       | SIM             | 5                    | 135 segundos                  |
|  |  |  |  |
| **Média**     | 100%           | 5                | 128.5 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 60 segundos |


    Comentários dos usuários: Acharam a página de oferta de encomenda simples e intuitiva.

Cenário 5: Você é um usuário que deseja visualizar suas caronas e encomendas. Acesse a página “Minhas Viagens”, aplique filtros para visualizar apenas viagens concluídas, canceladas, caronas e encomendas,  e verifique os detalhes de uma viagem específica.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 40 segundos                  |
| 2       | SIM             | 5                    | 42 segundos                  |
|  |  |  |  |
| **Média**     | 100%           | 5                | 41 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 20 segundos |


    Comentários dos usuários: Acharam a página de oferta de histórico de viagens bem completa.


Cenário 6: Você é um usuário que deseja visualizar os locais cadastrados nas comunidades. Acesse a página “Comunidade”, aplique filtros para visualizar locais da região ou locais da comunidade selecionada, e conheça o local clicando no botão "conhecer local"

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 151 segundos                  |
| 2       | SIM             | 5                    | 206 segundos                  |
|  |  |  |  |
| **Média**     | 100%           | 5                | 178.5 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 60 segundos |


    Comentários dos usuários: Acharam a página de locais simples e intuitiva.



## Avaliação dos Testes de Usabilidade

Os testes indicam que a aplicação Rota Colaborativa apresenta alta taxa de sucesso, com todos os usuários conseguindo concluir as tarefas propostas em todos os cenários. A satisfação subjetiva foi 5 para todos os testes, mostrando que os usuários consideram a interface simples e intuitiva, embora haja pequenas oportunidades de melhoria na visualização das viagens, filtros e status.

O tempo de conclusão dos usuários foi significativamente maior do que o do especialista. Essa diferença se deve principalmente ao nível de familiaridade com a tecnologia, que se mostrou menor entre os usuários testados, enquanto o especialista já possuía conhecimento prévio da interface.

Como resultado, o grupo pretende implementar melhorias nas próximas iterações, como:

Tentar reduzir a quantidade de elementos nas páginas, de modo que apenas as informações essenciais sejam exibidas. Isso permitirá que usuários com pouca familiaridade com tecnologia naveguem com maior agilidade, localizando rapidamente os filtros, status de caronas e encomendas, e acessando os detalhes importantes sem sobrecarga visual.




