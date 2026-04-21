import FormData from 'form-data';

export async function publishZipToNetlify({ zipBuffer, siteId, token, branch }) {
  if (!siteId) throw new Error('Missing netlify siteId');
  if (!token) throw new Error('Missing netlify token');

  // Netlify API for deploy-by-zip:
  // POST /api/v1/sites/{site_id}/builds
  // with multipart field `zip`.
  const url = `https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/builds`;

  const form = new FormData();
  form.append('zip', zipBuffer, {
    filename: 'site.zip',
    contentType: 'application/zip',
  });
  if (branch) form.append('branch', branch);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || 'Netlify publish failed';
    const details = data?.errors ? JSON.stringify(data.errors) : undefined;
    throw new Error(details ? `${msg}: ${details}` : msg);
  }
  return data;
}

