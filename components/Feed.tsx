import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image, ImageLoadEventData } from 'expo-image';
import { supabase } from '../lib/supabase';

function PostImage({ uri }: { uri: string }) {
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  const onLoad = (e: ImageLoadEventData) => {
    const { width, height } = e.source;
    if (width && height) {
      setAspectRatio(width / height);
    }
  };

  return (
    <View style={styles.imageWrapper}>
      <Image
        source={{ uri }}
        style={[styles.image, { aspectRatio }]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        onLoad={onLoad}
      />
    </View>
  );
}

interface PostRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  profiles: { username: string } | null;
}

interface Post {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  username: string;
}

const PAGE_SIZE = 20;


export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.username) setUsername(data.username);
          });
      }
    });
  }, []);

  const fetchPosts = useCallback(async (fromStart = true) => {
    if (fromStart && posts.length === 0) {
      setLoading(true);
    } else if (!fromStart) {
      setLoadingMore(true);
    }

    let query = supabase
      .from('posts')
      .select('id, title, description, image_url, created_at, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (!fromStart && posts.length > 0) {
      query = query.lt('created_at', posts[posts.length - 1].created_at);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      const fetched = ((data ?? []) as unknown as PostRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        image_url: row.image_url,
        created_at: row.created_at,
        username: row.profiles?.username ?? 'Unknown',
      }));
      if (fromStart) {
        setPosts(fetched);
      } else {
        setPosts((prev) => [...prev, ...fetched]);
      }
      setHasMore(fetched.length === PAGE_SIZE);
    }

    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, [posts]);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(true);
  };

  const onEndReached = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.author}>{item.username}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}
        {item.image_url ? (
          <PostImage uri={item.image_url} />
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFBE0B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.welcomeContainer}>
            {username ? (
              <>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.usernameText}>{username}!</Text>
              </>
            ) : (
              <Text style={styles.welcomeText}>Welcome!</Text>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFBE0B"
            colors={["#FFBE0B"]}
            progressBackgroundColor="#181A20"
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color="#FFBE0B" />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContainer: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  usernameText: {
    color: '#FFBE0B',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  author: {
    color: '#FFBE0B',
    fontWeight: '700',
    fontSize: 15,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    color: '#B0B3B8',
    fontSize: 14,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    borderRadius: 12,
  },
  imageWrapper: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footer: {
    paddingVertical: 20,
  },
  emptyText: {
    color: '#B0B3B8',
    fontSize: 16,
  },
});
