# Remoção de tópicos de aula em lote por requisições em segundo plano

Na tela Conteúdo Programado, o SIGAA remove um tópico de aula por vez, e cada remoção recarrega a página. Para remover vários, a extensão envia em segundo plano, um após o outro, os mesmos POSTs que o clique na lixeira enviaria. A cada resposta (a própria tela Conteúdo Programado), ela lê o ViewState e os links de exclusão atualizados para a remoção seguinte. A página recarrega uma única vez, no final, porque o docente não deve ver uma atualização por item.

## Considered Options

- **Fila entre recarregamentos:** guardar os pendentes no `sessionStorage` e clicar na lixeira do próximo a cada recarregamento, como a intenção da chamada faz. Seria mais resistente a mudanças no SIGAA, por usar o mesmo clique do docente, mas mostraria um recarregamento por tópico. Foi rejeitada por isso.

## Consequences

- O código depende do formato do `jsfcljs` (formulário, id do link e parâmetro `id` do tópico) e do ViewState guardado no servidor. Se o SIGAA mudar isso, a remoção em lote quebra, e a remoção comum pela lixeira continua funcionando.
- Uma falha ou interrupção no meio do lote deixa uma remoção parcial. Os tópicos já removidos não voltam, e o resumo exibido após o recarregamento diz quantos foram removidos.
