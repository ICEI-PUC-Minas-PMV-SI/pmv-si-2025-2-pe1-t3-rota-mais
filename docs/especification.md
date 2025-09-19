# Especificações do Projeto

Nas áreas rurais do interior de Minas Gerais, os moradores enfrentam grandes dificuldades de locomoção e de envio ou recebimento de encomendas, devido à ausência de meios de transporte que garantam acesso fácil às cidades ou permitam que as entregas cheguem até suas residências. Isso gera consequências como altos custos de deslocamento, dependência de terceiros, insegurança ao viajar com desconhecidos e dificuldades em cumprir compromissos essenciais. Além disso, prejudica o acesso a serviços de saúde e educação, restringe a participação em atividades sociais e culturais e limita as oportunidades de comercialização de produtos locais.

Com base nessa realidade, foi projetada uma aplicação web para facilitar a comunicação entre moradores das áreas rurais que precisam se deslocar até a cidade ou retornar dela. A solução conecta motoristas e passageiros, criando oportunidades de carona que oferecem ao passageiro um meio de transporte acessível e ao motorista a possibilidade de reduzir custos.

Além disto, a plataforma amplia a autonomia dos usuários ao permitir o agendamento de caronas e entregas com praticidade, garantindo pontualidade e flexibilidade por meio de ajustes em caso de imprevistos. Isso facilita o cumprimento de compromissos, a participação em atividades sociais e o envio ou recebimento de encomendas. Além disso, promove economia com a divisão de despesas entre os participantes ou a oferta de caronas solidárias.

A segurança é garantida por meio de avaliações de motoristas e passageiros, aplicação de penalidades em casos de má conduta, cancelamentos com justificativa e priorização de viagens entre pessoas da própria comunidade. Outro ponto-chave é a usabilidade, a interface foi pensada para ser simples e intuitiva, considerando as necessidades de usuários com pouca familiaridade tecnológica ou mobilidade reduzida. A plataforma também fortalece os laços comunitários ao aproximar vizinhos e membros da região, estimulando a confiança e o apoio mútuo.

Apesar dos benefícios, o projeto apresenta algumas limitações. A baixa disponibilidade de internet em áreas rurais pode restringir o acesso à plataforma, e a adesão da comunidade é essencial para que o compartilhamento de caronas e entregas funcione de forma eficiente. Além disso, usuários com pouca familiaridade tecnológica podem necessitar de suporte adicional. Questões de segurança, como a confiabilidade dos motoristas e passageiros, também devem ser consideradas, assim como aspectos legais relacionados ao transporte e à responsabilidade em caso de incidentes.

Abordagens e Ferramentas:

- Análise de perfis de usuários, necessidades e comportamentos

- Criação de cenários de uso para ilustrar como a aplicação atende às demandas

- Definição de requisitos funcionais e não funcionais

- Identificação de restrições técnicas, operacionais e de recursos

## Personas

<img width="1146" height="576" alt="Image" src="https://github.com/user-attachments/assets/6f1d4a89-7bb1-41b1-b63d-67339cd9245f" />

[Persona 1](https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-2-pe1-t3-rota-mais/blob/main/docs/img/maria.png): Maria tem 43 anos, é avicultora e trabalha em uma pequena granja. Sua rotina é intensa, cuidando dos animais, da manutenção do galpão e das tarefas domésticas. Resiliente e perseverante, mantém o bom humor mesmo diante das dificuldades e sonha em ver os filhos estudando e conquistando oportunidades que ela não teve. Usa o celular para se comunicar com familiares, vizinhos e acompanhar notícias, Maria tem um carro, que utiliza principalmente para ir à cidade, mas enfrenta desafios devido à distância e aos gastos com combustível, o que dificulta a frequência de suas viagens. É uma pessoa simples, receptiva e que valoriza boas conversas, assim como a companhia daqueles que apreciam sua comida.

[Persona 2](https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-2-pe1-t3-rota-mais/blob/main/docs/img/amanda.jpeg): Amanda tem 16 anos, é estudante e ajuda os pais nas atividades da roça e nos cuidados com os animais. É tranquila, prestativa e muito responsável, conciliando os estudos com as tarefas do dia a dia. Apaixonada por cavalos, gosta de montar tanto por lazer quanto para auxiliar na lida com os animais. Dedica-se bastante à escola, especialmente às matérias que mais gosta, como biologia, e passa parte do tempo lendo romances. Participa ativamente do grupo de jovens da igreja e valoriza os momentos de convívio com amigos e família. Sonha em cursar medicina veterinária, unir sua paixão pelos animais à profissão e, no futuro, ter uma casa na cidade para oferecer mais conforto e qualidade de vida aos pais.

[Persona 3](https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-2-pe1-t3-rota-mais/blob/main/docs/img/jose_antonio.png): José Antônio tem 81 anos, é aposentado e vive no campo, onde construiu com esforço o patrimônio que hoje pertence à família. Homem de hábitos simples e profundamente ligado à natureza, gosta de acordar cedo, preparar o café e apreciar o nascer do sol. Apesar de enfrentar as limitações da idade e o tratamento contra um câncer no pâncreas, mantém-se ativo com pequenas ocupações e busca preservar sua autonomia, apoiando-se em objetos como a bengala, o chapéu de palha, o rádio e a televisão, que fazem parte de sua rotina. Carinhoso e protetor, sente alegria em conviver com a esposa, filhos e netos, contando histórias e acompanhando as brincadeiras das crianças. Seu maior sonho é ver os netos crescerem com saúde e felicidade, enquanto desfruta de qualidade de vida e da presença da família. José enfrenta grande dificuldade para se deslocar até a cidade, pois depende de transportes oferecidos pela prefeitura, que nem sempre estão disponíveis com a frequência necessária. Essa limitação compromete sua autonomia e dificulta o acesso regular a exames médicos e medicamentos essenciais para cuidar de sua saúde.

## Histórias de Usuários

Com base na análise das personas foram identificadas as seguintes histórias de usuários:

|EU COMO... `PERSONA`| QUERO/PRECISO ... `FUNCIONALIDADE`                                                 |PARA ... `MOTIVO/VALOR`                              |
|--------------------|------------------------------------------------------------------------------------|-----------------------------------------------------|
|Idoso               | Carona para minha consulta médica                                                  | Chegar de forma segura e confiável                  |
|Estudante           | Carona para ir a escola                                                            | Não precisar que um familiar me leve                |
|Motorista           | Alguém com quem dividir os custos da viagem                                        | Reduzir os custos da viagem e economizar dinheiro   |
|Trabalhador         | Alguém para buscar minhas encomendas                                               | Não precisar ir à cidade quando não tenho tempo     |
|Passageiro          | Recurso para acompanhar as minhas caronas e ser notificado em caso de cancelamento | Me organizar melhor                                 | 
|Dona de casa        | Uma carona para ir até a cidade e trazer minhas compras                            | Não precisar ir e voltar andando ou adiar minha ida |
|Vizinha             | Recurso para compartilhar caronas com pessoas que moram próximas a mim             | Reduzir custos e aumentar a segurança no trajeto    |
|Vendedor            | Meio facilitador de conseguir carona das minhas idas diárias á cidade              | Reduzir a fadiga de ir até a cidade                 |

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto.

### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade | 
|------|-----------------------------------------|----| 
|RF-001| A aplicação deve permitir que o usuário publique sua viagem para encontrar pessoas interessadas em caronas | ALTA |  
|RF-002| A aplicação deve permitir que o usuário publique uma solicitação para que alguém traga sua encomenda | ALTA | 
|RF-003| A aplicação deve permitir que o usuário encontre opções de caronas disponíveis de forma fácil e intuitiva | ALTA |
|RF-004| A aplicação deve permitir que o usuário visualize suas próximas viagens, encomendas que deve buscar ou que serão entregues por outros usuários | ALTA |
|RF-005| A aplicação deve permitir que o usuário edite suas publicações e/ou solicitações em caso de mudanças | ALTA |
|RF-006| A aplicação deve permitir que o usuário envie um alerta de emergência que deverá ser apresentado de forma destacada aos demais usuários | ALTA |
|RF-007| A aplicação deve permitir que o usuário avalie outros usuários que dividiu viagens | MÉDIA |
|RF-008| A aplicação deve permitir que o usuário visualize o seu histórico de viagens, caronas concedidas ou utilizadas e registros de encomendas | BAIXA |
|RF-009| A aplicação deve prover alguma forma de comunicação entre as pessoas envolvidas na viagem, seja diretamente pela aplicação ou direcionando para meios externos (como um link para WhatsApp) | ALTA |
|RF-010| A aplicação deve permitir que o usuário faça login com e-mail e senha | ALTA |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| A aplicação deve ser robusta, para carregar com maior facilidade em conexões mais limitadas | ALTA |
|RNF-002| A aplicação deve ser responsiva | ALTA | 
|RNF-003| A aplicação deve processar requisições do usuário em no máximo 3s |  BAIXA |
|RNF-004| A aplicação deve funcionar nos principais navegadores (Chrome, Firefox, Edge) | MÉDIA |
|RNF-005| A aplicação deve garantir a conformidade com as leis de proteção de dados | MÉDIA |
|RNF-006| Os dados do usuário deverão ser salvos automaticamente no navegador, sem que ele precise fazer algo extra | ALTA |
|RNF-007| A aplicação deve sempre solicitar confirmação antes de excluir informações, evitando exclusões acidentais | MÉDIA |

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                                                                                                      |
|--|--------------------------------------------------------------------------------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre                                                                          |
|02| Não pode ser desenvolvido um módulo de backend                                                                                 |
|03| A divisão de custos das viagens deverá ser feita de forma externa, não havendo funções de pagamento dentro da aplicação        |
