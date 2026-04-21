import archiver from 'archiver';

export async function zipToBuffer(files) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks = [];

  archive.on('data', (d) => chunks.push(Buffer.from(d)));

  const done = new Promise((resolve, reject) => {
    archive.on('error', (err) => reject(err));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
  });

  for (const [name, content] of Object.entries(files)) {
    archive.append(content, { name });
  }

  archive.finalize();
  return done;
}

