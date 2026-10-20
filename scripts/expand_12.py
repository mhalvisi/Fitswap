"""Curadoria inicial 1.2: equipamentos de musculação e exercícios associados.
Sem mídia de terceiros. Não substitui revisão de profissional de Educação Física.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
path=root/'dados.js'
raw=path.read_text(encoding='utf-8')
assert raw.startswith('window.FITSWAP_DATA = ')
base=json.loads(raw[len('window.FITSWAP_DATA = '):].strip().rstrip(';'))
assert len(base['equipment'])==62 and len(base['exercises'])==103, 'Expansão exige base original antes de aplicar'
# ID | nome | grupo | aliases separados por ; | descrição objetiva
rows='''
pulldown_divergent|Puxada alta articulada divergente|Costas|lat pulldown divergente;pulldown divergente;puxada isolateral divergente|Braços articulados com trajetória divergente; verificar pegadas e ajustes do fabricante.
row_iso|Remada articulada unilateral|Costas|remada isolateral;iso lateral row;remada unilateral articulada|Braços independentes para remada horizontal, com possibilidade de trabalho unilateral.
row_chest|Remada com apoio peitoral|Costas|chest supported row;remada apoiada;remada com peito apoiado|Máquina ou banco de remada com apoio do tórax e trajetória guiada.
chest_decline|Chest press declinado|Peito|supino declinado máquina;decline chest press|Máquina de empurrar com trajetória de supino declinado.
dip_press|Mergulho sentado na máquina|Peito|seated dip;dip press;maquina de mergulho|Máquina que permite extensão dos cotovelos e movimento de mergulho com apoio sentado.
incline_fly_machine|Crucifixo inclinado na máquina|Peito|incline pec fly;voador inclinado;crucifixo articulado inclinado|Máquina específica para adução dos braços em plano inclinado.
shoulder_iso|Desenvolvimento articulado independente|Ombros|iso lateral shoulder press;shoulder press isolateral|Máquina para desenvolvimento com braços de movimento independente.
front_machine|Elevação frontal na máquina|Ombros|front raise machine;elevacao frontal guiada|Máquina para elevação frontal dos braços com resistência guiada.
triceps_overhead_machine|Tríceps acima da cabeça na máquina|Braços|overhead triceps machine;triceps overhead articulado|Máquina dedicada à extensão dos cotovelos com braços elevados.
forearm_roller|Rolo para antebraços|Braços|wrist roller;rolo de punho|Rolo com corda e carga para movimentos controlados dos punhos.
nordic_bench|Banco de flexão nórdica|Pernas|nordic curl bench;nordic bench;ancoragem nordic|Banco com fixação das pernas para progressões de flexão nórdica.
calf_donkey|Máquina de panturrilha donkey|Pernas|donkey calf raise;donkey machine|Máquina para flexão plantar com o tronco inclinado.
v_squat|Máquina de agachamento V-squat|Pernas|v squat machine;agachamento v;agachamento articulado v|Máquina de agachamento com trajetória guiada em V.
glute_abduction_stand|Abdutora em pé|Pernas|standing hip abductor;abducao em pe maquina|Máquina para abdução de quadril na posição em pé.
leg_press_uni|Leg press unilateral dedicado|Pernas|single leg press;leg press individual;leg press unilateral maquina|Máquina de leg press com plataforma independente ou estação dedicada ao trabalho unilateral.
rope_triceps|Corda para polia|Acessórios|corda de triceps;rope attachment;puxador corda|Acessório de corda usado em exercícios de cabo; requer uma polia compatível.
straight_handle|Barra reta para polia|Acessórios|puxador reto;straight bar attachment;barra de polia|Puxador reto removível de máquinas de cabo.
v_handle|Pegador triangular para remada|Acessórios|triangulo de remada;v grip;pegador fechado|Acessório de pegada neutra para sistemas de cabo.
ankle_strap|Tornozeleira para polia|Acessórios|caneleira de polia;ankle cuff;tornozeleira cabo|Acessório de fixação ao tornozelo para exercícios em sistemas de cabo.
weight_plate|Anilha avulsa|Pesos livres|disco de peso;weight plate;anilhas|Disco de carga usado em barras, máquinas ou exercícios de resistência manual.
medicine_ball|Bola medicinal|Funcional|medicine ball;bola com peso;bola de treinamento|Bola com carga destinada a exercícios de força e controle de tronco.
ab_wheel|Roda abdominal|Core|ab roller;roda de abdomen;rolo abdominal|Roda com pegadores para extensão e retorno controlados do tronco.
decline_bench|Banco declinado|Bancos|banco de supino declinado;decline bench|Banco ajustado para supino em ângulo declinado.
ab_bench|Banco abdominal declinado|Bancos|sit up bench;banco de abdominal declinado|Banco com apoio dos pés para trabalho de flexão do tronco.
bosu|Bola de equilíbrio tipo BOSU|Funcional|balance trainer;meia bola de equilibrio;bosu ball|Plataforma instável sem marca ou fabricante específico associado.
sandbag|Saco de areia para treino|Funcional|sandbag;power bag;bolsa de areia|Bolsa de treino com carga ajustada para movimentos de resistência.
pushup_handles|Apoios para flexões|Funcional|push up bars;pegador de flexao;paraletes baixas|Apoios baixos para mãos durante flexões no solo.
'''.strip().splitlines()
for line in rows:
  cells=[c.strip() for c in line.split('|')]
  assert len(cells)==5,(cells,len(cells))
  id,name,group,aliases,description=cells
  assert id not in {x['id'] for x in base['equipment']},id
  base['equipment'].append({'id':id,'name':name,'group':group,'aliases':[a.strip() for a in aliases.split(';')],'description':description})

# Busca BR: termos comuns para equipamentos já existentes, preservando todos os IDs dos favoritos.
aliases={
 'leg45':['leg press 45 graus','leg press inclinado 45'], 'leg_h':['leg press horizontal articulado'],
 'smith':['multipower','gaiola smith'], 'hack':['hack squat articulado'],
 'chest':['supino máquina','chest press reto'],'chest_incline':['supino inclinado máquina'],
 'pulldown':['pulley frente','puxador costas','lat pulldown'],
 'row_plate':['remada máquina articulada'],'row_seated':['remada cabo baixo','remada sentada polia'],
 'crossover':['cross over','polia dupla'],'polia_ajustavel':['torre de polia regulável'],
 'banco_incl':['banco regulável','banco 30 graus'],'abdutora':['abdução máquina'],
 'adutora':['adução máquina'],'pant_pe':['panturrilha máquina em pé'],
 'barra_fixa':['barra de puxada'],'assisted':['graviton','barra fixa graviton'],
 'barra_w':['barra ez'],'elastico':['miniband','faixa de resistência'],
 'rack':['suporte de agachamento','power rack']
}
for eq in base['equipment']:
  for alias in aliases.get(eq['id'],[]):
    if alias.casefold() not in [x.casefold() for x in eq['aliases']]:eq['aliases'].append(alias)

# id | nome | padrão | músculos principais CSV | músculos secundários CSV | conjunto(s) separado por ;, itens separados por + | tipo | nível | preparação | execução | retorno
exercises='''
puxada_divergente|Puxada alta divergente bilateral|puxar_vertical|costas|biceps+ombro_post|pulldown_divergent|Composto|Todos|Ajuste banco e apoios para manter o tronco estável.|Puxe os braços articulados em direção à parte superior do tórax sem inclinar excessivamente o corpo.|Deixe os braços retornarem com controle até alongamento confortável.
puxada_divergente_uni|Puxada alta divergente unilateral|puxar_vertical|costas|biceps|pulldown_divergent|Composto|Intermediário|Ajuste o assento e use apenas um braço articulado por vez.|Puxe o pegador mantendo os ombros nivelados e o tronco estável.|Retorne lentamente sem rodar o tronco para compensar.
remada_isolateral|Remada articulada isolateral|remar_horizontal|costas|biceps+ombro_post|row_iso|Composto|Todos|Ajuste o assento e apoie o tórax quando a máquina permitir.|Traga os pegadores em direção ao tronco com os cotovelos próximos à trajetória prevista.|Estenda os braços devagar sem perder a posição do corpo.
remada_isolateral_uni|Remada articulada com um braço|remar_horizontal|costas|biceps|row_iso|Composto|Intermediário|Mantenha o tórax apoiado e selecione um braço de cada vez.|Puxe o pegador sem girar a cintura em direção à carga.|Volte lentamente até estender o braço sem soltar o controle.
remada_apoio_peito|Remada na máquina com apoio peitoral|remar_horizontal|costas|biceps+ombro_post|row_chest|Composto|Todos|Ajuste o apoio para manter o peito estável durante toda a série.|Puxe as alças em direção às costelas sem projetar o pescoço.|Retorne com as escápulas controladas e sem levantar o tórax do apoio.
remada_halter_apoio_incl|Remada com halteres apoiado no banco inclinado|remar_horizontal|costas|biceps+ombro_post|halter+banco_incl|Composto|Todos|Deite o peito sobre banco inclinado com pés bem apoiados.|Puxe os halteres ao lado do tronco sem levantar a cabeça.|Estenda os braços de maneira controlada mantendo apoio do peito.
puxada_unilateral_polia|Puxada unilateral na polia alta|puxar_vertical|costas|biceps|polia_alta|Composto|Intermediário|Ajuste pegador e distância para evitar o tronco torcido.|Puxe o cotovelo para baixo em direção ao quadril mantendo o ombro controlado.|Retorne o braço de modo lento sem inclinar o corpo.
remada_baixa_aberta|Remada baixa com pegada aberta|remar_horizontal|costas|biceps+ombro_post|row_seated|Composto|Todos|Sente-se com coluna estável e use pegador de abertura compatível.|Traga o pegador ao tronco mantendo cotovelos abertos de forma confortável.|Devolva o peso sem usar balanço do tronco.
barra_fixa_neutra|Barra fixa com pegada neutra|puxar_vertical|costas|biceps|barra_fixa|Composto|Intermediário|Use uma barra com pegadores paralelos e sustente o corpo com controle.|Eleve o peito em direção aos pegadores sem forçar o pescoço.|Desça devagar até extensão confortável dos cotovelos.
pullover_halter|Pullover com halter no banco|extensao_ombro|costas|peito+triceps|halter+banco_reto|Composto|Intermediário|Deite-se no banco e segure o halter com pegada segura acima do tórax.|Leve o halter para trás dentro de amplitude confortável sem arquear excessivamente a lombar.|Retorne acima do tórax mantendo o movimento controlado.
supino_declinado_halter|Supino declinado com halteres|empurrar_horizontal|peito|triceps+ombro_ant|halter+decline_bench|Composto|Intermediário|Prenda os pés e deite no banco declinado com ajuda para posicionar os halteres.|Empurre os halteres em trajetória estável sem chocar os pesos.|Desça lentamente até amplitude confortável para os ombros.
supino_declinado_barra|Supino declinado com barra|empurrar_horizontal|peito|triceps+ombro_ant|barra+decline_bench|Composto|Intermediário|Ajuste o banco declinado em estação segura com apoio e travas adequados.|Desça a barra de forma controlada à região inferior do tórax.|Empurre mantendo cotovelos e punhos alinhados e use observador quando necessário.
chest_press_declinado|Chest press declinado na máquina|empurrar_horizontal|peito|triceps+ombro_ant|chest_decline|Composto|Todos|Regule assento e alcance dos pegadores segundo a máquina.|Empurre mantendo o tórax apoiado e o movimento simétrico.|Retorne à posição inicial sem deixar a carga bater.
mergulho_maquina|Mergulho sentado na máquina|extensao_cotovelo|triceps|peito+ombro_ant|dip_press|Composto|Todos|Ajuste o assento e apoie as costas conforme os encostos disponíveis.|Empurre os pegadores para baixo por extensão dos cotovelos.|Volte devagar sem perder o contato com os apoios.
crucifixo_inclinado_maquina|Crucifixo inclinado na máquina|aducao_peito|peito|ombro_ant|incline_fly_machine|Isolador|Todos|Ajuste assento e pegadores para manter os ombros confortáveis.|Aproxime os braços à frente e acima do tronco com cotovelos suavemente flexionados.|Abra os braços com controle sem ultrapassar amplitude confortável.
chest_press_convergente|Chest press convergente|empurrar_horizontal|peito|triceps+ombro_ant|chest_conv|Composto|Todos|Ajuste o banco para que os pegadores fiquem próximos da linha do peito.|Empurre acompanhando a trajetória convergente da máquina.|Retorne devagar mantendo o tórax apoiado.
crucifixo_inclinado_halter|Crucifixo inclinado com halteres|aducao_peito|peito|ombro_ant|halter+banco_incl|Isolador|Intermediário|Regule o banco com inclinação moderada e deite-se com estabilidade.|Abra os braços com pequena flexão dos cotovelos sem forçar o ombro.|Aproxime os halteres acima do peito sem batê-los.
flexao_maos_elevadas|Flexão de braços com mãos elevadas|empurrar_horizontal|peito|triceps+ombro_ant|banco_reto|Composto|Todos|Posicione mãos num apoio firme e corpo alinhado da cabeça aos calcanhares.|Flexione os cotovelos aproximando o peito do apoio sem afundar a lombar.|Empurre de volta até a posição inicial, sem travar excessivamente os cotovelos.
flexao_apoios|Flexão de braços com pegadores|empurrar_horizontal|peito|triceps+ombro_ant|pushup_handles|Composto|Todos|Apoie os pegadores firmemente no chão e alinhe o corpo em prancha.|Flexione os cotovelos dentro de amplitude confortável para os ombros.|Estenda os cotovelos mantendo o abdômen ativo.
desenvolvimento_isolateral|Desenvolvimento isolateral na máquina|empurrar_vertical|ombro_ant|triceps+ombro_lat|shoulder_iso|Composto|Todos|Regule o banco para começar com os pegadores próximos aos ombros.|Empurre os dois braços independentes para cima mantendo o tronco apoiado.|Retorne ao início de forma simétrica e controlada.
desenvolvimento_arnold|Desenvolvimento Arnold com halteres|empurrar_vertical|ombro_ant|triceps+ombro_lat|halter+banco_incl|Composto|Intermediário|Sente-se no banco com os halteres à frente dos ombros.|Eleve os halteres girando os antebraços gradualmente sem perder estabilidade.|Desça pelo mesmo percurso mantendo o tronco apoiado.
elevacao_frontal_maquina|Elevação frontal guiada na máquina|flexao_ombro|ombro_ant|ombro_lat|front_machine|Isolador|Todos|Ajuste assento e posicionamento dos braços na máquina.|Eleve os braços pela trajetória guiada até altura confortável.|Desça sem perder a tensão e sem elevar o tronco.
elevacao_frontal_halter|Elevação frontal com halteres|flexao_ombro|ombro_ant|ombro_lat|halter|Isolador|Todos|Fique em pé com abdômen firme e halteres à frente das coxas.|Eleve um ou ambos os braços à frente até amplitude confortável.|Desça lentamente sem usar impulso das pernas.
elevacao_lateral_uni_polia|Elevação lateral unilateral na polia|abducao_ombro|ombro_lat|ombro_ant|polia_ajustavel|Isolador|Todos|Ajuste a polia baixa e segure o pegador com o braço do lado oposto.|Eleve o braço lateralmente mantendo cotovelo suavemente flexionado.|Retorne com controle sem girar o tronco.
crucifixo_inverso_cabo|Crucifixo inverso no crossover|abducao_horizontal|ombro_post|trapezio|crossover|Isolador|Todos|Regule as polias e cruze os pegadores à frente do corpo.|Abra os braços mantendo ombros baixos e cotovelos semiflexionados.|Feche devagar sem deixar a carga puxar o tronco.
encolh_smith|Encolhimento de ombros no Smith|elevacao_escapula|trapezio|antebraco|smith|Isolador|Todos|Ajuste a altura de saída da barra e mantenha os pés firmes.|Eleve os ombros verticalmente sem rodá-los para trás.|Abaixe-os de modo controlado, com o pescoço neutro.
rosca_concentrada|Rosca concentrada com halter|flexao_cotovelo|biceps|antebraco|halter+banco_reto|Isolador|Todos|Sente-se com cotovelo apoiado na região interna da coxa.|Flexione o cotovelo erguendo o halter sem mover o ombro.|Desça controladamente sem deixar o braço relaxar abruptamente.
rosca_martelo_corda|Rosca martelo com corda na polia|flexao_cotovelo_neutra|biceps|antebraco|polia_baixa+rope_triceps|Isolador|Todos|Conecte a corda à polia baixa e mantenha punhos em pegada neutra.|Flexione os cotovelos sem projetar ombros ou balançar o tronco.|Volte devagar até extensão confortável.
rosca_inversa_polia|Rosca inversa com barra na polia|flexao_cotovelo_pronada|antebraco|biceps|polia_baixa+straight_handle|Isolador|Todos|Conecte a barra reta à polia baixa e use pegada pronada.|Flexione os cotovelos mantendo punhos e ombros estáveis.|Retorne lentamente sem estalar os cotovelos.
rosca_biceps_ez|Rosca direta com barra W|flexao_cotovelo|biceps|antebraco|barra_w|Isolador|Todos|Segure a barra W com punhos confortáveis e tronco ereto.|Flexione os cotovelos sem projetá-los à frente para compensar carga.|Desça com controle até quase estender os braços.
rosca_scott_halter|Rosca Scott unilateral com halter|flexao_cotovelo|biceps|antebraco|scott_banco+halter|Isolador|Todos|Apoie a parte posterior do braço no banco Scott.|Flexione o cotovelo aproximando o halter sem tirar o braço do apoio.|Retorne lentamente, evitando hiperextensão sob carga.
triceps_overhead_maquina|Tríceps acima da cabeça na máquina|extensao_cotovelo|triceps||triceps_overhead_machine|Isolador|Todos|Ajuste a posição dos braços conforme os apoios da máquina.|Estenda os cotovelos mantendo a parte superior dos braços estável.|Volte de forma controlada até flexão confortável.
triceps_frances_corda|Tríceps francês com corda na polia alta|extensao_cotovelo|triceps||polia_alta+rope_triceps|Isolador|Todos|Conecte a corda na polia e posicione-se com apoio firme dos pés.|Estenda os cotovelos à frente ou acima da cabeça conforme a direção do cabo.|Flexione-os lentamente sem forçar a região lombar.
triceps_unilateral_polia|Extensão unilateral de tríceps na polia|extensao_cotovelo|triceps||polia_alta|Isolador|Todos|Ajuste a polia e segure o pegador com um braço.|Estenda o cotovelo sem girar o tronco ou elevar o ombro.|Retorne ao ângulo inicial controlando o peso.
triceps_mergulho_banco|Mergulho no banco|extensao_cotovelo|triceps|peito+ombro_ant|banco_reto|Composto|Intermediário|Apoie as mãos em banco firme, com os pés estáveis no chão.|Flexione os cotovelos apenas na amplitude confortável dos ombros.|Empurre de volta sem deixar o ombro deslocar-se excessivamente para frente.
triceps_polia_barra_reta|Tríceps na barra reta da polia|extensao_cotovelo|triceps||polia_alta+straight_handle|Isolador|Todos|Conecte a barra reta à polia alta e mantenha o corpo estável.|Estenda os cotovelos mantendo os braços junto ao tronco.|Retorne sem permitir que a carga levante os ombros.
roller_antebraco|Rolo de punho para antebraços|flexao_punho|antebraco||forearm_roller|Isolador|Intermediário|Segure o rolo com ambos os braços e carga leve adequada.|Gire os punhos gradualmente para enrolar a corda e elevar a carga.|Desenrole lentamente controlando a descida.
extensao_punho_halter|Extensão de punhos com halteres|extensao_punho|antebraco||halter+banco_reto|Isolador|Todos|Apoie antebraços em banco com as palmas voltadas para baixo.|Eleve as mãos usando extensão dos punhos sem tirar os braços do apoio.|Abaixe lentamente até amplitude confortável.
v_squat_ex|Agachamento V-squat na máquina|agachar_guiado|quadriceps|gluteos+posterior|v_squat|Composto|Todos|Ajuste os ombros e pés às marcações seguras do equipamento.|Flexione quadril e joelhos seguindo a trajetória guiada sem perder alinhamento.|Estenda as pernas sem bloquear totalmente os joelhos sob carga.
leg_press_uni_ex|Leg press unilateral dedicado|empurrar_pernas|quadriceps|gluteos+posterior|leg_press_uni|Composto|Todos|Ajuste assento e um dos pés ao centro da plataforma individual.|Empurre a plataforma sem deixar o joelho colapsar para dentro.|Flexione o joelho lentamente dentro de amplitude confortável.
legpress45_uni|Leg press 45° com uma perna|empurrar_pernas|quadriceps|gluteos+posterior|leg45|Composto|Intermediário|Use carga reduzida e coloque apenas um pé bem apoiado na plataforma.|Empurre mantendo a pelve em contato com o encosto e joelho alinhado.|Volte controlando a descida sem deixar o quadril perder estabilidade.
agach_sumo_halter|Agachamento sumô com halter|agachar|quadriceps|gluteos+adutores|halter|Composto|Todos|Fique em pé com base mais ampla e halter seguro à frente do corpo.|Flexione os joelhos seguindo a direção dos pés e mantendo a coluna neutra.|Suba estendendo quadril e joelhos de forma controlada.
agach_landmine|Agachamento com barra landmine|agachar|quadriceps|gluteos|landmine+barra|Composto|Todos|Fixe a barra na base landmine e segure sua extremidade à frente do peito.|Agache mantendo os pés apoiados e os joelhos alinhados.|Suba mantendo o tronco estável e o peso próximo.
agach_frontal_barra|Agachamento frontal com barra|agachar|quadriceps|gluteos+abdomen|rack+barra|Composto|Intermediário|Posicione a barra sobre a parte frontal dos ombros em rack seguro.|Agache mantendo cotovelos elevados e o tronco controlado.|Suba sem perder o equilíbrio e recoloque a barra no suporte.
passada_reversa_halter|Passada reversa com halteres|agachar_unilateral|quadriceps|gluteos|halter|Composto|Todos|Fique em pé com halteres aos lados e abdômen estabilizado.|Dê um passo para trás flexionando ambas as pernas com o tronco controlado.|Empurre o chão com a perna da frente e volte à posição inicial.
afundo_smith|Afundo estático no Smith|agachar_unilateral|quadriceps|gluteos|smith|Composto|Intermediário|Ajuste a barra e posicione os pés afastados em base estável.|Flexione os joelhos com a barra seguindo o trilho, sem forçar o quadril.|Suba com controle e mantenha os pés na mesma posição.
extensora_unilateral|Extensão unilateral na cadeira extensora|extensao_joelho|quadriceps||extensora|Isolador|Todos|Regule banco e rolo para alinhar joelho e eixo da máquina.|Estenda apenas uma perna sem elevar o quadril do assento.|Desça a carga lentamente até flexão confortável.
flexora_mesa_uni|Flexão unilateral na mesa flexora|flexao_joelho|posterior||flexora_mesa|Isolador|Todos|Deite-se e ajuste o rolo próximo à parte inferior da perna.|Flexione um joelho por vez sem tirar o quadril do banco.|Volte devagar mantendo a outra perna relaxada e segura.
flexora_nordica|Flexão nórdica assistida|flexao_joelho|posterior|gluteos|nordic_bench|Composto|Avançado|Fixe os tornozelos no banco nórdico e mantenha tronco e quadris alinhados.|Incline o corpo lentamente à frente resistindo com a parte posterior da coxa.|Use os braços para amortecer e ajudar no retorno, evitando queda abrupta.
stiff_halter|Levantamento romeno com halteres|dobrar_quadril|posterior|gluteos+lombar|halter|Composto|Todos|Fique de pé com halteres à frente das coxas e joelhos suavemente flexionados.|Leve o quadril para trás descendo os halteres próximos às pernas.|Volte estendendo o quadril, sem arredondar excessivamente a coluna.
terra_sumo|Levantamento terra sumô com barra|levantar_carga|gluteos|posterior+quadriceps|barra|Composto|Intermediário|Posicione pés mais abertos e a barra sobre o meio dos pés.|Segure a barra entre as pernas e levante mantendo o tronco organizado.|Desça aproximando a barra do corpo com controle.
hip_thrust_smith|Elevação pélvica no Smith|extensao_quadril|gluteos|posterior|smith+banco_reto|Composto|Intermediário|Apoie a parte superior das costas em banco estável sob barra acolchoada.|Eleve o quadril sem hiperestender a lombar e mantendo os joelhos alinhados.|Desça lentamente antes de repetir, conferindo travas de segurança.
hip_bridge_uni|Ponte de glúteo unilateral no solo|extensao_quadril|gluteos|posterior|colchonete|Composto|Todos|Deite-se com um pé apoiado no solo e o outro elevado.|Eleve o quadril mantendo a pelve nivelada sem arquear a lombar.|Retorne suavemente à posição inicial.
abducao_em_pe_maquina|Abdução de quadril em pé na máquina|abducao_quadril|abdutores|gluteos|glute_abduction_stand|Isolador|Todos|Ajuste suportes e pegadores da abdutora em pé.|Afaste a perna pela trajetória prevista mantendo a pelve estável.|Retorne sem rodar a cintura para gerar impulso.
abducao_deitado|Abdução lateral de quadril no solo|abducao_quadril|abdutores|gluteos|colchonete|Isolador|Todos|Deite de lado mantendo pernas alinhadas ao tronco.|Eleve a perna superior sem rodar quadril ou inclinar o tronco.|Desça lentamente mantendo a pelve empilhada.
aducao_deitado|Adução de quadril deitado de lado|aducao_quadril|adutores||colchonete|Isolador|Todos|Deite de lado com a perna superior apoiada à frente.|Eleve a perna de baixo sem girar o quadril.|Abaixe devagar sem perder a posição lateral.
pant_donkey_ex|Elevação de panturrilha na máquina donkey|flexao_plantar|panturrilha||calf_donkey|Isolador|Todos|Ajuste a máquina para manter o tronco apoiado e os pés na plataforma.|Eleve os calcanhares contra a resistência sem balançar o corpo.|Abaixe lentamente até alongamento confortável.
pant_sent_halter|Elevação de panturrilha sentado com halter|flexao_plantar_sentada|panturrilha||halter+banco_reto|Isolador|Todos|Sente no banco com halteres apoiados com segurança sobre as coxas.|Eleve os calcanhares mantendo as pontas dos pés apoiadas.|Abaixe lentamente sem levantar o banco ou mover os joelhos.
pant_unilateral_degrau|Elevação unilateral de panturrilha no step|flexao_plantar|panturrilha||step|Isolador|Todos|Apoie um pé em step estável usando apoio para equilíbrio se preciso.|Eleve o calcanhar sem deixar o tornozelo inclinar.|Desça até amplitude confortável antes da próxima repetição.
crunch_banco_declinado|Abdominal curto em banco declinado|flexao_tronco|abdomen||ab_bench|Isolador|Todos|Fixe os pés de modo seguro no banco abdominal.|Flexione suavemente a parte superior do tronco sem puxar a cabeça.|Retorne mantendo o abdômen ativo sem lançar o corpo para trás.
ab_wheel_joelhos|Roda abdominal ajoelhado|anti_extensao|abdomen|lombar|ab_wheel+colchonete|Composto|Intermediário|Ajoelhe-se sobre tapete com roda posicionada à frente.|Role lentamente para frente sem perder a estabilidade lombar.|Puxe a roda de volta com o abdômen ativo em amplitude que consiga controlar.
prancha_lateral|Prancha lateral no solo|estabilizacao_tronco|abdomen|gluteos|colchonete|Isométrico|Todos|Apoie antebraço no solo alinhado com o ombro e pernas empilhadas ou flexionadas.|Eleve o quadril até formar linha estável entre ombro e pernas.|Mantenha a postura respirando sem deixar o tronco rodar.
dead_bug|Dead bug|estabilizacao_tronco|abdomen|lombar|colchonete|Composto|Todos|Deite de barriga para cima com quadril e joelhos flexionados e braços elevados.|Estenda lentamente braço e perna opostos sem arquear a lombar.|Retorne e alterne os lados mantendo a respiração estável.
prancha_bosu|Prancha com antebraços na bola de equilíbrio|estabilizacao_tronco|abdomen|ombro_ant|bosu|Isométrico|Intermediário|Apoie os antebraços na plataforma de equilíbrio com os pés estáveis.|Mantenha o tronco em linha reta sem movimentar excessivamente o equipamento.|Respire e encerre antes de perder o alinhamento.
rotacao_bola_medicinal|Rotação de tronco sentado com bola medicinal|rotacao_tronco|abdomen||medicine_ball+colchonete|Composto|Intermediário|Sente no tapete com joelhos flexionados e bola próxima do peito.|Gire o tronco suavemente de um lado ao outro sem usar apenas os braços.|Mantenha a lombar estável e reduza a amplitude se houver desconforto.
woodchopper_polia|Rotação diagonal na polia|rotacao_tronco|abdomen|ombro_ant|polia_ajustavel|Composto|Intermediário|Ajuste a polia à altura adequada e afaste-se para criar tensão leve.|Gire o tronco em diagonal envolvendo quadril e tórax de forma coordenada.|Retorne devagar, sem torcer somente a coluna lombar.
sandbag_agachamento|Agachamento com saco de areia|agachar|quadriceps|gluteos+abdomen|sandbag|Composto|Todos|Segure o saco de areia próximo ao peito com os pés estáveis.|Flexione quadril e joelhos mantendo a carga perto do corpo.|Suba com controle mantendo o tronco ereto.
sandbag_terra|Levantamento terra com saco de areia|levantar_carga|gluteos|posterior+quadriceps|sandbag|Composto|Todos|Posicione o saco no chão entre os pés e aproxime o quadril da carga.|Erga o saco com o tronco estável e a carga próxima ao corpo.|Desça flexionando quadril e joelhos, sem arredondar excessivamente as costas.
agach_anilha|Agachamento com anilha à frente do peito|agachar|quadriceps|gluteos+abdomen|weight_plate|Composto|Todos|Segure a anilha junto ao peito e mantenha os pés firmes.|Agache com joelhos alinhados e coluna organizada.|Levante controladamente sem afastar a carga do corpo.
remada_baixa_triangulo|Remada baixa com pegador triangular|remar_horizontal|costas|biceps|row_seated+v_handle|Composto|Todos|Conecte o puxador triangular ao cabo da remada baixa e sente-se de modo estável.|Puxe o triângulo em direção ao abdômen com ombros relaxados.|Retorne os braços lentamente sem arredondar excessivamente a coluna.
coice_polia_tornozeleira|Coice de glúteo com tornozeleira na polia|extensao_quadril_isolada|gluteos|posterior|polia_baixa+ankle_strap|Isolador|Todos|Conecte uma tornozeleira adequada à polia baixa e segure apoio firme.|Leve a perna para trás estendendo o quadril sem arquear a lombar.|Retorne devagar sem usar balanço do tronco.
pallof_elastico|Pallof press com elástico|anti_rotacao|abdomen|ombro_ant|elastico|Isométrico|Todos|Fixe a faixa elástica a um ponto seguro e fique de lado para a âncora.|Estenda os braços à frente resistindo à tendência de girar o tronco.|Traga as mãos de volta ao peito com controle.
'''.strip().splitlines()
new=[]
for line in exercises:
    parts=[x.strip() for x in line.split('|')]
    if len(parts)!=11:raise AssertionError((len(parts),parts[:4]))
    id,name,pattern,primary,secondary,kit,kind,level,prep,move,ret=parts
    setups=[[v.strip() for v in group.split('+')] for group in kit.split(';')]
    new.append(dict(id=id,name=name,primary=primary.split('+'),secondary=secondary.split('+') if secondary else [],pattern=pattern,kind=kind,level=level,setups=setups,steps=[prep,move,ret]))
base['patterns']+= [{'id':'extensao_punho','name':'Extensão do punho'},{'id':'flexao_ombro','name':'Flexão do ombro'},{'id':'anti_extensao','name':'Resistência à extensão do tronco'}]
existing_ex={e['id'] for e in base['exercises']};existing_eq={e['id'] for e in base['equipment']}
for e in new:
  assert e['id'] not in existing_ex,e['id']
  assert e['pattern'] in {p['id'] for p in base['patterns']},e
  assert all(q in existing_eq for kit in e['setups'] for q in kit),e
base['exercises']+=new
base['version']='1.2.0-beta.1'
base['note']='Catálogo editorial demonstrativo; não substitui avaliação profissional. A equivalência de substituições ainda está em revisão biomecânica. Ocupação da academia é marcada manualmente.'
path.write_text('window.FITSWAP_DATA = '+json.dumps(base,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('AMPLIADO: '+str(len(base['equipment']))+' equipamentos / '+str(len(base['exercises']))+' exercícios / '+str(len(base['patterns']))+' padrões')
print('NOVOS: '+str(len(rows))+' equipamentos, '+str(len(new))+' exercícios')
print('APARELHOS SEM EXERCÍCIO: '+str([q['id'] for q in base['equipment'] if not any(q['id'] in sum(e['setups'],[]) for e in base['exercises'])]))
