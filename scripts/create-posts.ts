import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables manually
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim()
  }
})

const sql = neon(process.env.DATABASE_URL!)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const posts = [
  {
    title: 'Ocupar a cabeça ajuda',
    excerpt: 'Nem imaginava que construir algo criativo podia aliviar um pouco o peso',
    content: `Tô chegando numa versão até que legal desse blog, e o mais interessante é que nem imaginava que isso ia me fazer bem. Colocar pra fora tudo que tô passando, documentar o que sinto, e ainda ocupar a cabeça com código... tá me ajudando mais do que eu esperava.

Não é que a programação seja uma cura ou algo do tipo, longe disso. Mas quando você tá numa fase onde tudo parece pesado demais, ter algo criativo pra se dedicar faz diferença. É quase como se por algumas horas eu conseguisse esquecer que existe um mundo lá fora me esperando com todas as suas cobranças.

O engraçado é que passei anos criando sistemas pra outros, resolvendo problemas de empresas, e nunca tinha feito algo assim... só pra mim, sem prazo, sem cliente enchendo o saco, sem precisar entregar nada pra ninguém. Talvez seja isso que tava faltando, criar por criar, sem obrigação.

Não sei quanto tempo essa sensação vai durar, mas por enquanto tô aproveitando.`,
    categoryKeywords: ['reflexao', 'reflexões', 'reflexoes', 'pessoal', 'diario', 'diário']
  },
  {
    title: 'O vazio de ter',
    excerpt: 'Tenho bens, mas no fundo a conta não fecha',
    content: `Financeiramente não tô tão bem quanto parece... bom, digamos que tenho algumas casas, carros, alguns bens que fui juntando ao longo dos anos. Olhando de fora parece que tá tudo ótimo, né? Mas no fundo, no fundo, não tá assim não.

Se eu vender tudo talvez consiga me aposentar, sei lá... ao menos descansar a cabeça por um tempo, viver de renda, criar algo pra ir levando. Parece um plano razoável quando você escreve assim. Mas aí vem aquela pergunta que não sai da minha cabeça: curtir o quê, sozinho? Trabalhar com qual propósito? Dinheiro? Só isso?

A vida não deveria ser feita só disso, ou eu tô vivendo completamente errado esse tempo todo. Passei anos acumulando coisas achando que em algum momento isso ia fazer sentido, que ia chegar num ponto onde eu poderia parar e dizer "pronto, consegui". Mas consegui o quê exatamente?

Ter coisas não preenche nada quando você não tem com quem dividir, não tem um porquê. É só... ter. E ter por ter é um vazio disfarçado de conquista.`,
    categoryKeywords: ['reflexao', 'reflexões', 'reflexoes', 'pessoal', 'diario', 'diário', 'financeiro', 'finanças']
  },
  {
    title: 'Pra quê ser bom em algo?',
    excerpt: 'Anos estudando e trabalhando, mas a pergunta continua: por quê?',
    content: `Me dediquei tantos anos estudando e trabalhando pra ser bom no que faço. Noites viradas, cursos, certificações, projetos, clientes difíceis, problemas complexos... tudo aquilo que falam que você precisa fazer pra "vencer na vida". E eu fiz, fiz tudo certinho.

Porém pra quê? Por quê?

Essa pergunta não sai da minha cabeça ultimamente. Não vejo mais sentido na vida ou nas coisas que faço, tô apenas vivendo por viver. Acordando, trabalhando, dormindo, repetindo. Deixando problemas de lado sem resolver nada importante, empurrando com a barriga como se algum dia as coisas fossem se resolver sozinhas.

O mais bizarro é que se você me perguntar o que eu quero, eu não sei responder. Perdi isso em algum momento do caminho. Tava tão focado em ser competente, em entregar resultado, em ser "o cara" que resolve qualquer coisa... que esqueci de me perguntar se era isso mesmo que eu queria fazer da vida.

Talvez a resposta seja que não existe um propósito maior, e a gente só inventa um pra conseguir levantar da cama todo dia. Ou talvez eu só esteja cansado demais pra enxergar alguma coisa agora.`,
    categoryKeywords: ['reflexao', 'reflexões', 'reflexoes', 'pessoal', 'diario', 'diário', 'carreira', 'trabalho']
  }
]

async function main() {
  console.log('Buscando categorias...')

  const categories = await sql`SELECT id, name, slug FROM categories ORDER BY name`
  console.log('Categorias encontradas:', categories.map(c => `${c.name} (${c.slug})`).join(', '))

  for (const post of posts) {
    const slug = slugify(post.title)

    // Check if already exists
    const existing = await sql`SELECT id FROM posts WHERE slug = ${slug}`
    if (existing.length > 0) {
      console.log(`⏭️  Post "${post.title}" já existe, pulando...`)
      continue
    }

    // Find matching categories
    const matchingCategories = categories.filter(cat =>
      post.categoryKeywords.some(keyword =>
        cat.slug.includes(keyword) || cat.name.toLowerCase().includes(keyword)
      )
    )

    console.log(`\n📝 Criando post: "${post.title}"`)
    console.log(`   Slug: ${slug}`)
    console.log(`   Categorias: ${matchingCategories.length > 0 ? matchingCategories.map(c => c.name).join(', ') : 'nenhuma encontrada'}`)

    // Create post as draft (published = false)
    const result = await sql`
      INSERT INTO posts (slug, title, excerpt, content, published, published_at, created_at)
      VALUES (${slug}, ${post.title}, ${post.excerpt}, ${post.content}, false, NULL, NOW())
      RETURNING id
    `

    const postId = result[0].id

    // Add categories
    for (const cat of matchingCategories) {
      await sql`
        INSERT INTO post_categories (post_id, category_id)
        VALUES (${postId}, ${cat.id})
        ON CONFLICT DO NOTHING
      `
    }

    console.log(`   ✅ Criado com ID: ${postId}`)
  }

  console.log('\n🎉 Pronto! Posts criados como rascunho.')
  console.log('Acesse o admin para revisar e publicar.')
}

main().catch(console.error)
