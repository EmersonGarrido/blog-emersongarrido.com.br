/* eslint-disable prettier/prettier */
export function getStrapiURL(path = "") {
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    "https://api-blog.emersongarrido.com.br"
  }${path}`;
}

export async function fetchAPI(path: string) {
  const requestUrl = getStrapiURL(path);
  const response = await fetch(requestUrl, {
    headers: new Headers({
      Authorization:
        "Bearer 28cb22755d1136c3ac47a1ec94544054c85ed70fe37460a9ef3dddc8f9120f8f480c853d3c324ab6c647bd2da150031de3121aaf57e430bdf218f80b5e1e8cddf8a066b89b09372288f8f45798315f84b73804a48c04d0d4c28169601a987b6c9d2f49f8465d9d03741b73cf476bb6476492b7cd1bcbb9c7f27dc756cdd0db4b",
    }),
  });
  const data = await response.json();
  return data;
}
