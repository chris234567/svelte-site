import 'cross-fetch/polyfill'
import marked from 'marked'

function prefixSlug(obj, prefix) {
  obj.slug = prefix + obj.slug
  return obj
}

export const gqlFetch = async (uri, query) => {
  const response = await fetch(uri, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({ query }),
  })
  const { data, error } = await response.json()
  if (error) console.error(error)
  return data
}

const chaptersQuery = `{
  chapters: chapterCollection(where: { active: true }) {
    items {
      title
      slug
      coords {
        lat
        lng: lon
      }
    }
  }
}`

export async function fetchChapters(uri) {
  const { chapters } = await gqlFetch(uri, chaptersQuery)
  return chapters?.items?.map((chapter) => prefixSlug(chapter, `standorte/`))
}

const pageQuery = (slug) => `{
  pages: pageCollection
  ${slug ? `(where: {slug: "${slug}"})` : ``} {
    items {
      title
      subtitle
      slug
      body
      toc
      caption
      cover {
        description
        url
        width
        height
      }
      sys {
        publishedAt
      }
    }
  }
}`

function parseMd(page) {
  if (!page?.body) return
  page.body = marked(page.body) // generate HTML
  page.plainBody = page.body.replace(/<[^>]*>/g, ``) // strip HTML tags to get plain text
  return page
}

export async function fetchPage(slug, uri) {
  const data = await gqlFetch(uri, pageQuery(slug))
  const page = data?.pages?.items[0]
  return parseMd(page)
}

export async function fetchPages(uri) {
  const data = await gqlFetch(uri, pageQuery())
  return data?.pages?.items?.map(parseMd)
}

const postQuery = (slug) => `{
  posts: contentType2WKn6YEnZewu2ScCkus4AsCollection
  ${slug ? `(where: {slug: "${slug}"})` : ``} {
    items {
      title
      slug
      date
      body
      cover {
        description
        url
        width
        height
      }
      tags: tagsCollection {
        items {
          title
        }
      }
      author {
        name
        email
        url
        bio
        fieldOfStudy
        photo {
          title
          description
          url
        }
      }
    }
  }
}`

function processPost(post) {
  post.tags = post.tags.items.map((tag) => tag.title)
  parseMd(post)
  prefixSlug(post, `blog/`)
  return post
}

export async function fetchPost(slug, uri) {
  const data = await gqlFetch(uri, postQuery(slug))
  const post = data?.posts?.items[0]
  return processPost(post)
}

export async function fetchPosts(uri) {
  const data = await gqlFetch(uri, postQuery())
  const posts = data?.posts?.items
  return posts.map(processPost)
}

const jsonQuery = (title) => `{
  json: jsonCollection(where: {title: "${title}"}) {
    items {
      data
    }
  }
}`

export async function fetchJson(title, uri) {
  const data = await gqlFetch(uri, jsonQuery(title))
  return data?.json?.items[0]?.data
}

const tagsQuery = `{
  tags:  contentType5KMiN6YPvi42IcqAuqmcQeCollection(order: title_ASC) {
    items {
      title
      linkedFrom {
        entryCollection {
          total
        }
      }
      icon {
        url
      }
    }
  }
}
`

function processTag(tag) {
  const { total } = tag?.linkedFrom?.entryCollection
  tag.total = total
  delete tag?.linkedFrom
  return tag
}

export async function fetchTags(uri) {
  const { tags } = await gqlFetch(uri, tagsQuery)
  return tags?.items.map(processTag)
}
