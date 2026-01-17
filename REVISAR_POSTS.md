# Instruções para Revisão de Posts do Blog

Este arquivo contém as instruções para o Claude revisar posts em rascunho do blog.

## Contexto

- **Banco de dados:** PostgreSQL (Neon) - credenciais em `.env.local`
- **Tabela de posts:** `posts`
- **Posts em rascunho:** `published = false`
- **Campo de revisão IA:** `ai_reviewed` (boolean)

## Passos para Revisão

### 1. Buscar o Estilo de Escrita

Primeiro, busque o guia de estilo nas configurações:

```sql
SELECT value FROM settings WHERE key = 'writing_style';
```

Este guia contém as regras de tom de voz, estrutura de texto e linguagem que o Emerson usa.

### 2. Listar Posts em Rascunho

Busque os posts que ainda não foram publicados:

```sql
SELECT id, title, slug, excerpt, content, ai_reviewed
FROM posts
WHERE published = false
ORDER BY created_at DESC;
```

### 3. Revisar o Conteúdo

Para cada post em rascunho, analise:

- **Tom de voz:** O texto está conversacional e direto?
- **Estrutura:** Parágrafos com 2-4 frases? Frases conectadas com vírgulas?
- **Linguagem:** Usa "tô", "pra", "pro" em vez de formas formais?
- **Autenticidade:** O texto soa como o Emerson (honesto, vulnerável, reflexivo)?
- **Clareza:** As ideias estão claras e fluem bem?
- **Gramática:** Há erros gramaticais graves?

### 4. Fornecer Feedback

Apresente o feedback de forma estruturada:

```
## Post: [Título do Post]

### Pontos Positivos
- ...

### Sugestões de Melhoria
- ...

### Correções Necessárias
- ...

### Sugestão de Reescrita (se necessário)
[Trecho original] → [Trecho sugerido]
```

### 5. Marcar como Revisado pela IA

Após revisar, atualize o campo `ai_reviewed`:

```sql
UPDATE posts SET ai_reviewed = true WHERE id = [ID_DO_POST];
```

## Conexão com o Banco

Use a DATABASE_URL do arquivo `.env.local` para conectar. O formato é:

```
postgres://user:password@host/database?sslmode=require
```

## Exemplo de Uso

Quando o usuário disser "revise meus posts" ou "revisa os rascunhos", siga este fluxo:

1. Conecte ao banco usando as credenciais do `.env.local`
2. Busque o estilo de escrita
3. Liste os posts em rascunho (onde `published = false`)
4. Para cada post não revisado (`ai_reviewed = false`):
   - Leia o conteúdo completo
   - Compare com o guia de estilo
   - Forneça feedback detalhado
   - Marque como `ai_reviewed = true`

## Notas Importantes

- Apenas revise posts em rascunho (`published = false`)
- Respeite a voz autêntica do Emerson - não transforme em texto genérico
- Foque em melhorias sutis, não em reescritas completas
- Se o post já está bom, diga isso - não force mudanças desnecessárias
