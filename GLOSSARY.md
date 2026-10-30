# Sigga++

Extensão que encurta caminhos e ajusta telas do SIGAA da UFC, com foco no trabalho do docente.

## Acesso

**Vínculo**:
Uma relação do usuário com a universidade (ex.: servidor, discente) escolhida ao entrar no SIGAA; vínculos encerrados (inativos) continuam sendo vínculos.
_Avoid_: Perfil, papel

**Vínculo favorito**:
O vínculo em que o usuário entra automaticamente ao fazer login.
_Avoid_: Vínculo padrão, vínculo preferido

## Turmas e frequência

**Turma**:
A turma virtual de um componente curricular, onde o docente acompanha alunos e aulas.
_Avoid_: Disciplina, classe

**Subturma**:
Uma divisão de uma turma; o SIGAA exige escolher uma antes da chamada, mesmo quando só existe uma.
_Avoid_: Grupo, seção

**Data de aula**:
Um dia do calendário da turma em que há aula e, portanto, chamada; uma turma tem no máximo uma aula por dia.
_Avoid_: Dia letivo, encontro

**Tópico de aula**:
Um assunto da turma planejado pelo docente para um período (início e fim) e exibido na página da turma.
_Avoid_: Conteúdo programado (é o nome da tela que lista os tópicos), aula

**Material**:
Um arquivo, tarefa, fórum ou outro recurso vinculado a um tópico de aula; deixa de existir quando o tópico é removido.
_Avoid_: Anexo, recurso

**Chamada**:
O registro de presença dos alunos de uma turma em uma data de aula.
_Avoid_: Lançar frequência, frequência (para o ato), presença
