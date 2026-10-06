/** Dados estruturados (schema.org) para o Google */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // O conteúdo vem do próprio servidor; o replace impede fechar a tag <script> por engano
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  );
}
