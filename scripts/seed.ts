import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '..', '.env.local') });

const supabaseUrl = 'https://cxmumqgcroayesfzeqxs.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedPost {
  title: string;
  author: string;
  description?: string;
  image?: string;
}

async function seed() {
  console.log('Reading seed.json...');
  const raw = readFileSync(resolve(__dirname, '..', 'seed.json'), 'utf-8');
  const { posts }: { posts: SeedPost[] } = JSON.parse(raw);
  console.log(`Loaded ${posts.length} posts`);

  // 1. Collect unique authors
  const authors = [...new Set(posts.map((p) => p.author))];
  console.log(`Found ${authors.length} unique authors`);

  // 2. Create auth users + profiles
  const authorIdMap = new Map<string, string>();

  for (const name of authors) {
    const email = `${name.toLowerCase()}@snowball.seed`;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: 'seed-password-123',
      email_confirm: true,
      user_metadata: { username: name },
    });
    if (error) {
      console.error(`Failed to create user ${name}:`, error.message);
      continue;
    }
    authorIdMap.set(name, data.user.id);
    console.log(`Created user: ${name} (${data.user.id})`);
  }

  // 3. Profiles are auto-created by the on_auth_user_created trigger
  console.log(`Created ${authorIdMap.size} users (profiles auto-created by trigger)`);

  // 4. Batch insert posts (1000 at a time)
  const BATCH_SIZE = 1000;
  let inserted = 0;

  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE).map((p) => ({
      user_id: authorIdMap.get(p.author)!,
      title: p.title,
      description: p.description ?? null,
      image_url: p.image ?? null,
    }));

    const { error } = await supabase.from('posts').insert(batch);
    if (error) {
      console.error(`Failed at batch ${i / BATCH_SIZE}:`, error.message);
      continue;
    }
    inserted += batch.length;
    console.log(`Inserted ${inserted} / ${posts.length} posts`);
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
