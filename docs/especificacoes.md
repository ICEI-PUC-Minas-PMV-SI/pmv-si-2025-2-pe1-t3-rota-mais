# Especificações do Projeto

Problema:

Moradores de áreas rurais do interior de Minas Gerais enfrentam dificuldades de locomoção e de envio/recebimento de encomendas. Isso gera desafios como altos custos de transporte, dependência de terceiros, insegurança ao viajar com desconhecidos, dificuldade em cumprir compromissos essenciais e limitações no acesso a serviços, produtos, educação e atividades sociais.

Solução:

Uma aplicação web que facilita caronas e envio de encomendas conecta usuários da mesma comunidade, oferecendo uma experiência prática, econômica, segura e confiável. A plataforma permite autonomia, possibilitando que os usuários agendem caronas e entregas com facilidade, realizem compromissos, participem de atividades sociais e recebam ou enviem encomendas sem depender de familiares ou terceiros.

Além disso, promove economia ao permitir a divisão de custos das viagens entre múltiplos usuários ou oferecer opções de caronas gratuitas, reduzindo despesas com transporte e entregas. A segurança e confiabilidade são garantidas por um sistema de avaliação de motoristas e passageiros, monitoramento em tempo real, penalidades, cancelamentos com justificativa e priorização de caronas com pessoas da própria comunidade.

A pontualidade e flexibilidade são atendidas por meio do acompanhamento de status em tempo real, agendamento de caronas e entregas, e ajustes em casos de imprevistos. A plataforma também promove conexão social, integrando vizinhos e outros membros da comunidade para aumentar a confiança e o apoio mútuo. A usabilidade é um ponto-chave, com interface simples e intuitiva, considerando usuários com dificuldade em tecnologia ou mobilidade reduzida.

Apesar dos benefícios, o projeto apresenta algumas limitações: a disponibilidade de internet em áreas rurais pode restringir o acesso à plataforma. A adesão dos usuários é essencial para que o compartilhamento de caronas e entregas funcione corretamente. Usuários com pouca familiaridade com tecnologia podem necessitar de suporte adicional.

Abordagens e Ferramentas:

- Análise de perfis de usuários, necessidades e comportamentos

- Criação de cenários de uso para ilustrar como a aplicação atende às demandas

- Definição de requisitos funcionais e não funcionais

- Identificação de restrições técnicas, operacionais e de recursos


## Personas

[Pesrona 1](https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-2-pe1-t3-rota-mais/blob/main/docs/img/maria.png): Maria tem 43 anos, é avicultora e trabalha em uma pequena granja. Sua rotina é intensa, cuidando dos animais, da manutenção do galpão e das tarefas domésticas. Resiliente e perseverante, mantém o bom humor mesmo diante das dificuldades e sonha em ver os filhos estudando e conquistando oportunidades que ela não teve. Usa o celular para se comunicar com familiares, vizinhos e acompanhar notícias, mas enfrenta desafios com o deslocamento até a cidade, já que a distância e os gastos com combustível dificultam a frequência das viagens. É uma pessoa simples, receptiva e que valoriza boas conversas e a companhia de quem aprecia sua comida.

[Pesrona 2](https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-2-pe1-t3-rota-mais/blob/main/docs/img/amanda.jpeg): Amanda tem 16 anos, é estudante e ajuda os pais nas atividades da roça e nos cuidados com os animais. É tranquila, prestativa e muito responsável, conciliando os estudos com as tarefas do dia a dia. Apaixonada por cavalos, gosta de montar tanto por lazer quanto para auxiliar na lida com os animais. Dedica-se bastante à escola, especialmente às matérias que mais gosta, como biologia, e passa parte do tempo lendo romances. Participa ativamente do grupo de jovens da igreja e valoriza os momentos de convívio com amigos e família. Sonha em cursar medicina veterinária, unir sua paixão pelos animais à profissão e, no futuro, ter uma casa na cidade para oferecer mais conforto e qualidade de vida aos pais.

[Pesrona 3](https://github.com/ICEI-PUC-Minas-PMV-SI/pmv-si-2025-2-pe1-t3-rota-mais/blob/main/docs/img/jose_antonio.png): José Antônio tem 81 anos, é aposentado e vive no campo, onde construiu com esforço o patrimônio que hoje pertence à família. Homem de hábitos simples e profundamente ligado à natureza, gosta de acordar cedo, preparar o café e apreciar o nascer do sol. Apesar de enfrentar as limitações da idade e o tratamento contra um câncer no pâncreas, mantém-se ativo com pequenas ocupações e busca preservar sua autonomia, apoiando-se em objetos como a bengala, o chapéu de palha, o rádio e a televisão, que fazem parte de sua rotina. Carinhoso e protetor, sente alegria em conviver com a esposa, filhos e netos, contando histórias e acompanhando as brincadeiras das crianças. Seu maior sonho é ver os netos crescerem com saúde e felicidade, enquanto desfruta de qualidade de vida e da presença da família.


## Histórias de Usuários

Com base na análise das personas foram identificadas as seguintes histórias de usuários:

|EU COMO... `PERSONA`| QUERO/PRECISO ... `FUNCIONALIDADE`                                                 |PARA ... `MOTIVO/VALOR`                              |
|--------------------|------------------------------------------------------------------------------------|-----------------------------------------------------|
|Idoso               | Carona para minha consulta médica                                                  | Ir sozinho de forma segura e confiável              |
|Estudante           | Carona para ir a escola                                                            | Não precisar de um familiar para me levar           |
|Trabalhador         | Alguém para buscar minhas encomendas                                               | Evitar deslocamento à cidade quando não tenho tempo |
|Passageiro          | Recurso para acompanhar as minhas caronas e ser notificado em caso de cancelamento | Me organizar melhor                                 | 
|Dona de casa        | Uma carona para ir até a cidade e trazer minhas compras                            | Não precise ir e voltar andando ou adiar a ida      |
|Vizinha             | Recurso para compartilhar caronas com pessoas que moram próximas a mim             | Reduzir custos e aumentar a segurança no trajeto    |
|Vendedor            | Meio facilitador de conseguir carona das minhas idas diárias á cidade              | Reduzir a fadiga de ir até a cidade                 |


## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto.

### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade | 
|------|-----------------------------------------|----| 
|RF-001| A aplicação deve permitir que o usuário publique sua viagem para encontrar pessoas interessadas em caronas | ALTA |  
|RF-002| A aplicação deve permitir que o usuário publique uma solicitação para que alguém traga sua encomenda | ALTA | 
|RF-003| A aplicação deve permitir que o usuário envie um alerta de emergência que deverá ser apresentado de forma destacada aos demais usuários | ALTA |
|RF-004| A aplicação deve permitir que o usuário avalie outros usuários que dividiu viagens | MÉDIA |
|RF-005| A aplicação deve permitir que o usuário monitore o percurso das viagens em tempo real, seja ele o motorista ou apenas passageiro | MÉDIA |
|RF-006| A aplicação deve permitir que o usuário converse com outros usuários por um chat de texto | BAIXA |
|RF-007| A aplicação deve permitir que o usuário faça login com e-mail e senha | ALTA |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| A aplicação deverá ser leve para carregar com maior facilidade em conexões mais limitadas | MÉDIA |
|RNF-002| A aplicação deve ser responsiva | MÉDIA | 
|RNF-003| A aplicação deve processar requisições do usuário em no máximo 3s |  BAIXA |
|RNF-004| A aplicação deve funcionar nos principais navegadores (Chrome, Firefox, Edge) | MÉDIA |
|RNF-005| A aplicação deve garantir a conformidade com as leis de proteção de dados | MÉDIA |
|RNF-006| Os dados do usuário deverão ser salvos automaticamente no navegador, sem que ele precise fazer algo extra | ALTA |
|RNF-007| A aplicação deve sempre solicitar confirmação antes de excluir informações, evitando exclusões acidentais | MÉDIA |

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |
|02| A divisão de custos das viagens deverá ser feita de forma externa, não havendo funções de pagamento dentro da aplicação        |
