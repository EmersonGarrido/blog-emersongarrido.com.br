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

Para cada post em rascunho, faça uma **revisão completa de português** (não só acentos):

#### Gramática e Ortografia
- **Acentuação:** Corrigir acentos (tô, tá, não, etc.)
- **Concordância:** Verificar concordância verbal e nominal
- **Regência:** Corrigir erros como "da onde" → "de onde"
- **Pontuação:** Vírgulas, pontos, reticências no lugar certo

#### Estrutura e Clareza
- **Frases mal construídas:** Reformular frases confusas ou truncadas
- **Conexão de ideias:** Garantir que o texto flui bem
- **Parágrafos:** Manter 2-4 frases, não fragmentar demais

#### Tom e Autenticidade
- **Tom de voz:** O texto está conversacional e direto?
- **Linguagem:** Usa "tô", "pra", "pro" em vez de formas formais?
- **Autenticidade:** O texto soa como o Emerson (honesto, vulnerável, reflexivo)?

**IMPORTANTE:** Aplicar as correções diretamente no banco, não apenas listar. A revisão deve resultar em texto pronto pra publicar.

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

### 5. Verificar e Atribuir Categorias

Todo post DEVE ter pelo menos uma categoria. Verifique as categorias existentes:

```sql
SELECT id, name, slug FROM categories ORDER BY name;
```

Categorias atuais: `diário`, `família`, `reflexões`, `saúde mental`

Para atribuir categoria a um post:

```sql
INSERT INTO post_categories (post_id, category_id) VALUES ([ID_DO_POST], [ID_DA_CATEGORIA]);
```

Se nenhuma categoria existente se encaixa, crie uma nova:

```sql
INSERT INTO categories (name, slug, color) VALUES ('nome da categoria', 'slug-da-categoria', '#6b7280');
```

### 6. Marcar como Revisado pela IA

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
